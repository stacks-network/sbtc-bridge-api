import express from "express";
import { TransactionController, BlocksController, DefaultController, WalletController } from "../controllers/BitcoinRPCController";
import { SbtcWalletController } from "../controllers/StacksRPCController";
import { ConfigController } from "../controllers/ConfigController";

const router = express.Router();

router.get('/', (req, res) => {
  const controller = new DefaultController();
  const response = controller.getFeeEstimate();
  return res.send(response);
});

router.get("/bridge-api/v1/btc/blocks/count", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getCount();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/btc/blocks/info", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getInfo();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/btc/blocks/fee-estimate", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/btc/wallet/address/:address/utxos", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.fetchUtxoSet(req.params.address);
    return res.send(response);
  } catch (error) {
    next(error)
  }
});

router.get("/bridge-api/v1/btc/tx/:txid", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchRawTransaction(req.params.txid);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/sbtc/address/:address/balance", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchUserSbtcBalance(req.params.address);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/sbtc/events", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcEvents();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/sbtc/data", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcContractData();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/sbtc/wallet-address", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcWalletAddress();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/config", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getAllParam();
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get("/bridge-api/v1/config/:param", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getParam(req.params.param);
    return res.send(response);
  } catch (error) { // manually catching
    next(error) // passing to default middleware error handler
  }
});

router.get('*', function(req, res) {
  res.sendStatus(404).send("Welcome to the Mini sBTC Bridge");
});


export default router;