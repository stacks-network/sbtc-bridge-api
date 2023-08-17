import { DashboardController } from "./controllers/DashboardController.js";
import { SignersController } from "./controllers/SignersController.js"

import express from 'express';
const router = express.Router();

router.get("/signer-api/:network/v1/signers/fetch-contract-data", async (req, res, next) => {
  try {
    console.log('v1/info: ')
    const controller = new SignersController();
    const bcInfo = await controller.fetchPoxInfo();
    const poxCycleInfo = await controller.fetchPoxCycleInfo(bcInfo.poxInfo.rewardCycleId)
    const sbtcContractData = await controller.fetchSbtcContractData();

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
    const controller = new SignersController();
    const bcInfo = await controller.fetchPoxInfo();
    const poxCycleInfo = await controller.fetchPoxCycleInfo(bcInfo.poxInfo.rewardCycleId)
    const sbtcContractData = {} //await controller.fetchSbtcContractData();
    
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
router.get("/signer-api/:network/v1/alpha/dashboard/events", async (req, res, next) => {
  try {
    console.log('v1/dashboard/info ')
    const controller = new DashboardController();
    const dashboard = await controller.getAlphaDashboardEvents();
    return res.send(dashboard);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/signer-api/:network/v1/pox/get-delegation-info/:stxAddress", async (req, res, next) => {
  try {
    const controller = new SignersController();
    const result = await controller.getDelegationInfo(req.params.stxAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});

router.get("/signer-api/:network/v1/pox/get-allowance-contract-callers/:stxAddress", async (req, res, next) => {
  try {
    const controller = new SignersController();
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
    const controller = new SignersController();
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
    const controller = new SignersController();
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

export { router as signerRoutes }
