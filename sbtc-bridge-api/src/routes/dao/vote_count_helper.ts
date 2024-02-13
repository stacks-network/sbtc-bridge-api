import { fetchAddressTransactions } from "../../lib/bitcoin/api_mempool.js"
import { getConfig } from "../../lib/config.js"
import { ProposalEvent, VoteEvent } from "../../types/stxeco_type.js"
import { poolStackerAddresses, soloStackerAddresses } from "./solo_pool_addresses.js"
import { findRewardSlotByAddressMaxHeight } from "../pox/reward_slot_helper.js"
import { findProposalByContractId, getDaoMongoConfig, proposalVotes } from "../../lib/data/db_models.js"
import { getBalanceAtHeight, getBurnBlockHeight } from "./dao_helper.js"
import { getDaoConfig } from "../../lib/config_dao.js"
import { findPoxEntriesByAddress, findPoxEntry } from "../pox/pox_helper.js"

const limit = 50 ;

/**
 * Strategy is..
 * 1. read votes from bitcoin (via mempool) and store in proposal-votes mongo collection 
 * 2. read rewardSlotHolders from hiro api ad store in mongo (note there are 37k ish not sure we need all of them)
 * 3. for given reward cycle iterate over get-reward-set-pox-address and store pox address, stacks address and ustx
 * 4. cross check the votes with the pox addresses
 */

export async function getSummary():Promise<any> {
  //const soloFor = countsVotesByFilter({proposalContractId, for: true, event: 'solo-vote', amount: {$sum:1} })
  //const soloFor = proposalVotes.aggregate([{proposalContractId, for: true, event: 'solo-vote', $group: {sum_val:{$sum:"$amount"}}}]).toArray()
  const summary = await proposalVotes.aggregate([ { $group: {_id:{"event":"$event", "for":"$for"}, "total": {$sum: "$amount" }, count: {$sum:1} } } ]).toArray();
  //const uniqueVoters = await proposalVotes.aggregate([ { $group: {_id:{"event":"$event", "for":"$for"}, "total": {$sum: "$amount" }, count: {$sum:1} } } ]).toArray();
  
  const uv = await proposalVotes.aggregate([{$match: {voter: { $not: {$size: 0} }}},{$group: {_id: {"voter": '$voter', "event":"$event"}, count: { $sum: 1 }}}]).toArray();
  
  console.log('getSummary: uv solo: ', uv.filter((o) => o._id.event === 'solo-vote'))
  console.log('getSummary: uv pool: ', uv.filter((o) => o._id.event === 'pool-vote'))
  //const soloFor = proposalVotes.aggregate([{$group : { _id: "$proposalContractId", count: {$sum: 1}, total_amount: {$sum: "$amount" }}}]);
  return { 
    summary, 
    uniqueDaoVoters: uv.filter((o) => o._id.event === 'vote').length,
    uniquePoolVoters: uv.filter((o) => o._id.event === 'pool-vote').length,
    uniqueSoloVoters: uv.filter((o) => o._id.event === 'solo-vote').length
  }
}

export async function syncSoloVotesByProposal():Promise<any> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votingCid = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION
  const solo = await setSoloVotesByProposal(proposalCid, votingCid)
  return solo
}

export async function syncPoolVotesByProposal():Promise<any> {
  const proposalCid = (await getDaoMongoConfig()).contractId
  const votingCid = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION
  const pool = await setPoolVotesByProposal(proposalCid, votingCid)
  return pool
}

