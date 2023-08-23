import { DashboardController } from "./controllers/DashboardController.js";
import { SbtcMiniController } from "./controllers/SbtcMiniController.js"

import express from 'express';
const router = express.Router();

router.get("/sbtc/application/data", async (req, res, next) => {
  try {
    const controller = new SbtcMiniController();
    const bcInfo = await controller.fetchPoxInfo();
    const poxCycleInfo = await controller.fetchPoxCycleInfo(bcInfo.poxInfo.rewardCycleId)
    let sbtcContractData;
    sbtcContractData = await controller.fetchSbtcMiniContractData();
    
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

router.get("/sbtc/data", async (req, res, next) => {
  try {
    const controller = new SbtcMiniController();
    let sbtcContractData;
    sbtcContractData = await controller.fetchSbtcMiniContractData();
    const response = {
      sbtcContractData,
    }

    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});
router.get("/signer-api/:network/v1/sbtc/stacking/get-delegation-info/:stxAddress", async (req, res, next) => {
  try {
    const controller = new SbtcMiniController();
    const result = await controller.getDelegationInfo(req.params.stxAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});

router.get("/signer-api/:network/v1/sbtc/stacking/get-allowance-contract-callers/:stxAddress", async (req, res, next) => {
  try {
    const controller = new SbtcMiniController();
    const result = await controller.getAllowanceContractCallers(req.params.stxAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});


router.get('*', function(req, res) {
  res.sendStatus(404);
});

export { router as sbtcMiniRoutes }
