import express from "express";
import { DefaultController, FeeEstimationController, UTXOController } from "../controllers/BitcoinRPCController";
import { SbtcWalletController } from "../controllers/StacksRPCController";
import { ConfigController } from "../controllers/ConfigController";

const router = express.Router();

router.get('/', (req, res) => {
  const controller = new DefaultController();
  const response = controller.getFeeEstimate();
  return res.send(response);
});

router.get("/bridge-api/v1/btc-fee-estimate", async (_req, res) => {
  const controller = new FeeEstimationController();
  const response = await controller.getFeeEstimate();
  return res.send(response);
});

router.get("/bridge-api/v1/btc/address/:address/utxos", async (req, res) => {
  const controller = new UTXOController();
  const response = await controller.fetchUtxoSet(req.params.address);
  return res.send(response);
});

router.get("/bridge-api/v1/sbtc/address/:address/balance", async (req, res) => {
  const controller = new SbtcWalletController();
  const response = await controller.fetchUserSbtcBalance(req.params.address);
  return res.send(response);
});

router.get("/bridge-api/v1/sbtc/events", async (req, res) => {
  const controller = new SbtcWalletController();
  const response = await controller.fetchSbtcEvents();
  return res.send(response);
});

router.get("/bridge-api/v1/sbtc/data", async (req, res) => {
  const controller = new SbtcWalletController();
  const response = await controller.fetchSbtcContractData();
  return res.send(response);
});

router.get("/bridge-api/v1/sbtc/wallet-address", async (req, res) => {
  const controller = new SbtcWalletController();
  const response = await controller.fetchSbtcWalletAddress();
  return res.send(response);
});

router.get("/bridge-api/v1/config", async (req, res) => {
  const controller = new ConfigController();
  const response = await controller.getAllParam();
  return res.send(response);
});

router.get("/bridge-api/v1/config/:param", async (req, res) => {
  const controller = new ConfigController();
  const response = await controller.getParam(req.params.param);
  return res.send(response);
});

router.get('*', function(req, res) {
  res.sendStatus(404).send("Welcome to the Mini sBTC Bridge");
});


export default router;