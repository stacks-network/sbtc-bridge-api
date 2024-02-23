import { fetchAddressTransactions } from "../../lib/bitcoin/api_mempool.js"
import { getConfig } from "../../lib/config.js"
import { getDaoConfig } from "../../lib/config_dao.js";
import { getDaoMongoConfig } from "../../lib/data/db_models.js";
import { VoteEvent } from "../../types/stxeco_type.js";
import { findPoolStackerEventsByHashBytesAndEvent } from "../pox/pool_stacker_events_helper.js";
import { findPoxEntriesByAddress, getAddressFromHashBytes, getHashBytesFromAddress } from "../pox/pox_helper.js";
import { soloStackerAddresses } from "./solo_pool_addresses.js"
import { NAKAMOTO_VOTE_START_HEIGHT, findVotesByProposalAndMethod, saveOrUpdateVote } from "./vote_count_helper.js";


/**
 * Step 1: Fetch voting transactions and store in mongodb
 */
export async function getSoloTxs():Promise<{ soloTxsNo, soloTxsYes }> {
  const addresses = soloStackerAddresses(getConfig().network)
  const soloTxsYes = await fetchAddressTransactions(addresses.yAddress);
  const soloTxsNo = await fetchAddressTransactions(addresses.nAddress);
  addToMongoDB(soloTxsYes, true)
  addToMongoDB(soloTxsNo, false)
  return { soloTxsNo, soloTxsYes };
}

/**
 * Step 2: match votes to pox data
 */
export async function reconcileSoloTxs(usePoxEntries:boolean):Promise<any> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votesAll:Array<VoteEvent> = await findVotesByProposalAndMethod(proposalCid, 'solo-vote');
  //const votes:Array<VoteEvent> = votesAll.slice(0,3)
  console.log('setSoloVotes: pe1:', votesAll.length)
  for (const v of votesAll) {
    if (usePoxEntries) {
      const poxEntries = await findPoxEntriesByAddress(getAddressFromHashBytes(v.poxAddr.hashBytes, v.poxAddr.version))
      console.log('setSoloVotes: poxEntries:' + poxEntries.length)
      if (poxEntries && poxEntries.length > 0) {
        let counter = 0
        let amount = 0
    
        for (const entry of poxEntries) {
          if (entry.cycle === 78 || entry.cycle === 79) {
            counter++
            amount += entry.totalUstx
          }
          v.poxStacker = entry.stacker
        }
        v.amount = Math.floor(amount / counter)
        //console.log('setSoloVotes: poxEntries:', v)
        saveOrUpdateVote(v)
      }
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
    }
  }
  return votesAll;
}


async function addToMongoDB(txs:Array<any>, vfor:boolean):Promise<Array<VoteEvent>> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votingCid = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION
  let votes:Array<VoteEvent> = []
  for (const v of txs) {
    const bitcoinAddress = v.vin[0].prevout.scriptpubkey_address;
    const poxAddr = getHashBytesFromAddress(bitcoinAddress)
    const potVote:any = {
      for: vfor,
      submitTxId: v.txid,
      event: 'solo-vote',
      proposalContractId: proposalCid,
      votingContractId: votingCid,
      poxAddr,
      voter: bitcoinAddress,
      burnBlockHeight: v.status.block_height, //await getBurnBlockHeight(v.block_height),
    }
    console.log('setSoloVotes: potVote:', potVote)
    saveOrUpdateVote(potVote)
    votes.push(potVote)
  }
  return votes;
}

