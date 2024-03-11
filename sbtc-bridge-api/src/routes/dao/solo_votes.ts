import { fetchAddressTransactions, fetchAddressTransactionsMin, fetchTransaction } from "../../lib/bitcoin/api_mempool.js"
import { getConfig } from "../../lib/config.js"
import { getDaoConfig } from "../../lib/config_dao.js";
import { getDaoMongoConfig } from "../../lib/data/db_models.js";
import { VoteEvent } from "../../types/stxeco_type.js";
import { findPoolStackerEventsByHashBytesAndEvent } from "../pox/pool_stacker_events_helper.js";
import { extractAllPoxEntriesInCycle, findPoxEntriesByAddressAndCycle, getAddressFromHashBytes, getHashBytesFromAddress } from "../pox/pox_helper.js";
import { soloStackerAddresses } from "./solo_pool_addresses.js"
import { findVotesByProposalAndMethod, findVotesBySoloZeroAmounts, saveOrUpdateVote, saveVote, updateVote } from "./vote_count_helper.js";


export async function readSoloVotes() {
  const addresses = soloStackerAddresses(getConfig().network)
  const soloTxsYes = await fetchAddressTransactions(addresses.yAddress);
  const soloTxsNo = await fetchAddressTransactions(addresses.nAddress);
  await addToMongoDB(soloTxsYes, true)
  await addToMongoDB(soloTxsNo, false)
  return;
}

export async function readSoloVote(bitcoinAddress) {
  let events1 = await extractAllPoxEntriesInCycle(bitcoinAddress, 78);
  events1 = events1.concat(await extractAllPoxEntriesInCycle(bitcoinAddress, 79));

  let poxEntries:Array<any> = await findPoxEntriesByAddressAndCycle(bitcoinAddress, 78);
  console.log('readSoloVote: ', poxEntries)
  poxEntries = poxEntries.concat(await findPoxEntriesByAddressAndCycle(bitcoinAddress, 79));
  console.log('readSoloVote: ', poxEntries)
  return events1
}

export async function readSoloZeroVote() {
  //const myTx = '1f62qrQaNsFyohrgEya8oby4Y9ti3FnM8'
  const votes:Array<VoteEvent> = await findVotesBySoloZeroAmounts();
  //const votes = votesAll.filter((o) => o.voter === myTx)
  //console.log('readSoloZeroVote: ', votes)
  const linkedVotes:Array<any> = []
  for (const vote of votes) {
    try {
      if (vote.voter && vote.voter !== 'unknown') {
        const vcheck = linkedVotes.findIndex((o) => o.voter === vote.voter)
        if (vcheck === -1) {
          const addressTxs = await fetchAddressTransactionsMin(vote.voter)
          let feederTx = addressTxs[0]
          let feederAddress;// = feederTx.vin[0].prevout.scriptpubkey_address;
          let result = await determineTotalAverageUstx(feederAddress)
          if (result.total === 0 || feederAddress === vote.voter) {
            if (addressTxs.length > 1) {
              feederTx = addressTxs[1]
              feederAddress = feederTx.vin[0].prevout.scriptpubkey_address;
              result = await determineTotalAverageUstx(feederAddress)
            }
          }
          const newVote = updateVote(vote, {
            submitTxIdProxy: feederTx.txid,
            voterProxy: feederAddress,
            amount: result.total,
            amountNested: result.totalNested,
          })
          linkedVotes.push(newVote)
          console.log('readSoloZeroVote: feederAddress ' + feederAddress + ' vote.voter: ' + vote.voter + ' amount: ' + result.total)
        }
      }
    } catch(err:any) {
      console.log('readSoloZeroVote: error: ' + err.message)
    }
  }
  return linkedVotes
}

/**
 * Step 2: match votes to pox data
 */
