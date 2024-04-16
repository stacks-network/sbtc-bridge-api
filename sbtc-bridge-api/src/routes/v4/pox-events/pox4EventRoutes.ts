
import express from "express";
import { getConfig } from "../../../lib/config.js";
import { aggregateDelegationData, countsPoolStackerEvents, countsPoolStackerEventsByEvent, findPoolStackerEvents, findPoolStackerEventsByDelegator, findPoolStackerEventsByEvent, findPoolStackerEventsByHashBytes, findPoolStackerEventsByStacker, findPoolStackerEventsByStackerAndEvent, readPox4Events } from "./pox4_events_helper.js";

const router = express.Router();

router.get("/stacks-info", async (req, res, next) => {
  try {
    const url = getConfig().stacksApi + '/v2/info';
    const response = await fetch(url)
    const result = await response.json();
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching stacks-info.')
  }
});


router.get("/stacker-events-by-hashbytes/:hashBytes/:page/:limit", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByHashBytes(req.params.hashBytes, Number(req.params.page), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
})

router.get("/stacker-events-by-stacker/:address", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByStacker(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
})

router.get("/stacker-events-by-delegator/:address", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByDelegator(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
})

router.get("/stacker-events-by-stacker-event/:stacker/:event", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByStackerAndEvent(req.params.stacker, req.params.event);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/stacker-events/:page/:limit", async (req, res, next) => {
  try {
    const response = await findPoolStackerEvents(Number(req.params.page), Number(req.params.limit));
    const total = await countsPoolStackerEvents();
    return res.send({events:response, total});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/aggregate-delegation-data", async (req, res, next) => {
  try {
    const response = await aggregateDelegationData();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/stacker-events-by-event/:event/:page/:limit", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByEvent(req.params.event, Number(req.params.page), Number(req.params.limit));
    const total = await countsPoolStackerEventsByEvent(req.params.event);
    return res.send({events:response, total});
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/sync/events", async (req, res, next) => {
  try {
    readPox4Events();
    return res.send('syncing data');
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as pox4EventRoutes }


