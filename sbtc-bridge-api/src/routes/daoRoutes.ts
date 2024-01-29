import express from "express";
import { findProposalVotesByProposal, findVotesByProposalAndVoter, findVotesByVoter, getDaoMongoConfig, getProposals, saveOrUpdateDaoMongoConfig } from "../lib/data/db_models.js";
import { getAssetClasses, getBalanceAtHeight, getFunding, getGovernanceData, getNftHoldings, getProposalFromContractId, getProposalsForActiveVotingExt, getProposalsFromContractIds, getStacksInfo, isExecutiveTeamMember, isExtension } from "./dao/dao_helper.js";
import { getDaoConfig } from "../lib/config_dao.js";
import { getConfig } from "../lib/config.js";
import { findRewardSlotByAddress, findRewardSlotByAddressMaxHeight, findRewardSlotByAddressMinHeight, readRewardSlots } from "./pox/reward_slot_helper.js";
import { poolStackerAddresses, soloStackerAddresses } from "./dao/solo_pool_addresses.js";
import { getPoolVotesByProposal, getSoloVotesByProposal } from "./dao/vote_count_helper.js";
import { readPoxAddressInfo } from "./dao/pox_helper.js";

const router = express.Router();

router.get("/is-executive-team-member/:stacksAddress", async (req, res, next) => {
  return false
  try {
    const result = isExecutiveTeamMember(req.params.stacksAddress);
    return res.send(result);
  } catch (error:any) {
    console.log('Error in routes: ', error.message)
    next('An error occurred fetching executive-team-member.')
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

router.get("/is-extension/:extensionCid", async (req, res, next) => {
  try {
    const result = await isExtension(req.params.extensionCid);
    console.log('isExtension:', result)
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
    const currentProposal = await getDaoMongoConfig()
    const soloVotes = await getSoloVotesByProposal(currentProposal.contractId, 'solo-voting');
    const poolVotes = await getPoolVotesByProposal(currentProposal.contractId, 'pool-voting');
    const soloAddresses = soloStackerAddresses(getConfig().network);
    const poolAddresses = poolStackerAddresses(getConfig().network);
    return res.send({soloVotes, poolVotes, soloAddresses, poolAddresses});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});
/**
 * addresses for solo and pool stackers to send txs to express their votes.
 */
router.get("/addresses", async (req, res, next) => {
  try {
    const soloAddresses = soloStackerAddresses(getConfig().network);
    const poolAddresses = poolStackerAddresses(getConfig().network);
    return res.send({soloAddresses, poolAddresses, soloVotes:[], poolVotes: []});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

/**
 * votes for solo and pool stackers and addresses - for the configured proposal.
 */
router.get("/votes/pool", async (req, res, next) => {
  try {
    const currentProposal = await getDaoMongoConfig()
    const poolVotes = await getPoolVotesByProposal(currentProposal.contractId, 'pool-voting');
    const poolAddresses = poolStackerAddresses(getConfig().network);
    return res.send({poolVotes, poolAddresses});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/votes/solo", async (req, res, next) => {
  try {
    const currentProposal = await getDaoMongoConfig()
    const soloVotes = await getSoloVotesByProposal(currentProposal.contractId, 'solo-voting');
    const soloAddresses = soloStackerAddresses(getConfig().network);
    return res.send({soloVotes, soloAddresses});
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
    const response = await getNftHoldings(req.params.stxAddress, undefined, Number(req.params.limit), Number(req.params.offset));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/nft/assets/:stxAddress/:assetId/:limit/:offset", async (req, res, next) => {
  try {
    const response = await getNftHoldings(req.params.stxAddress, req.params.assetId, Number(req.params.limit), Number(req.params.offset));
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
router.get("/dao-config", async (req, res, next) => {
  try {
    const response = await getDaoConfig();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/get-current-proposal", async (req, res, next) => {
  try {
    const response = await getDaoMongoConfig();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/set-current-proposal/:contractId", async (req, res, next) => {
  try {
    let config = await getDaoMongoConfig();
    console.log('config in routes: ', config)
    if (!config) {
      config = {
        configId: 1,
        contractId: req.params.contractId
      }
    } else {
      config.contractId = req.params.contractId
    }
    config = await saveOrUpdateDaoMongoConfig(config)
    return res.send(config);
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
    const props = await getProposalsFromContractIds(submissionContractId, getDaoConfig().VITE_DOA_PROPOSALS);
    const response = await getProposals();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});
router.get("/sync/proposal/:contractIds", async (req, res, next) => {
  try {
    const submissionContractId = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION
    console.log('Running: sync: proposals: ' + req.params.contractIds);
    const props = await getProposalsFromContractIds(submissionContractId, req.params.contractIds);
    return res.send(props);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as daoRoutes }


