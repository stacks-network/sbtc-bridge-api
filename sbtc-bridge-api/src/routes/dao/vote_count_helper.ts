import { fetchAddressTransactions } from "../../lib/bitcoin/api_mempool.js"
import { getConfig } from "../../lib/config.js"
import { ProposalEvent, VoteEvent } from "../../types/stxeco_type.js"
import { poolStackerAddresses, soloStackerAddresses } from "./solo_pool_addresses.js"
import { findRewardSlotByAddressMaxHeight } from "../pox/reward_slot_helper.js"
import { findProposalByContractId } from "../../lib/data/db_models.js"
import { getBalanceAtHeight, getBurnBlockHeight } from "./dao_helper.js"

const limit = 50 ;

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
    const proposal = await findProposalByContractId(proposalCid);
    const yesTxs = await getPoolVotesWrapper(proposal, addresses.yAddress, true, votingCid)
    const noTxs = await getPoolVotesWrapper(proposal, addresses.nAddress, false, votingCid)
    if (yesTxs && yesTxs.length > 0) poolVotes = poolVotes.concat(yesTxs)
    //console.log('getPoolVotesByProposal: poolVotes: ', poolVotes)
    if (noTxs && noTxs.length > 0) poolVotes = poolVotes.concat(noTxs)
    //console.log('getPoolVotesByProposal: poolVotes: ', poolVotes)
    return poolVotes;
  }
  
  async function getPoolVotesWrapper(proposal:ProposalEvent, principle:string, vfor:boolean, votingCid:string) {
    try {
      const votes:Array<VoteEvent> = []
      let offset = 0; //await countContractEvents();
      let events:any;
      do {
        events = await getPoolVotes(offset, proposal, principle);
        for (const voteTx of events.results) {
          const voted = votes.filter((o) => o.voter === voteTx.sender_address)
          //console.log('getPoolVotesWrapper: vote: ', voteTx)
          if (!voted || voted.length === 0) {
            if (isVoteAllowed(proposal, voteTx, principle)) {
              const burnBlockHeight = await getBurnBlockHeight(voteTx.block_height)
              votes.push({
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
              })
              console.log('getPoolVotesWrapper: added: ' + voteTx.sender_address)
            } else {
              console.log('getPoolVotesWrapper: rejected: double vote: ' + voteTx.sender_address + ' offset: ' + offset)
            }
          }
        }
        offset += limit;
      } while (events.length === limit);
      return votes;
    } catch (err:any) {
      console.log('err getPoolVotesWrapper: ' + err);
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
      // note balance on testnet for convenience
      //console.log('getPoolVotesWrapper: balAtHeight1: ', balAtHeight1.stx.balance)
      //console.log('getPoolVotesWrapper: balAtHeight2: ', balAtHeight1.stx.balance)

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

  async function getSoloVotes(proposalCid:string, votingCid:string, principle:string, vfor:boolean):Promise<Array<VoteEvent>> {
    const txs = await fetchAddressTransactions(principle);
    console.log('getSoloVotes: ', txs)
    for (const tx of txs) {
      //console.log('getSoloVotes: txs:vin ', tx.vin)
      //console.log('getSoloVotes: txs:vout ', tx.vout)
    }
    const votes:Array<VoteEvent> = []
    for (const v of txs) {
      console.log('getSoloVotes: ' + principle)
      console.log('getSoloVotes: ', v.status)
      const potVote = {
        amount: 0,
        for: vfor,
        proposal: proposalCid,
        proposalContractId: proposalCid,
        submitTxId: v.txid,
        event: 'solo-vote',
        votingContractId: votingCid,
        voter: v.vin[0].prevout.scriptpubkey_address,
        burnBlockHeight: await getBurnBlockHeight(v.block_height),
        blockHeight: v.block_height
      }
      const poxAddress = await findRewardSlotByAddressMaxHeight(potVote.voter)
      if (poxAddress) {
        //const rewardCycle = await getRewardCycleFromBurnHeight(poxAddress.burn_block_height)
        votes.push(potVote)
      }
    }
    return votes;
  }

  
  
  