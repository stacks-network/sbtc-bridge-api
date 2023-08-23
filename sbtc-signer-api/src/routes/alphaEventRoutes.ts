import { AlphaEventsController } from "./controllers/AlphaEventsController.js"

import express from 'express';
const router = express.Router();

router.get("/alpha/read/:page", async (req, res, next) => {
  try {
    const controller = new AlphaEventsController();
    const response = await controller.saveAlphaEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/alpha/read-all", async (req, res, next) => {
  try {
    const controller = new AlphaEventsController();
    controller.saveAllAlphaEvents();
    const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/alpha/index/stacks/:txid", async (req, res, next) => {
  try {
    const controller = new AlphaEventsController();
    const response = await controller.indexAlphaEvent(req.params.txid);
    //const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/alpha/count", async (req, res, next) => {
  try {
    const controller = new AlphaEventsController();
    const response = await controller.countEvents();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/alpha/:page", async (req, res, next) => {
  try {
    const controller = new AlphaEventsController();
    const response = await controller.findAlphaEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as alphaEventRoutes }
