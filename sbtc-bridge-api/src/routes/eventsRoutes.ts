import express from "express";
import { EventsController } from "./events/EventsController.js";
import { findContractEventByBitcoinAddress, findContractEventByBitcoinTxId, findContractEventById, findContractEventBySbtcWalletAddress, findContractEventByStacksAddress } from "../lib/data/db_models.js";

const router = express.Router();

router.get("/index/stacks/:txid", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.indexSbtcEvent(req.params.txid);
    //const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/save/:page", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.saveSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-by/filter/:name/:value", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.findSbtcEventsByFilter(req.params.name, req.params.value);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-by/stacks/:stacksAddress", async (req, res, next) => {
  try {
    const response = await findContractEventByStacksAddress(req.params.stacksAddress);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-by/bitcoin-txid/:bitcoinTxid", async (req, res, next) => {
  try {
    const response = await findContractEventByBitcoinTxId(req.params.bitcoinTxid);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-by/bitcoin/:bitcoinAddress", async (req, res, next) => {
  try {
    const response = await findContractEventByBitcoinAddress(req.params.bitcoinAddress);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-by/sbtc-wallet/:sbtcWallet", async (req, res, next) => {
  try {
    const response = await findContractEventBySbtcWalletAddress(req.params.sbtcWallet);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-one/:id", async (req, res, next) => {
  try {
    const response = await findContractEventById(req.params.id);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/find-all", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.findAllSbtcEvents();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/find-by/page/:page/:limit", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.findSbtcEventsByPage(Number(req.params.page), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/find-by/filter-and-page/:filter/:page/:limit", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.findSbtcEventsByFilterAndPage(req.params.filter, Number(req.params.page), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/count", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.countSbtcEvents();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as eventsRoutes }
