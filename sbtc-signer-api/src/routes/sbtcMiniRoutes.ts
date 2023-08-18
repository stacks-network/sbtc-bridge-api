import { DashboardController } from "./controllers/DashboardController.js";
import { SbtcMiniController } from "./controllers/SbtcMiniController.js"
import { isSimnet } from '../lib/config.js'

import express from 'express';
const router = express.Router();

router.get("/sbtc/application/meta-data", async (req, res, next) => {
  try {
    console.log('meta-data: ')
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

router.get("/sbtc/meta-data", async (req, res, next) => {
  try {
    console.log('meta-data: ')
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

router.get('*', function(req, res) {
  res.sendStatus(404);
});

export { router as sbtcMiniRoutes }
