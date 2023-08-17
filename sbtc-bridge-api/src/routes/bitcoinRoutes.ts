import express from "express";
import { TransactionController, BlocksController, DefaultController, WalletController } from "../controllers/BitcoinRPCController.js";
import type { WrappedPSBT } from 'sbtc-bridge-lib';
import { updateExchangeRates } from '../lib/bitcoin/blockcypher_api.js';

const router = express.Router();

router.get("/bridge-api/:network/v1/btc/blocks/count", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getCount();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/info", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getInfo();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/fee-estimate", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/validate/:address", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.validateAddress(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/wallet/walletprocesspsbt", async (req, res, next) => {
  try {
    const tx = req.body;
    const controller = new WalletController();
    const response = await controller.processPsbt(tx.hex);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/address/:address/txs", async (req, res, next) => {
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


router.get("/bridge-api/:network/v1/btc/wallet/address/:address/utxos", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/btc/wallet/loadwallet/:name", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.loadWallet(req.params.name);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
router.get("/bridge-api/:network/v1/btc/wallet/listwallets", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.listWallets();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/rates", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.getRates();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/bridge-api/:network/v1/btc/tx/rates/force", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/btc/tx/keys", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.getKeys();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commit-deposit-data/:stxAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitDepositData(req.params.stxAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commit-deposit/:data", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitDeposit(req.params.data);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


router.get("/bridge-api/:network/v1/btc/tx/commit-withdrawal-data/:signature/:amount", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitWithdrawalData(req.params.signature, Number(req.params.amount));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commit-withdrawal/:data/:sbtcWallet/:compression", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitWithdrawal(req.params.data, req.params.sbtcWallet, Number(req.params.compression));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commitment/:stxAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitment(req.params.stxAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/tx/sign", async (req, res, next) => {
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

router.post("/bridge-api/:network/v1/btc/tx/signAndBroadcast", async (req, res, next) => {
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

router.get("/bridge-api/:network/v1/btc/tx/:txid", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchRawTransaction(req.params.txid);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/:txid/hex", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchTransactionHex(req.params.txid);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/tx/sendrawtx", async (req, res, next) => {
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
