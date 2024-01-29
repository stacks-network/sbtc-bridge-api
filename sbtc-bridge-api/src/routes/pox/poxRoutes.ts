import express from "express";
import { findRewardSlotByAddress, findRewardSlotByAddressMinHeight, readRewardSlots } from "./reward_slot_helper.js";
import { readPoxAddressInfo } from "../dao/pox_helper.js";
import { getAllowanceContractCallers, getPoxBitcoinAddressInfo, getPoxCycleInfo, getPoxInfo, getPoxStacksAddressInfo, getRewardSetPoxAddress } from "./pox_contract_helper.js";

const router = express.Router();

router.get("/info", async (req, res, next) => {
  try {
    const response = await getPoxInfo();
    console.log(response)
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

router.get("/pool-stacker/:stxAddress/:cycle", async (req, res, next) => {
  try {
    const stxAddress = req.params.stxAddress
    let response:any = {};
    response = await getPoxStacksAddressInfo(stxAddress, Number(req.params.cycle));
    response.cycleInfo = await getPoxCycleInfo(Number(req.params.cycle));
    console.log(response)
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox-info.')
  }
});

router.get("/get-reward-set-pox-address/:cycle/:index", async (req, res, next) => {
  try {
    const response = await getRewardSetPoxAddress(Number(req.params.cycle), Number(req.params.index));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
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

router.get("/reward-slot/sync/read-reward-slots/:offset/:limit", async (req, res, next) => {
  try {
    const response = await readRewardSlots(Number(req.params.offset), Number(req.params.limit));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/sync/read-reward-set-pox-address/:cycle", async (req, res, next) => {
  try {
    const response = await readPoxAddressInfo(Number(req.params.cycle));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as poxRoutes }


