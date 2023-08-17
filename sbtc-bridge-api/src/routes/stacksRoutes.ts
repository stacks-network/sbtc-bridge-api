import express from "express";
import { TransactionController, BlocksController, DefaultController, WalletController } from "../controllers/BitcoinRPCController.js";
import { SbtcWalletController, DepositsController } from "../controllers/StacksRPCController.js";
import { ConfigController } from "../controllers/ConfigController.js";
import { SignersController } from "../controllers/SignersRPCController.js";
import type { PeginRequestI, WrappedPSBT } from 'sbtc-bridge-lib';
import { updateExchangeRates } from '../lib/bitcoin/blockcypher_api.js';
import { checkAddressForNetwork } from 'sbtc-bridge-lib';
import { getConfig } from "../lib/config.js";

const router = express.Router();

router.get("/bridge-api/:network/v1/sbtc/address/:address/balance", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchUserSbtcBalance(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 
router.get("/bridge-api/:network/v1/sbtc/address/balances/:stxAddress/:cardinal/:ordinal", async (req, res, next) => {
  try {
    //checkAddressForNetwork(getConfig().network, req.params.stxAddress)
    //checkAddressForNetwork(getConfig().network, req.params.cardinal)
    //checkAddressForNetwork(getConfig().network, req.params.ordinal)
    const controller = new SbtcWalletController();
    console.log('/bridge-api/:network/v1/sbtc/address/balances/:stxAddress/:cardinal/:ordinal')
    const response = await controller.fetchUserBalances(req.params.stxAddress, req.params.cardinal, req.params.ordinal);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

/**
router.get("/bridge-api/:network/v1/sbtc/events/save", (req, res, next) => {
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

router.get("/bridge-api/:network/v1/sbtc/events/index/stacks/:txid", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/sbtc/events/save/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.saveSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/:page", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/sbtc/data", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/sbtc/wallet-address", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcWalletAddress();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins/search/:stxAddress", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestsByStacksAddress(req.params.stxAddress);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequests();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
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
router.put("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/sbtc/pegin-scan", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.scanPeginRequests();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/commit-scan/:btcAddress/:stxAddress/:sbtcWalletAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.scanCommitments(req.params.btcAddress, req.params.stxAddress, req.params.sbtcWalletAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins/:_id", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestById(req.params._id);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/signers/pox-info", async (req, res, next) => {
  try {
    console.log('signers/pox-info')
    const controller = new SignersController();
    const response = await controller.fetchPoxInfo();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

export { router as stacksRoutes }
