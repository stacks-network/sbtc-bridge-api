import express from "express";
import { TransactionController, BlocksController, WalletController } from "./bitcoin/BitcoinRPCController.js";
import type { WrappedPSBT } from 'sbtc-bridge-lib';
import { updateExchangeRates } from '../lib/bitcoin/api_blockcypher.js';

const router = express.Router();

router.get("/blocks/count", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getCount();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

/**
 * getTxOutProof
 */
router.get("/blocks/gettxoutproof/:txs/:blockhash", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getTxOutProof(req.params.txs, req.params.blockhash);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred in /blocks/gettxoutproof/:txs/:blockhash.') 
  }
});

/**
 * getBlock
 */
router.get("/blocks/block/:blockhash/:verbosity", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getBlock(req.params.blockhash, Number(req.params.verbosity));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching /blocks/block/:blockhash/:verbosity.') 
  }
});

/**
 * getHeader
 */
router.get("/blocks/block-header/:blockhash/:verbosity", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getHeader(req.params.blockhash, Boolean(req.params.verbosity));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching /blocks/block-header/:blockhash/:verbosity.') 
  }
});

router.get("/blocks/info", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getInfo();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/blocks/fee-estimate", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/wallet/validate/:address", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.validateAddress(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/wallet/walletprocesspsbt", async (req, res, next) => {
  try {
    console.log(req.headers)
    const tx = req.body;
    const controller = new WalletController();
    const response = await controller.processPsbt(tx.hex);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/wallet/address/:address/txs", async (req, res, next) => {
  try {
    //checkAddressForNetwork(getConfig().network, req.params.address)
    const controller = new WalletController();
    const response = await controller.fetchAddressTransactions(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


router.get("/wallet/address/:address/utxos", async (req, res, next) => {
  try {
    //checkAddressForNetwork(getConfig().network, req.params.address)
    const controller = new WalletController();
    const response = await controller.fetchUtxoSet(req.params.address, (req.query.verbose) ? true : false);
    return res.send(response);
  } catch (error:any) {
    console.log('Error in routes: ' + error.message)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/wallet/loadwallet/:name", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.loadWallet(req.params.name);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
router.get("/wallet/listwallets", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.listWallets();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching bitcoin wallet info.') 
  }
});

router.get("/wallet/create/:wallet", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.createWallet(req.params.wallet);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/wallet/getnewaddress/:addressType", async (req, res, next) => {
  try {
    const controller = new WalletController();
    await controller.loadWallet(req.params.addressType);
    const response = await controller.generateNewAddress(req.params.addressType);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/tx/rates", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.getRates();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/tx/rates/force", async (req, res, next) => {
  try {
    await updateExchangeRates();
    const controller = new TransactionController();
    const response = await controller.getRates();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/tx/keys", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.getKeys();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/tx/commitment/:stxAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitment(req.params.stxAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/tx/sign", async (req, res, next) => {
  try {
    const wrappedPsbt:WrappedPSBT = req.body;
    console.log('wrappedPsbt 0: ', req.body);
    const controller = new TransactionController();
    const response = await controller.signAndBroadcast(wrappedPsbt);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/tx/signAndBroadcast", async (req, res, next) => {
  try {
    const wrappedPsbt:WrappedPSBT = req.body;
    console.log('wrappedPsbt: ', wrappedPsbt);
    const controller = new TransactionController();
    const response = await controller.signAndBroadcast(wrappedPsbt);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/tx/:txid", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchRawTransaction(req.params.txid);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/tx/:txid/hex", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchTransactionHex(req.params.txid);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/tx/sendrawtx", async (req, res, next) => {
  try {
    console.log('/btc/tx/sendrawtx', req.body);
    const tx = req.body;
    const controller = new TransactionController();
    const result = await controller.sendRawTransaction(tx.hex);
    console.log('/btc/tx/sendrawtx', result);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


export { router as bitcoinRoutes }
