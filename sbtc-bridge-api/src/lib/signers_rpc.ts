import { deserializeCV, cvToJSON, serializeCV } from "micro-stacks/clarity";
import fetch from 'node-fetch';
//import { callContractReadOnly } from './sbtc_rpc.js'
import type { BlockchainInfo, PoxInfo, StacksInfo } from 'sbtc-bridge-lib';
import { fetchMainnetTipHeight } from './bitcoin/mempool_api.js'
import { uintCV } from 'micro-stacks/clarity';
import { bytesToHex } from "micro-stacks/common";
import { getConfig } from './config.js';

function getData(contractId:string, functionName:string) {
  return {
    contractAddress: contractId!.split('.')[0],
    contractName: contractId!.split('.')[1],
    functionName,
    functionArgs: [],
    network: getConfig().network
  }
}
export async function fetchPoxInfo(contractId:string):Promise<BlockchainInfo> {
  const data = getData(contractId, 'get-pox-info') 
  const response = await callContractReadOnly(data);
  const poxInfo:PoxInfo = {
    currentRejectionVotes: getValOrZero(response, 'current-rejection-votes'),
    firstBurnchainBlockHeight: getValOrZero(response, 'first-burnchain-block-height'),
    minAmountUstx: getValOrZero(response, 'min-amount-ustx'),
    prepareCycleLength: getValOrZero(response, 'prepare-cycle-length'),
    rejectionFraction: getValOrZero(response, 'rejection-fraction'),
    rewardCycleId: getValOrZero(response, 'reward-cycle-id'),
    rewardCycleLength: getValOrZero(response, 'reward-cycle-length'),
    totalLiquidSupplyUstx: getValOrZero(response, 'total-liquid-supply-ustx')
  }
  //const bcInfo = await getBlockChainInfo()
  const mainnetTipHeight = Number(await fetchMainnetTipHeight())
  const stacksInfo:StacksInfo = await fetchStacksInfo()
  const bcInfo:BlockchainInfo = {
    mainnetTipHeight,
    poxInfo,
    stacksInfo
  }
  return bcInfo;
}

export async function fetchStacksInfo():Promise<StacksInfo> {
  const url = 'https://api.hiro.so/v2/info'
  const response = await fetch(url);
  const stacksInfo = await response.json();
  return stacksInfo;
}

export async function getNumRewardSetPoxAddresses(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'get-num-reward-set-pox-addresses');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}
export async function getTotalPoxRejection(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'get-total-pox-rejection');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}

export async function isPoxActive(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'is-pox-active');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = (response.value);
  return result;
}

export async function burnHeightToRewardCycle(contractId:string, burnHeight: number):Promise<any> {
  const data = getData(contractId, 'burn-height-to-reward-cycle');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(burnHeight)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}
export async function rewardCycleToBurnHeight(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'reward-cycle-to-burn-height');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}
export async function getRewardSetSize(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'get-reward-set-size');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}
export async function getTotalUstxStacked(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'get-total-ustx-stacked');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}
export async function getStackingMinimum(contractId:string):Promise<any> {
  const data = getData(contractId, 'get-stacking-minimum');
  data.functionArgs = [];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}



export async function callContractReadOnly(data:any) {
  const url = 'https://api.hiro.so' + '/v2/contracts/call-read/' + data.contractAddress + '/' + data.contractName + '/' + data.functionName
  let val;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arguments: data.functionArgs,
        sender: data.contractAddress,
      })
    });
    val = await response.json();
  } catch (err) {
    console.log('callContractReadOnly4: ', err);
  }
  const result = cvToJSON(deserializeCV(val.result));
  return result;
}

function getValOrZero(resp:any, field:string) {
  try {
    return Number(resp.value.value[field].value)
  } catch (err) {
    return 0;
  }
}