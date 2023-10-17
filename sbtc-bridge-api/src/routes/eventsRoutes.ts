import express from "express";
import { EventsController } from "./events/EventsController.js";

const router = express.Router();

router.get("/read", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.readAllEvents();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

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

router.get("/filter/:name/:value", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.findSbtcEventsByFilter(req.params.name, req.params.value);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/:page", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.findSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

export { router as eventsRoutes }
