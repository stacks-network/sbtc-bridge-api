import { fetchAddressTransactions } from "../../lib/bitcoin/api_mempool.js"
import { getConfig } from "../../lib/config.js"
import { getDaoConfig } from "../../lib/config_dao.js";
import { getDaoMongoConfig } from "../../lib/data/db_models.js";
import { VoteEvent } from "../../types/stxeco_type.js";
import { findPoolStackerEventsByHashBytesAndEvent } from "../pox/pool_stacker_events_helper.js";
import { extractAllPoxEntriesInCycle, findPoxEntriesByAddress, getAddressFromHashBytes, getHashBytesFromAddress } from "../pox/pox_helper.js";
import { soloStackerAddresses } from "./solo_pool_addresses.js"
import { NAKAMOTO_VOTE_START_HEIGHT, findVotesByProposalAndMethod, saveOrUpdateVote, saveVote, updateVote } from "./vote_count_helper.js";


/**
 * Step 1: Fetch voting transactions and store in mongodb
 */
export async function getSoloTxs():Promise<{ soloTxsNo, soloTxsYes }> {
  const addresses = soloStackerAddresses(getConfig().network)
  const soloTxsYes = await fetchAddressTransactions(addresses.yAddress);
  const soloTxsNo = await fetchAddressTransactions(addresses.nAddress);
  await addToMongoDB(soloTxsYes, true)
  await addToMongoDB(soloTxsNo, false)
  return { soloTxsNo, soloTxsYes };
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
      try{
        updateVote(v, {amount: result.total, poxStacker: result.poxStacker })
      } catch(err:any) {
        console.error('reconcileSoloTxs: error saving: ' + err.message)
      }
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
  let total = 0
  let poxStacker:string;
  let amount1 = 0
  let amount2 = 0
  if (poxEntries1 && poxEntries1.length > 0) {
    for (const entry of poxEntries1) {
      amount1 += entry.poxStackerInfo?.totalStacked || 0
      poxStacker = entry.stacker
    }
    for (const entry of poxEntries2) {
      amount2 += entry.poxStackerInfo?.totalStacked || 0
      poxStacker = entry.stacker
    }
    total = Math.floor((amount1 + amount2) / 2)
    console.log('setSoloVotes: poxEntries: ' + total + ' for address: ' + bitcoinAddress)
  }
  return { total, poxStacker}
}

async function addToMongoDB(txs:Array<any>, vfor:boolean):Promise<Array<VoteEvent>> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votingCid = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION
  let votes:Array<VoteEvent> = []
  for (const v of txs) {
    try {
      const bitcoinAddress = v.vin[0].prevout.scriptpubkey_address;
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
        poxStacker: result.poxStacker
        //await getBurnBlockHeight(v.block_height),
      }
      await saveVote(potVote)
      votes.push(potVote)
      console.log('setSoloVotes: solo vote: ' + potVote.voter + ' for: ' + potVote.for + ' amount: ' + potVote.amount)
    } catch (err:any) {
      console.log('addToMongoDB: solo vote: ' + err.message)
    }
  }
  return votes;
}

