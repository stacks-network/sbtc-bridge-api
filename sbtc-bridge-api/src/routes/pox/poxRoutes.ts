import express from "express";
import { findRewardSlotByAddress, findRewardSlotByAddressMinHeight, findRewardSlotByCycle, readRewardSlots } from "./reward_slot_helper.js";
import { findPoxEntriesByAddress, findPoxEntriesByCycle, readPoxEntriesFromContract, readSavePoxEntries } from "./pox_helper.js";
import { getAllowanceContractCallers, getPoxBitcoinAddressInfo, getPoxCycleInfo, getPoxInfo, getPoxStacksAddressInfo, getRewardSetPoxAddress } from "./pox_contract_helper.js";
import { readDelegationEvents } from "./delegation_helper.js";
import { findPoolStackerEventsByHashBytes, findPoolStackerEventsByStacker, findPoolStackerEventsByStackerAndEvent, readPoolStackerEvents } from "./pool_stacker_events_helper.js";

const router = express.Router();

router.get("/info", async (req, res, next) => {
  try {
    const response = await getPoxInfo();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/info/cycle/:cycle", async (req, res, next) => {
  try {
    const cycleInfo = await getPoxCycleInfo(Number(req.params.cycle));
    return res.send(cycleInfo);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/delegation-events/:poolPrincipal/:offset/:limit", async (req, res, next) => {
  try {
    const response = await readDelegationEvents(req.params.poolPrincipal, Number(req.params.offset), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/get-allowance-contract-callers/:address/:contract", async (req, res, next) => {
  try {
    const response = await getAllowanceContractCallers(req.params.address, req.params.contract);
    console.log(response)
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/pox-entries/:bitcoinAddress", async (req, res, next) => {
  try {
    const response = await findPoxEntriesByAddress(req.params.bitcoinAddress);
    console.log(response)
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/solo-stacker/:btcAddress/:cycle/:sender", async (req, res, next) => {
  try {
    const btcAddress = req.params.btcAddress
    let response:any = {};
    response = await getPoxBitcoinAddressInfo(btcAddress, Number(req.params.cycle), req.params.sender);
    console.log(response)
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/stacker/:stxAddress/:cycle", async (req, res, next) => {
  try {
    const stxAddress = req.params.stxAddress
    let response:any = {};
    response = await getPoxStacksAddressInfo(stxAddress, Number(req.params.cycle));
    response.cycleInfo = await getPoxCycleInfo(Number(req.params.cycle));
    console.log(response)
    return res.send(response);
  } catch (error) {
    console.error('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/reward-slot/:address/least-recent", async (req, res, next) => {
  try {
    const response = await findRewardSlotByAddressMinHeight(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/reward-slot/:address", async (req, res, next) => {
  try {
    const response = await findRewardSlotByAddress(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/sync/reward-slots/:offset/:limit", async (req, res, next) => {
  try {
    const poxInfo = await getPoxInfo()
    const response = await readRewardSlots(Number(req.params.offset), Number(req.params.limit), poxInfo);
    return res.send(response);
  } catch (error) {
    console.error('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/sync/pox-entries/:cycle", async (req, res, next) => {
  try {
    const response = await readPoxEntriesFromContract(Number(req.params.cycle));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});
router.get("/sync/pox-entries/:cycle/:index", async (req, res, next) => {
  try {
    const cycle = Number(req.params.cycle)
    const index = Number(req.params.index)
    const response = await readSavePoxEntries(cycle, index + 1, index);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.') 
  }
});


router.get("/reward-slots/:cycle", async (req, res, next) => {
  try {
    const response = await findRewardSlotByCycle(Number(req.params.cycle));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/pox-entries/:cycle", async (req, res, next) => {
  try {
    const response = await findPoxEntriesByCycle(Number(req.params.cycle));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/solo-stacker-events/:hashBytes/:page/:limit", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByHashBytes(req.params.hashBytes, Number(req.params.page), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
})

router.get("/pool-stacker-events/:stacker", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByStacker(req.params.stacker);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/pool-stacker-events/:stacker/:event", async (req, res, next) => {
  try {
    const response = await findPoolStackerEventsByStackerAndEvent(req.params.stacker, req.params.event);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/sync/stacker-events", async (req, res, next) => {
  try {
    readPoolStackerEvents();
    return res.send('syncing data');
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as poxRoutes }


