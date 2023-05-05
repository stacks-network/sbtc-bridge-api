import express from "express";
import { TransactionController, BlocksController, DefaultController, WalletController } from "../controllers/BitcoinRPCController.js";
import { SbtcWalletController, PaymentsController } from "../controllers/StacksRPCController.js";
import { ConfigController } from "../controllers/ConfigController.js";
import type { PeginRequestI } from '../types/pegin_request.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const controller = new DefaultController();
    const response = controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/count", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getCount();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/info", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getInfo();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/fee-estimate", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/validate/:address", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.validateAddress(req.params.address);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.post("/bridge-api/:network/v1/btc/wallet/walletprocesspsbt", async (req, res, next) => {
  try {
    console.log('/btc/tx/sendrawtx', req.body);
    const tx = req.body;
    const controller = new WalletController();
    const response = await controller.processPsbt(tx.hex);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/address/:address/txs", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.fetchAddressTransactions(req.params.address);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/address/:address/utxos", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.fetchUtxoSet(req.params.address, (req.query.verbose) ? true : false);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/loadwallet/:name", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.loadWallet(req.params.name);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});
router.get("/bridge-api/:network/v1/btc/wallet/listwallets", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.listWallets();
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/:network/v1/btc/tx/:txid", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchRawTransaction(req.params.txid);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/btc/tx/:txid/hex", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchTransactionHex(req.params.txid);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
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
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/address/:address/balance", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchUserSbtcBalance(req.params.address);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});
 
router.get("/bridge-api/:network/v1/sbtc/events/save", (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    controller.saveAllSbtcEvents();
    const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/index/stacks/:txid", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.indexSbtcEvent(req.params.txid);
    //const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/save/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.saveSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.findSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/data", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcContractData();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/wallet-address", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcWalletAddress();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins/search/:stxAddress", async (req, res, next) => {
  try {
    const controller = new PaymentsController();
    const response = await controller.findPeginRequestsByStacksAddress(req.params.stxAddress);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.post("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
  try {
    console.log('/sbtc/pegins', req.body);
    const peginRequest:PeginRequestI = req.body;
    const controller = new PaymentsController();
    const response = await controller.savePeginCommit(peginRequest);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegin-scan", async (req, res, next) => {
  try {
    const controller = new PaymentsController();
    const response = await controller.scanPeginRequests();
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins/:_id", async (req, res, next) => {
  try {
    const controller = new PaymentsController();
    const response = await controller.findPeginRequestById(req.params._id);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});



router.get("/bridge-api/:network/v1/config", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getAllParam();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/:network/v1/config/:param", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getParam(req.params.param);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get('*', function(req, res) {
  res.sendStatus(404);
});


export default router;