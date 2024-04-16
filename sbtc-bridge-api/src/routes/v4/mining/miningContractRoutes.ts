import express from "express";
import { aggregateMiningData, syncLayer2Transactions, syncLayer2TransactionsChangeAddresses } from "./mining_contract_helper.js";

const router = express.Router();

router.get("/sync/bitcoin-transactions", async (req, res, next) => {
  try {
    const response = await syncLayer2Transactions();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/bitcoin-transactions/change-addresses", async (req, res, next) => {
  try {
    syncLayer2TransactionsChangeAddresses();
    return res.send('fixing change address data');
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/aggregate-data", async (req, res, next) => {
  try {
    const response = await aggregateMiningData();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as miningContractRoutes }
