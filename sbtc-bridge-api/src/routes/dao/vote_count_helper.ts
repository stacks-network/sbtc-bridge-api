import { VoteEvent } from "../../types/stxeco_type.js"
import { getDaoMongoConfig, proposalVotes } from "../../lib/data/db_models.js"
import { getProposalFromContractId } from "./dao_helper.js"
import { getDaoConfig } from "../../lib/config_dao.js"

export const NAKAMOTO_VOTE_START_HEIGHT = 829750 + 100
export const NAKAMOTO_VOTE_STOPS_HEIGHT = 833950

/**
 * Strategy is..
 * 1. read votes from bitcoin (via mempool) and store in proposal-votes mongo collection 
 * 2. read rewardSlotHolders from hiro api ad store in mongo (note there are 37k ish not sure we need all of them)
 * 3. for given reward cycle iterate over get-reward-set-pox-address and store pox address, stacks address and ustx
 * 4. cross check the votes with the pox addresses
 */

export async function getSummary():Promise<any> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const p = await getProposalFromContractId(getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION, proposalCid)

  console.log('getSummary: ' + getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION)
//const soloFor = countsVotesByFilter({proposalContractId, for: true, event: 'solo-vote', amount: {$sum:1} })
  //const soloFor = proposalVotes.aggregate([{proposalContractId, for: true, event: 'solo-vote', $group: {sum_val:{$sum:"$amount"}}}]).toArray()
  const summaryWithZeros = await proposalVotes.aggregate([ { $group: {_id:{"event":"$event", "for":"$for"}, "total": {$sum: "$amount" }, count: {$sum:1} } } ]).toArray();
  
  const summary = await proposalVotes.aggregate([{$match: {amount: { $gt: 0 }}}, { $group: {_id:{"event":"$event", "for":"$for"}, "total": {$sum: "$amount" }, "totalNested": {$sum: "$amountNested" }, count: {$sum:1} } } ]).toArray();
  //const poolSummary = await proposalVotes.aggregate([ { $group: {_id:{"event":"pool-event", "for":"$for"}, "total": {$avg: "$stackerEvent.data.amountUstx" }, count: {$avg:1} } } ]).toArray();
                                              //[ { $group: {_id:{"event":"$event", "for":"$for"}, "total": {$sum: "$amount" }, count: {$sum:1} } } ]
  //const uniqueVoters = await proposalVotes.aggregate([ { $group: {_id:{"event":"$event", "for":"$for"}, "total": {$sum: "$amount" }, count: {$sum:1} } } ]).toArray();
  
  //const uv = await proposalVotes.aggregate([{$match: {amount: { $gt: 0 }}},{$group: {_id: {"voter": '$voter', "event":"$event"}, count: { $sum: 1 }}}]).toArray();
  const uv = await proposalVotes.aggregate([{$group: {_id: {"voter": '$voter', "event":"$event"}, count: { $sum: 1 }}}]).toArray();
  
  //console.log('getSummary: uv solo: ', uv.filter((o) => o._id.event === 'solo-vote'))
  //console.log('getSummary: uv pool: ', uv.filter((o) => o._id.event === 'pool-vote'))
  //const soloFor = proposalVotes.aggregate([{$group : { _id: "$proposalContractId", count: {$sum: 1}, total_amount: {$sum: "$amount" }}}]);
  return {
    proposalData: p.proposalData,
    summary, 
    summaryWithZeros,
    uniqueDaoVoters: uv.filter((o) => o._id.event === 'vote').length,
    uniquePoolVoters: uv.filter((o) => o._id.event === 'pool-vote').length,
    uniqueSoloVoters: uv.filter((o) => o._id.event === 'solo-vote').length
  }
}
  export async function countsVotesByProposalAndMethod(proposalContractId:string, method: string):Promise<any> {
    try {
      const result = await proposalVotes.countDocuments({"proposalContractId":proposalContractId, event: method});
      return Number(result);
    } catch (err:any) {
      return 0
    }
  }
  
  export async function countsVotesByFilter(filter:any):Promise<number> {
    try {
      const result = await proposalVotes.countDocuments(filter);
      return Number(result);
    } catch (err:any) {
      return 0
    }
  }
  
  export async function countsVotesByMethod(method: string):Promise<number> {
    try {
      const result = await proposalVotes.countDocuments({event: method});
      return Number(result);
    } catch (err:any) {
      return 0
    }
  }
  
  export async function findProposalVotesByProposal(proposalContractId:string):Promise<any> {
    const result = await proposalVotes.find({"proposalContractId":proposalContractId}).toArray();
    return result;
  }
  
  export async function findVotesByProposalAndMethod(proposal:string, method:string):Promise<any> {
    const result = await proposalVotes.find({"proposalContractId":proposal, "event":method}).toArray();
    return result;
  }
  
  export async function findVotesBySoloZeroAmounts():Promise<any> {
    const result = await proposalVotes.find({"amount":0, "event":'solo-vote'}).toArray();
    return result;
  }
  
  export async function findVotesByProposalAndVoter(proposalContractId:string, voter:string):Promise<any> {
    const result = await proposalVotes.find({"proposalContractId":proposalContractId, "voter":voter}).toArray();
    return result;
  }
  
  export async function findVotesByVoter(voter:string):Promise<any> {
    const result = await proposalVotes.find({"voter":voter}).toArray();
    return result;
  }
  
  export async function findVoteBySubmitTxId(submitTxId:string):Promise<any> {
    const result = await proposalVotes.findOne({"submitTxId":submitTxId});
    return result;
  }
  
  export async function saveOrUpdateVote(v:VoteEvent) {
    try {
      const pdb = await findVoteBySubmitTxId(v.submitTxId)
      if (pdb) {
        console.log('saveOrUpdateVote: updating: amount: ' + v.amount + ' for: ' + v.for);
        await updateVote(pdb, v)
      } else {
        console.log('saveOrUpdateVote: saving: amount: ' + v.amount + ' for: ' + v.for);
        await saveVote(v)
      }
    } catch (err:any) {
      console.log('saveOrUpdateVote: unable to save or update: ' + err.message)
    }
  }
  
  export async function saveVote(vote:any) {
    const result = await proposalVotes.insertOne(vote);
    return result;
  }
  
  export async function updateVote(vote:any, changes: any) {
    const result = await proposalVotes.updateOne({
      _id: vote._id
    },
      { $set: changes});
    return result;
  }
  

  
  
  