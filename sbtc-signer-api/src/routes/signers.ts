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

export { router as signerRoutes } 
