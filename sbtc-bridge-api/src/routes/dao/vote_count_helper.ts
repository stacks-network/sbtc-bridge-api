import { fetchAddressTransactions } from "../../lib/bitcoin/api_mempool.js"
import { getConfig } from "../../lib/config.js"
import { VoteEvent } from "../../types/stxeco_type.js"
import { poolStackerAddresses, soloStackerAddresses } from "./solo_pool_addresses.js"
import { findRewardSlotByAddressMaxHeight } from "./reward_slot_helper.js"

/**
 * Strategy is..
 * 1. read votes from bitcoin (via mempool) and store in proposal-votes mongo collection 
 * 2. read rewardSlotHolders from hiro api ad store in mongo (note there are 37k ish not sure we need all of them)
 * 3. for given reward cycle iterate over get-reward-set-pox-address and store pox address, stacks address and ustx
 * 4. cross check the votes with the pox addresses
 */

export async function getSoloVotesByProposal(proposalCid:string, votingCid:string):Promise<Array<VoteEvent>> {
    let votes:Array<any> = []
    const addresses = soloStackerAddresses(getConfig().network)
    const yesTxs = await getSoloVotes(proposalCid, votingCid, addresses.yAddress, true)
    const noTxs = await getSoloVotes(proposalCid, votingCid, addresses.nAddress, false)
    votes = votes.concat(yesTxs)
    votes = votes.concat(noTxs)
    //console.log('getSoloVotesByProposal: votes: ', votes)
    return votes;
  }
  
  export async function getPoolVotesByProposal(proposalCid:string, votingCid:string):Promise<Array<VoteEvent>> {
    let poolVotes:Array<any> = []
    const addresses = poolStackerAddresses(getConfig().network)
    const yesTxs = await getPoolVotes(addresses.yAddress)
    const noTxs = await getPoolVotes(addresses.nAddress)
    if (yesTxs && yesTxs.results) poolVotes = poolVotes.concat(convert(proposalCid, votingCid, yesTxs.results, true))
    //console.log('getPoolVotesByProposal: poolVotes: ', poolVotes)
    if (noTxs && noTxs.results) poolVotes = poolVotes.concat(convert(proposalCid, votingCid, noTxs.results, false))
    //console.log('getPoolVotesByProposal: poolVotes: ', poolVotes)
    return poolVotes;
  }
  
  function convert(proposalCid:string, votingCid:string, results:Array<any>, vfor:boolean) {
    const votes:Array<VoteEvent> = []
    for (const v of results) {
      const voted = votes.filter((o) => o.voter === v.sender_address)
      if (!voted || voted.length === 0) {
        votes.push({
          amount: 0,
          for: vfor,
          proposal: proposalCid,
          proposalContractId: proposalCid,
          submitTxId: v.tx_id,
          event: 'pool-vote',
          votingContractId: votingCid,
          voter: v.sender_address
        })
      }
    }
    return votes;
  }
  
  async function getPoolVotes(principle:string):Promise<any> {
    const url = getConfig().stacksApi + '/extended/v1/address/' + principle + '/transactions?proof=0';
    let val;
    try {
        const response = await fetch(url)
        val = await response.json();
    } catch (err) {
        console.log('getPoolYesVotes: ', err);
    }
    return val;
  }

  async function getSoloVotes(proposalCid:string, votingCid:string, principle:string, vfor:boolean):Promise<Array<VoteEvent>> {
    const txs = await fetchAddressTransactions(principle);
    for (const tx of txs) {
      console.log('getSoloVotes: txs:vin ', tx.vin)
      console.log('getSoloVotes: txs:vout ', tx.vout)
    }
    const votes:Array<VoteEvent> = []
    for (const v of txs) {

      const potVote = {
        amount: 0,
        for: vfor,
        proposal: proposalCid,
        proposalContractId: proposalCid,
        submitTxId: v.txid,
        event: 'solo-vote',
        votingContractId: votingCid,
        voter: v.vin[0].prevout.scriptpubkey_address
      }
      const poxAddress = await findRewardSlotByAddressMaxHeight(potVote.voter)
      if (poxAddress) {
        //const rewardCycle = await getRewardCycleFromBurnHeight(poxAddress.burn_block_height)
        votes.push(potVote)
      }
    }
    return votes;
  }

  
  
  