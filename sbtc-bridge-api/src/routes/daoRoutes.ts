import express from "express";
import { findProposalVotesByProposal, findVotesByProposalAndVoter, findVotesByVoter, getProposals } from "../lib/data/db_models.js";
import { getAssetClasses, getBalanceAtHeight, getFunding, getGovernanceData, getNftHoldings, getPoxInfo, getProposalFromContractId, getProposalsForActiveVotingExt, getProposalsFromContractIds, getStacksInfo, isExecutiveTeamMember } from "./dao/dao_helper.js";
import { getDaoConfig } from "../lib/config_dao.js";
import { getConfig } from "../lib/config.js";
import { findRewardSlotByAddress, findRewardSlotByAddressMaxHeight, findRewardSlotByAddressMinHeight, readRewardSlots } from "./dao/reward_slot_helper.js";
import { poolStackerAddresses, soloStackerAddresses } from "./dao/solo_pool_addresses.js";
import { getPoolVotesByProposal, getSoloVotesByProposal } from "./dao/vote_count_helper.js";
import { readPoxAddressInfo } from "./dao/pox_helper.js";

const router = express.Router();

/**
 * addresses for solo and pool stackers to send txs to express their votes.
 */
router.get("/addresses", async (req, res, next) => {
  try {
    const solo = soloStackerAddresses(getConfig().network);
    const pool = poolStackerAddresses(getConfig().network);
    return res.send({solo, pool});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});
router.get("/is-executive-team-member/:stacksAddress", async (req, res, next) => {
  try {
    const result = isExecutiveTeamMember(req.params.stacksAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/get-governance-data/:stacksAddress", async (req, res, next) => {
  try {
    const result = getGovernanceData(req.params.stacksAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/get-proposal-from-contract-id/:submissionContractId/:proposalContractId", async (req, res, next) => {
  try {
    const result = getProposalFromContractId(req.params.submissionContractId, req.params.proposalContractId);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/get-funding/:extensionCid/:proposalCid", async (req, res, next) => {
  try {
    const result = getFunding(req.params.extensionCid, req.params.proposalCid);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/call-contract-readonly/:extensionCid/:proposalCid", async (req, res, next) => {
  try {
    const result = getFunding(req.params.extensionCid, req.params.proposalCid);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/get-signals/:principle", async (req, res, next) => {
  try {
    const result = getGovernanceData(req.params.principle);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

/**
 * votes for solo and pool stackers and addresses - for the configured proposal.
 */
router.get("/votes", async (req, res, next) => {
  try {
    const soloVotes = await getSoloVotesByProposal(getDaoConfig().VITE_DOA_PROPOSAL, 'solo-voting');
    const poolVotes = await getPoolVotesByProposal(getDaoConfig().VITE_DOA_PROPOSAL, 'pool-voting');
    const soloAddresses = soloStackerAddresses(getConfig().network);
    const poolAddresses = poolStackerAddresses(getConfig().network);
    return res.send({soloVotes, poolVotes, soloAddresses, poolAddresses});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

/**
 * votes for solo and pool stackers and addresses - for the given proposal.
 */
router.get("/votes/:proposalCid", async (req, res, next) => {
  try {
    const soloVotes = await getSoloVotesByProposal(req.params.proposalCid, 'solo-voting');
    const poolVotes = await getPoolVotesByProposal(req.params.proposalCid, 'pool-voting');
    const soloAddresses = soloStackerAddresses(getConfig().network);
    const poolAddresses = poolStackerAddresses(getConfig().network);
    return res.send({soloVotes, poolVotes, soloAddresses, poolAddresses});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/pox-info", async (req, res, next) => {
  try {
    const response = await getPoxInfo();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.') 
  }
});

router.get("/stacks-info", async (req, res, next) => {
  try {
    const response = await getStacksInfo();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching stacks-info.') 
  }
});

router.get("/balance/:stxAddress/:height", async (req, res, next) => {
  try {
    const response = await getBalanceAtHeight(req.params.stxAddress, Number(req.params.height || 0));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/nft/assets-classes/:stxAddress", async (req, res, next) => {
  try {
    const response = await getAssetClasses(req.params.stxAddress);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/nft/assets/:stxAddress/:limit/:offset", async (req, res, next) => {
  try {
    const response = await getNftHoldings(req.params.stxAddress, Number(req.params.limit), Number(req.params.offset));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/nft/assets/:stxAddress", async (req, res, next) => {
  try {
    const response = await getNftHoldings(req.params.stxAddress, -1, 0);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/voter/events/:proposalContractId/:stxAddress", async (req, res, next) => {
  try {
    const response = await findVotesByProposalAndVoter(req.params.proposalContractId, req.params.stxAddress);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/voter/events-proposal/:proposalContractId", async (req, res, next) => {
  try {
    const response = await findProposalVotesByProposal(req.params.proposalContractId);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/voter/events/:stxAddress", async (req, res, next) => {
  try {
    const response = await findVotesByVoter(req.params.stxAddress);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/proposals", async (req, res, next) => {
  try {
    const response = await getProposals();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

/**
 * Mongo collection: rewardSlotHolders(burn_block_height, address, slot_index)
 * Sync methods: readAllRewardSlots, readRewardSlots
 * note there are 37k of these and the data contains
 * 
 * extended/v1/burnchain/reward_slot_holders
 */
router.get("/reward-slot/:address/most-recent", async (req, res, next) => {
  try {
    const response = await findRewardSlotByAddressMaxHeight(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.') 
  }
});

router.get("/reward-slot/:address/least-recent", async (req, res, next) => {
  try {
    const response = await findRewardSlotByAddressMinHeight(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.') 
  }
});

router.get("/reward-slot/:address", async (req, res, next) => {
  try {
    const response = await findRewardSlotByAddress(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.') 
  }
});

router.get("/reward-slot/sync/read-reward-slots/:offset/:limit", async (req, res, next) => {
  try {
    const response = await readRewardSlots(Number(req.params.offset), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/sync/read-reward-set-pox-address/:cycle", async (req, res, next) => {
  try {
    const response = await readPoxAddressInfo(Number(req.params.cycle));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/sync/read-dao-votes", async (req, res, next) => {
  try {
    console.log('Running: sync: ' + getConfig().network);
    console.log('Running: sync: ' + getDaoConfig().VITE_DOA_DEPLOYER);
    try {
      await getProposalsForActiveVotingExt(getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION);
    } catch(err) {
      //
    }
    const submissionContractId = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION
    console.log('Running: sync: submissionContractId: ' + submissionContractId);
    console.log('Running: sync: proposals: ' + getDaoConfig().VITE_DOA_PROPOSALS);
    await getProposalsFromContractIds(submissionContractId, getDaoConfig().VITE_DOA_PROPOSALS);
    const response = await getProposals();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as daoRoutes }


