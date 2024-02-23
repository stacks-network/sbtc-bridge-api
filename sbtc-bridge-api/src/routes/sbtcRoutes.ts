import express from "express";
import { SbtcWalletController, DepositsController } from "./stacks/StacksRPCController.js";
import type { BridgeTransactionType } from 'sbtc-bridge-lib';
import { isUpdateAllowed } from "../lib/utils_stacks.js";

const router = express.Router();

router.get("/build/deposit/:stxAddress", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.commitDepositData(req.params.stxAddress);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/build/deposit/op_drop/:stxAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.commitDepositDataOpDrop(req.params.stxAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/parse/deposit/:data", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.commitDeposit(req.params.data);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/build/withdrawal/:signature/:amount", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.commitWithdrawalData(req.params.signature, Number(req.params.amount));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/build/withdrawal/op_drop/:signature/:amount", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.commitWithdrawalDataOpDrop(req.params.signature, Number(req.params.amount));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});


router.get("/parse/withdrawal/:data/:sbtcWallet", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.commitWithdrawal(req.params.data, req.params.sbtcWallet);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/parse/tx/:txid", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.parseTransaction(req.params.txid);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


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
 */


/**
 * fetchs a bunch of objects needed in the UI;
 * 1. sbtc contract data
 * 2. current btc exchange rate data 
 * 3. keys: pair of custodial keys for testing reclaima nd reveal transactions 
 * @returns 
 */
router.get("/init-ui", async (req, res, next) => {
  const controller = new SbtcWalletController();
  return res.send(await controller.initUi());
});

/** 
 * fetchs sbtc contract data
 * @returns 
 */
router.get("/data", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const sbtcContractData = await controller.fetchSbtcContractData();
    return res.send(sbtcContractData);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/info", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const sbtcContractData = await controller.fetchSbtcContractData();
    return res.send(sbtcContractData);
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

router.get("/bridgetx/search/:stxAddress", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestsByStacksAddress(req.params.stxAddress);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridgetx", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequests();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridgetx", async (req, res, next) => {
  try {
    console.log('/sbtc/bridgetx', req.body);
    //if (req.body) return res.send('well done');
    const peginRequest:BridgeTransactionType = req.body;
    if (!isUpdateAllowed(req, peginRequest.originator)) {
      res.sendStatus(401)
      return;
    }
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

router.put("/bridgetx/:id", async (req, res, next) => {
  try {
    console.log('/sbtc/bridgetx', req.body);
    const peginRequest:BridgeTransactionType = req.body;
    if (!isUpdateAllowed(req, peginRequest.originator)) {
      res.sendStatus(401)
      return;
    }
    const controller = new DepositsController();
    const response = await controller.updatePeginCommit(peginRequest);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

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

router.get("/bridgetx/:_id", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findBridgeTransactionById(req.params._id);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

export { router as sbtcRoutes }
