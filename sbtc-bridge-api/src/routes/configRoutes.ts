import express from "express";
import { TransactionController, BlocksController, DefaultController, WalletController } from "../controllers/BitcoinRPCController.js";
import { SbtcWalletController, DepositsController } from "../controllers/StacksRPCController.js";
import { ConfigController } from "../controllers/ConfigController.js";
import { SignersController } from "../controllers/SignersRPCController.js";
import type { PeginRequestI, WrappedPSBT } from 'sbtc-bridge-lib';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const controller = new DefaultController();
    const response = controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getAllParam();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/:param", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getParam(req.params.param);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

export { router as configRoutes }
