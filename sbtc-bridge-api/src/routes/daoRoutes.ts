import express from "express";
import { getDaoMongoConfig, getProposals, saveOrUpdateDaoMongoConfig } from "../lib/data/db_models.js";
import { getAssetClasses, getBalanceAtHeight, getFunding, getGovernanceData, getNftHoldings, getProposalFromContractId, getProposalsForActiveVotingExt, getProposalsFromContractIds, getStacksInfo, isExecutiveTeamMember, isExtension } from "./dao/dao_helper.js";
import { getDaoConfig } from "../lib/config_dao.js";
import { getConfig } from "../lib/config.js";
import { poolStackerAddresses, soloStackerAddresses } from "./dao/solo_pool_addresses.js";
import { findProposalVotesByProposal, findVotesByProposalAndMethod, findVotesByProposalAndVoter, findVotesByVoter, getSummary  } from "./dao/vote_count_helper.js";
import { getSoloTxs, reconcileSoloTxs } from "./dao/solo_votes.js";
import { getPoolTxs, reconcilePoolTxs } from "./dao/pool_votes.js";

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
    const soloVotes = await findVotesByProposalAndMethod(currentProposal.contractId, 'solo-vote');
    const poolVotes = await findVotesByProposalAndMethod(currentProposal.contractId, 'pool-vote');
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

router.get("/results/summary", async (req, res, next) => {
  try {
    const summary = await getSummary();
    return res.send(summary);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/results/pool-stackers", async (req, res, next) => {
  try {
    const currentProposal = await getDaoMongoConfig()
    const poolVotes = await findVotesByProposalAndMethod(currentProposal.contractId, 'pool-vote');
    const poolAddresses = poolStackerAddresses(getConfig().network);
    return res.send({poolVotes, poolAddresses});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/results/solo-stackers", async (req, res, next) => {
  try {
    const currentProposal = await getDaoMongoConfig()
    const soloVotes = await findVotesByProposalAndMethod(currentProposal.contractId, 'solo-vote');
    const soloAddresses = soloStackerAddresses(getConfig().network);
    return res.send({soloVotes, soloAddresses});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/results/non-stackers", async (req, res, next) => {
  try {
    const currentProposal = await getDaoMongoConfig()
    const daoVotes = await findVotesByProposalAndMethod(currentProposal.contractId, 'vote');
    return res.send({daoVotes});
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
    const soloVotes = await findVotesByProposalAndMethod(req.params.proposalCid, 'solo-vote');
    const poolVotes = await findVotesByProposalAndMethod(req.params.proposalCid, 'pool-vote');
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

router.get("/sync/results/solo-stackers/raw", async (req, res, next) => {
  try {
    const soloTxs = await getSoloTxs();
    return res.send(soloTxs);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/results/pool-stackers/raw", async (req, res, next) => {
  try {
    const poolTxs = await getPoolTxs();
    return res.send(poolTxs);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/results/solo-stacker-amounts/:use_event_data", async (req, res, next) => {
  try {
    reconcileSoloTxs(Boolean(req.params.use_event_data));
    return res.send({result: 'syncing data'});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/results/pool-stacker-amounts", async (req, res, next) => {
  try {
    reconcilePoolTxs();
    return res.send({result: 'syncing data'});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/results/non-stackers", async (req, res, next) => {
  try {
    getProposalsForActiveVotingExt(getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION);
    return res.send({result: 'syncing dao data'});
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