export async function reconcileSoloTxs():Promise<any> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votesAll:Array<VoteEvent> = await findVotesByProposalAndMethod(proposalCid, 'solo-vote');
  console.log('setSoloVotes: pe1:', votesAll.length)
  for (const v of votesAll) {
    const bitcoinAddress = getAddressFromHashBytes(v.poxAddr.hashBytes, v.poxAddr.version)
    if (v.voter === bitcoinAddress) {
      const result = await determineTotalAverageUstx(bitcoinAddress)
      try {
        updateVote(v, {amount: result.total, amountNested: result.totalNested, poxStacker: result.poxStacker })
      } catch(err:any) {
        console.error('reconcileSoloTxs: error saving: ' + err.message)
      }
    } else {
      console.log('reconcileSoloTxs: address ' + v.voter + ' not pox address: ' + bitcoinAddress)
    }
    /**
    } else {
      // search for hash bytes in event data
      const events = await findPoolStackerEventsByHashBytesAndEvent(v.poxAddr.hashBytes, 'stack-stx')
      console.log('setSoloVotes: events:', events)
      let counter = 0
      let amount = 0
      if (events && events.length > 0) {
        for (const entry of events) {
          if (entry.data.unlockBurnHeight > NAKAMOTO_VOTE_START_HEIGHT) {
            counter++
            amount += entry.data.lockAmount
          }
          v.poxStacker = entry.stacker
        }
        v.amount = amount
        saveOrUpdateVote(v)
      }
      
    } */
  }
  return votesAll;
}

async function determineTotalAverageUstx(bitcoinAddress) {
  const poxEntries1 = await extractAllPoxEntriesInCycle(bitcoinAddress, 78)
  const poxEntries2 = await extractAllPoxEntriesInCycle(bitcoinAddress, 79)
  //const poxEntries1:Array<any> = await findPoxEntriesByAddressAndCycle(bitcoinAddress, 78);
  //const poxEntries2:Array<any> = await findPoxEntriesByAddressAndCycle(bitcoinAddress, 79);

  //console.log('determineTotalAverageUstx: poxEntries1: ', poxEntries1)
  //console.log('determineTotalAverageUstx: poxEntries2: ', poxEntries2)
  let total = 0
  let totalNested = 0
  let poxStacker:string;
  let amount1 = 0
  let amount2 = 0
  let amountNested1 = 0
  let amountNested2 = 0

  if (poxEntries1) {
    for (const entry of poxEntries1) {
      if (entry.poxStackerInfo) {
        amount1 += entry.totalUstx
        amountNested1 += (entry.poxStackerInfo?.totalStacked || 0)
      } else {
        amount1 += entry.totalUstx
      }
    }
  }
  if (poxEntries2) {
    for (const entry of poxEntries2) {
      if (entry.stacker) {
        amount2 += entry.totalUstx
        amountNested2 += (entry.poxStackerInfo?.totalStacked || 0)
      } else {
        amount2 += entry.totalUstx
      }
    }
  }
    //total = Math.max(amount1, amount2)
    total = Math.floor((amount1 + amount2) / 2)
    totalNested = total + Math.floor((amountNested1 + amountNested2) / 2)
    //console.log('setSoloVotes: poxEntries: ' + total + ' for address: ' + bitcoinAddress)
  return { total, totalNested, poxStacker }
}

async function addToMongoDB(txs:Array<any>, vfor:boolean):Promise<Array<VoteEvent>> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votingCid = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION
  let votes:Array<VoteEvent> = []
  for (const v of txs) {
    try {
      const bitcoinAddress = v.vin[0].prevout.scriptpubkey_address;
      const vcheck = votes.findIndex((o) => o.voter === bitcoinAddress)
      if (vcheck === -1) {
        const poxAddr = getHashBytesFromAddress(bitcoinAddress)
        const result = await determineTotalAverageUstx(bitcoinAddress)
  
        const potVote:any = {
          for: vfor,
          submitTxId: v.txid,
          event: 'solo-vote',
          proposalContractId: proposalCid,
          votingContractId: votingCid,
          poxAddr,
          voter: bitcoinAddress,
          burnBlockHeight: v.status.block_height,
          amount: result.total,
          amountNested: result.totalNested,
          poxStacker: result.poxStacker
          //await getBurnBlockHeight(v.block_height),
        }
        await saveVote(potVote)
        votes.push(potVote)
        console.log('setSoloVotes: solo vote: ' + potVote.voter + ' for: ' + potVote.for + ' amount: ' + potVote.amount)
      }
    } catch (err:any) {
      console.log('addToMongoDB: solo vote: ' + err.message)
    }
  }
  return votes;
}

