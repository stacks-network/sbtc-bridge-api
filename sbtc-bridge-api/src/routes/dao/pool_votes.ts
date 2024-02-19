import { getConfig } from "../../lib/config.js"
import { ProposalEvent, VoteEvent } from "../../types/stxeco_type.js"
import { poolStackerAddresses } from "./solo_pool_addresses.js"
import { findProposalByContractId, getDaoMongoConfig } from "../../lib/data/db_models.js"
import { getBurnBlockHeight, getBurnBlockHeightFromHash } from "./dao_helper.js"
import { getDaoConfig } from "../../lib/config_dao.js"
import { findPoolStackerEventsByStacker, findPoolStackerEventsByStackerAndEvent } from "../pox/pool_stacker_events_helper.js"
import { NAKAMOTO_VOTE_START_HEIGHT, NAKAMOTO_VOTE_STOPS_HEIGHT, findVotesByProposalAndMethod, saveOrUpdateVote, updateVote } from "./vote_count_helper.js"

const limit = 50 ;

export async function getPoolTxs():Promise<{poolTxsYes , poolTxsNo}> {
  const addresses = poolStackerAddresses(getConfig().network)
  let poolTxsYes:Array<VoteEvent> = []
  let poolTxsNo:Array<VoteEvent> = []
  let offset = 0; //await countContractEvents();
  let events:any;
  do {
    events = await getPoolVotes(offset, addresses.yAddress);
    if (events && events.results.length > 0) poolTxsYes = poolTxsYes.concat(events.results)
    offset += limit;
  } while (events.results.length > 0);
  do {
    events = await getPoolVotes(offset, addresses.nAddress);
    if (events && events.results.length > 0) poolTxsNo = poolTxsNo.concat(events.results)
    offset += limit;
  } while (events.results.length > 0);
  addToMongoDB(poolTxsYes, true)
  addToMongoDB(poolTxsNo, false)

  return {poolTxsYes , poolTxsNo};
}
async function addToMongoDB(txs:Array<any>, vfor:boolean):Promise<Array<VoteEvent>> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votingCid = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION
  let votes:Array<VoteEvent> = []
  for (const v of txs) {
    const burnBlockHeight = await getBurnBlockHeight(v.block_height)
    const potVote:any = {
      amount: 0,
      for: vfor,
      proposal: proposalCid,
      submitTxId: v.tx_id,
      event: 'pool-vote',
      votingContractId: votingCid,
      voter: v.sender_address,
      blockHeight: v.block_height,
      burnBlockHeight
    }
    console.log('setSoloVotes: potVote:', potVote)
    saveOrUpdateVote(potVote)
    votes.push(potVote)
  }
  return votes;
}


export async function reconcilePoolTxs():Promise<any> {
    try {
      const proposalCid = (await getDaoMongoConfig()).contractId
      const votesAll:Array<VoteEvent> = await findVotesByProposalAndMethod(proposalCid, 'pool-vote');
      const votes:Array<VoteEvent> = votesAll.slice(0,7)
      let offset = 0; //await countContractEvents();
      for (const voteTx of votesAll) {
        //const voted = votes.filter((o) => o.voter === voteTx.sender_address)
        //console.log('reconcilePoolTxs: vote: ', voteTx)
        //if (!voted || voted.length === 0) {
        if (voteTx.voter && isVoteAllowed(voteTx, voteTx.voter, voteTx.burnBlockHeight)) {
          let updates:any;
          const stackerEvents = await findPoolStackerEventsByStackerAndEvent(voteTx.voter, 'delegate-stx');
          if (stackerEvents && stackerEvents.length > 0) {
            console.log('reconcilePoolTxs: stackerEvents: ' + stackerEvents.length)
            try {
              let event = stackerEvents.find((o) => o.burnchainUnlockHeight === 0)
              if (!event) event = stackerEvents[0]
              updates = {
                delegateTo: event.data.delegator,
                delegateTxId: event.submitTxId,
                amount: (event.data.amountUstx) ? event.data.amountUstx : 0,
              }
              await updateVote(voteTx, updates)
              console.log('reconcilePoolTxs: updated: ' + voteTx.event + ' : ' + voteTx.voter + ' : ' + voteTx.amount)
            } catch(err:any) {
              console.log('reconcilePoolTxs: error: getting first amount + ', stackerEvents)
            }
          } else {
            console.log('reconcilePoolTxs: stackerEvents: not found for ' + voteTx.voter + ' : delegate-stx')
          }
        } else {
          console.log('reconcilePoolTxs: rejected: vote: ' + voteTx.voter + ' offset: ' + offset)
        }
      }
      return;
    } catch (err:any) {
      console.log('err reconcilePoolTxs: ' + err);
      return [];
    }
  }

  function isVoteAllowed(v:any, principle:string, burnBlockHeight:number) {
    return v.voter === principle //&& burnBlockHeight >= NAKAMOTO_VOTE_START_HEIGHT && burnBlockHeight < NAKAMOTO_VOTE_STOPS_HEIGHT
  }

  async function getPoolVotes(offset:number, principle:string):Promise<any> {
    const url = getConfig().stacksApi + '/extended/v1/address/' + principle + '/transactions?limit=' + limit + '&offset=' + offset;
    let val;
    try {
        const response = await fetch(url)
        val = await response.json();
    } catch (err) {
        console.log('getPoolYesVotes: ', err);
    }
    return val;
  }