async function setSoloVotesByProposal(proposalCid:string, votingCid:string):Promise<Array<VoteEvent>> {
  let votes:Array<any> = []
  const addresses = soloStackerAddresses(getConfig().network)
  const yesTxs = await setSoloVotes(proposalCid, votingCid, addresses.yAddress, true)
  const noTxs = await setSoloVotes(proposalCid, votingCid, addresses.nAddress, false)
  votes = votes.concat(yesTxs)
  votes = votes.concat(noTxs)
  //console.log('setSoloVotesByProposal: votes: ', votes)
  return votes;
}

  export async function setPoolVotesByProposal(proposalCid:string, votingCid:string):Promise<Array<VoteEvent>> {
    let poolVotes:Array<any> = []
    const addresses = poolStackerAddresses(getConfig().network)
    const proposal = await findProposalByContractId(proposalCid);
    const yesTxs = await setPoolVotesWrapper(proposal, addresses.yAddress, true, votingCid)
    const noTxs = await setPoolVotesWrapper(proposal, addresses.nAddress, false, votingCid)
    if (yesTxs && yesTxs.length > 0) poolVotes = poolVotes.concat(yesTxs)
    //console.log('getPoolVotesByProposal: poolVotes: ', poolVotes)
    if (noTxs && noTxs.length > 0) poolVotes = poolVotes.concat(noTxs)
    //console.log('getPoolVotesByProposal: poolVotes: ', poolVotes)
    return poolVotes;
  }
  
  async function setPoolVotesWrapper(proposal:ProposalEvent, principle:string, vfor:boolean, votingCid:string) {
    try {
      const votes:Array<VoteEvent> = []
      let offset = 0; //await countContractEvents();
      let events:any;
      do {
        events = await getPoolVotes(offset, proposal, principle);
        for (const voteTx of events.results) {
          const voted = votes.filter((o) => o.voter === voteTx.sender_address)
          //console.log('setPoolVotesWrapper: vote: ', voteTx)
          if (!voted || voted.length === 0) {
            if (isVoteAllowed(proposal, voteTx, principle)) {
              const burnBlockHeight = await getBurnBlockHeight(voteTx.block_height)
              const vote = {
                amount: await getBalance(proposal, voteTx.sender_address),
                for: vfor,
                proposal: proposal.contractId,
                proposalContractId: proposal.contractId,
                submitTxId: voteTx.tx_id,
                event: 'pool-vote',
                votingContractId: votingCid,
                voter: voteTx.sender_address,
                blockHeight: voteTx.block_height,
                burnBlockHeight
              }
              votes.push(vote)
              saveOrUpdateVote(vote)
              console.log('setPoolVotesWrapper: added: ' + voteTx.sender_address + ' amount: ' + vote.amount)
            } else {
              console.log('setPoolVotesWrapper: rejected: double vote: ' + voteTx.sender_address + ' offset: ' + offset)
            }
          }
        }
        offset += limit;
      } while (events.length === limit);
      return votes;
    } catch (err:any) {
      console.log('err setPoolVotesWrapper: ' + err);
      return [];
    }
  }

  function isVoteAllowed(proposal:ProposalEvent, v:any, principle:string) {
    return v.token_transfer.recipient_address === principle && v.block_height >= proposal.proposalData.startBlockHeight && v.block_height < proposal.proposalData.endBlockHeight
  }
  
  async function getBalance(proposal:ProposalEvent, voterAddress:string):Promise<any> {
    try {
      const balAtHeight1 = await getBalanceAtHeight(voterAddress, proposal.proposalData.startBlockHeight + 288)
      const balAtHeight2 = await getBalanceAtHeight(voterAddress, proposal.proposalData.endBlockHeight - 288)

      let bal1 = 0
      let bal2 = 0
      if (getConfig().network === 'mainnet') {
        bal1 = Number(balAtHeight1.stx?.locked)
        bal2 = Number(balAtHeight2.stx?.locked)
      } else {
        bal1 = Number(balAtHeight1.stx?.balance)
        bal2 = Number(balAtHeight2.stx?.balance)
      }
      return Math.floor((bal1 + bal2) / 2)

    } catch (err) {
        console.log('getPoolYesVotes: ', err);
    }
    return 0;
  }

  async function getPoolVotes(offset:number, proposal:ProposalEvent, principle:string):Promise<any> {
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

  async function setSoloVotes(proposalCid:string, votingCid:string, principle:string, vfor:boolean):Promise<Array<VoteEvent>> {
    const txs = await fetchAddressTransactions(principle);
    console.log('setSoloVotes: numb' + txs.length + ' for: ' + vfor)
    const votes:Array<VoteEvent> = []
    for (const v of txs) {
      const potVote:VoteEvent = {
        amount: 0,
        for: vfor,
        proposal: proposalCid,
        proposalContractId: proposalCid,
        submitTxId: v.txid,
        event: 'solo-vote',
        votingContractId: votingCid,
        voter: v.vin[0].prevout.scriptpubkey_address,
        burnBlockHeight: v.status.block_height, //await getBurnBlockHeight(v.block_height),
        blockHeight: 0
      }
      //const poxAddress = await findRewardSlotByAddressMaxHeight(potVote.voter)
      const poxEntries = await findPoxEntriesByAddress(potVote.voter)

      if (poxEntries && poxEntries.length > 0) {
        const pox78 = poxEntries.find((o) => o.cycle === 78)
        const pox79 = poxEntries.find((o) => o.cycle === 79)
        if (pox78) {
          potVote.amount = pox78.totalUstx
          potVote.poxStacker = pox78.stacker
          potVote.delegations = pox78.delegations
        }
        if (pox79) {
          potVote.amount = Math.floor((potVote.amount + pox79.totalUstx) / 2)
          potVote.poxStacker = pox79.stacker
          potVote.delegations = pox79.delegations
        }
        console.log('setSoloVotes: potVote:', potVote)
        saveOrUpdateVote(potVote)
        votes.push(potVote)
      }
    }
    return votes;
  }

  
  async function saveVote(vote:any) {
    const result = await proposalVotes.insertOne(vote);
    return result;
  }
  
  async function updateVote(vote:any, changes: any) {
    const result = await proposalVotes.updateOne({
      _id: vote._id
    },
      { $set: changes});
    return result;
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
  
  export async function findVotesByProposalAndMethod(proposalContractId:string, method:string):Promise<any> {
    const result = await proposalVotes.find({"proposalContractId":proposalContractId, "event":method}).toArray();
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
        //console.log('saveOrUpdateVote: updating: ' + v.proposalContractId + ' voter: ' + v.voter + ' amount: ' + v.amount + ' for: ' + v.for);
        await updateVote(pdb, v)
      } else {
        //console.log('saveOrUpdateVote: saving: ', v);
        await saveVote(v)
      }
    } catch (err:any) {
      //console.log('saveOrUpdateVote: unable to save or update')
    }
  }
  
  
  
  