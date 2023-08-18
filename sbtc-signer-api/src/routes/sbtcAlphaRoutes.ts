import { DashboardController } from "./controllers/DashboardController.js";
import { SbtcAlphaController } from "./controllers/SbtcAlphaController.js"
import { isSimnet } from '../lib/config.js'

import express from 'express';
const router = express.Router();

router.get("/signer-api/:network/v1/signers/fetch-contract-data", async (req, res, next) => {
  try {
    console.log('v1/info: ')
    const controller = new SbtcAlphaController();
    const bcInfo = await controller.fetchPoxInfo();
    const poxCycleInfo = await controller.fetchPoxCycleInfo(bcInfo.poxInfo.rewardCycleId)
    const sbtcContractData = await controller.fetchSbtcAlphaContractData();

    const response = {
      bcInfo,
      sbtcContractData,
      poxCycleInfo
    }

    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/signer-api/:network/v1/sbtc/info", async (req, res, next) => {
  try {
    console.log('v1/info: ')
    const controller = new SbtcAlphaController();
    const bcInfo = await controller.fetchPoxInfo();
    const poxCycleInfo = await controller.fetchPoxCycleInfo(bcInfo.poxInfo.rewardCycleId)
    let sbtcContractData;
    sbtcContractData = await controller.fetchSbtcAlphaContractData();
    
    const controller1 = new DashboardController();
    const dashboard = await controller1.getAlphaDashboardInfo();

    const response = {
      bcInfo,
      sbtcContractData,
      poxCycleInfo,
      dashboard
    }

    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});
router.get("/signer-api/:network/v1/pox/get-delegation-info/:stxAddress", async (req, res, next) => {
  try {
    const controller = new SbtcAlphaController();
    const result = await controller.getDelegationInfo(req.params.stxAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});

router.get("/signer-api/:network/v1/pox/get-allowance-contract-callers/:stxAddress", async (req, res, next) => {
  try {
    const controller = new SbtcAlphaController();
    const result = await controller.getAllowanceContractCallers(req.params.stxAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});

router.get("/signer-api/:network/v1/pox/info", async (req, res, next) => {
  try {
    console.log('v1/pox/info: ')
    const controller = new SbtcAlphaController();
    const res = await controller.fetchPoxInfo();
    return res.send(res);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox/info.')
  }
});

router.get("/signer-api/:network/v1/vouching/domain/:domain", async (req, res, next) => {
  try {
    console.log('getDelegationInfo: ' + req.params.domain)
    const controller = new SbtcAlphaController();
    const result = await controller.fetchWebDid(req.params.domain);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});

router.get('*', function(req, res) {
  res.sendStatus(404);
});

export { router as sbtcAlphaRoutes }
