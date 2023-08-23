import express from "express";
import { TransactionController, BlocksController, WalletController } from "../controllers/BitcoinRPCController.js";
import { SbtcWalletController, DepositsController } from "../controllers/StacksRPCController.js";
import type { PeginRequestI } from 'sbtc-bridge-lib';

const router = express.Router();

router.get("/address/:address/balance", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchUserSbtcBalance(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 
router.get("/address/balances/:stxAddress/:cardinal/:ordinal", async (req, res, next) => {
  try {
    //checkAddressForNetwork(getConfig().network, req.params.stxAddress)
    //checkAddressForNetwork(getConfig().network, req.params.cardinal)
    //checkAddressForNetwork(getConfig().network, req.params.ordinal)
    const controller = new SbtcWalletController();
    console.log('/address/balances/:stxAddress/:cardinal/:ordinal')
    const response = await controller.fetchUserBalances(req.params.stxAddress, req.params.cardinal, req.params.ordinal);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

/**
router.get("/events/save", (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    controller.saveAllSbtcEvents();
    const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/events/index/stacks/:txid", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.indexSbtcEvent(req.params.txid);
    //const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/events/save/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.saveSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/events/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.findSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 */

router.get("/data", async (req, res, next) => {
  try {
    const controller1 = new SbtcWalletController();
    const sbtcContractData = await controller1.fetchSbtcContractData();
    //checkAddressForNetwork(getConfig().network, sbtcContractData.sbtcWalletAddress)
    const controller2 = new TransactionController();
    const keys = await controller2.getKeys();
    const controller3 = new WalletController();
    const sbtcWalletAddressInfo = await controller3.fetchUtxoSet(sbtcContractData.sbtcWalletAddress, true);
    const controller = new BlocksController();
    const btcFeeRates = await controller.getFeeEstimate();

    const response = {
      keys,
      sbtcContractData,
      sbtcWalletAddressInfo,
      btcFeeRates
    }
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/wallet-address", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcWalletAddress();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/pegins/search/:stxAddress", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestsByStacksAddress(req.params.stxAddress);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/pegins", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequests();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/pegins", async (req, res, next) => {
  try {
    console.log('/sbtc/pegins', req.body);
    const peginRequest:PeginRequestI = req.body;
    if (peginRequest.status === 1 || peginRequest.status === 5) {
      const controller = new DepositsController();
      const response = await controller.savePeginCommit(peginRequest);
      return res.send(response);
    } else {
      throw new Error('Status os a request from UI must be 1 for op_drop or 5 for op_return.');
    }
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

/**
router.put("/pegins", async (req, res, next) => {
  try {
    console.log('/sbtc/pegins', req.body);
    const peginRequest:PeginRequestI = req.body;
    const controller = new DepositsController();
    const response = await controller.updatePeginCommit(peginRequest);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 */

router.get("/pegin-scan", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.scanPeginRequests();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/commit-scan/:btcAddress/:stxAddress/:sbtcWalletAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.scanCommitments(req.params.btcAddress, req.params.stxAddress, req.params.sbtcWalletAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/pegins/:_id", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestById(req.params._id);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

export { router as stacksRoutes }
