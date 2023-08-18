import { contractPrincipalCV, deserializeCV, cvToJSON, serializeCV, principalCV } from "micro-stacks/clarity";
import fetch from 'node-fetch';
//import { callContractReadOnly } from './sbtc_rpc.js'
import { sbtcMiniContracts, type BlockchainInfo, type PoxInfo, type StacksInfo } from 'sbtc-bridge-lib';
import { fetchBitcoinTipHeight } from './bitcoin/mempool_api.js'
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

export async function fetchDelegationInfo(stxAddress:string):Promise<any> {
  
  const window = await fetchCurrentWindow()
  console.log('fetchDelegationInfo: window: ', window)

  const contractId = getConfig().poxContractId;
  const data = getData(contractId, 'get-check-delegation') 
  //const data = getData(contractId, 'delegation-state') 
  data.functionArgs = [`0x${bytesToHex(serializeCV(principalCV(stxAddress)))}`];
  //const response = await callContractMap(data);
  const response = await callContractReadOnly(data);
  console.log('getDelegationInfo: ', response)
  if (!response || response.type === '(optional none)') return undefined;
  return response.value;
}
 
export async function fetchAllowanceContractCallers(stxAddress:string):Promise<any> {
  try {
    const delegateTo = getConfig().sbtcMiniDeployer + '.' + sbtcMiniContracts.pool;
    const contractId = getConfig().poxContractId;    console.log('fetchAllowanceContractCallers: contractId: ', contractId)
    const data = getData(contractId, 'get-allowance-contract-callers');
    data.functionArgs = [`0x${bytesToHex(serializeCV(principalCV(stxAddress)))}`, `0x${bytesToHex(serializeCV(contractPrincipalCV(delegateTo)))}`];
    const response = await callContractReadOnly(data);
    console.log('fetchAllowanceContractCallers: response: ', response.value.value['until-burn-ht'].value.value)
    //const result = Number(response.value);
    return { untilBlockHeight: Number(response.value.value['until-burn-ht'].value.value) };
  } catch(err:any) {
    console.log(err.message)
    return { untilBlockHeight: 0 };
  }
}




export async function fetchPoxInfo(contractId:string):Promise<BlockchainInfo> {
  let poxInfo:PoxInfo;
  let stacksInfo:StacksInfo;
  let sbtcWindow:string;
  try {
    const data = getData(contractId, 'get-pox-info') 
    const response = await callContractReadOnly(data);
    poxInfo = {
      currentRejectionVotes: getValOrZero(response, 'current-rejection-votes'),
      firstBurnchainBlockHeight: getValOrZero(response, 'first-burnchain-block-height'),
      minAmountUstx: getValOrZero(response, 'min-amount-ustx'),
      prepareCycleLength: getValOrZero(response, 'prepare-cycle-length'),
      rejectionFraction: getValOrZero(response, 'rejection-fraction'),
      rewardCycleId: getValOrZero(response, 'reward-cycle-id'),
      rewardCycleLength: getValOrZero(response, 'reward-cycle-length'),
      totalLiquidSupplyUstx: getValOrZero(response, 'total-liquid-supply-ustx')
    }
  } catch(err:any) {
    console.log(err.message)
    return {} as BlockchainInfo;
  }
  try {
      //const bcInfo = await getBlockChainInfo()
      sbtcWindow = await fetchCurrentWindow();
      console.log('fetchStacksInfo: ', sbtcWindow)
      stacksInfo = await fetchStacksInfo()
    } catch(err:any) {
      console.log(err.message)
      return {} as BlockchainInfo;
    }
    const bcInfo:BlockchainInfo = {
      sbtcWindow,
      mainnetTipHeight: -1,
      poxInfo,
      stacksInfo
    }
    return bcInfo;
}

export async function fetchCurrentWindow():Promise<string> {
  try {
    const data = getData(getConfig().sbtcMiniDeployer + '.' + sbtcMiniContracts.pool, 'get-current-window');
    data.functionArgs = [];
    const response = await callContractReadOnly(data);
    console.log('fetchCurrentWindow: ', response)
    if (response.okay) {
      return response.value;
    }
    return 'unknown';
  } catch(err:any) {
    console.log(err.message)
    return 'unknown';
  }
}

export async function fetchStacksInfo():Promise<StacksInfo> {
  try {
    const url = getConfig().stacksApi + '/v2/info'
    const response = await fetch(url);
    const stacksInfo = await response.json();
    return stacksInfo;
  } catch(err:any) {
    console.log(err.message)
    return {} as StacksInfo;
  }
}

export async function getNumRewardSetPoxAddresses(contractId:string, rewardCycle: number):Promise<any> {
  try {
    const data = getData(contractId, 'get-num-reward-set-pox-addresses');
    data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
    const response = await callContractReadOnly(data);
    const result = Number(response.value);
    return result;
  } catch(err:any) {
    console.log(err.message)
    return -1;
  }
}
export async function getTotalPoxRejection(contractId:string, rewardCycle: number):Promise<any> {
  try {
    const data = getData(contractId, 'get-total-pox-rejection');
    data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
    const response = await callContractReadOnly(data);
    const result = Number(response.value);
    return result;
    } catch(err:any) {
    console.log(err.message)
    return -1;
  }
}

export async function isPoxActive(contractId:string, rewardCycle: number):Promise<any> {
  try {
    const data = getData(contractId, 'is-pox-active');
    data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
    const response = await callContractReadOnly(data);
    const result = (response.value);
    return result;
  } catch(err:any) {
    console.log(err.message)
    return 0;
  }
}

export async function burnHeightToRewardCycle(contractId:string, burnHeight: number):Promise<any> {
  try {
    const data = getData(contractId, 'burn-height-to-reward-cycle');
    data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(burnHeight)))}`];
    const response = await callContractReadOnly(data);
    const result = Number(response.value);
    return result;
  } catch(err:any) {
    console.log(err.message)
    return 0;
  }
}
export async function rewardCycleToBurnHeight(contractId:string, rewardCycle: number):Promise<any> {
  const data = getData(contractId, 'reward-cycle-to-burn-height');
  data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
  const response = await callContractReadOnly(data);
  const result = Number(response.value);
  return result;
}
export async function getRewardSetSize(contractId:string, rewardCycle: number):Promise<any> {
  try {
    const data = getData(contractId, 'get-reward-set-size');
    data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
    const response = await callContractReadOnly(data);
    const result = Number(response.value);
    return result;
  } catch(err:any) {
    console.log(err.message)
    return 0;
  }
}
export async function getTotalUstxStacked(contractId:string, rewardCycle: number):Promise<any> {
  try {
    const data = getData(contractId, 'get-total-ustx-stacked');
    data.functionArgs = [`0x${bytesToHex(serializeCV(uintCV(rewardCycle)))}`];
    const response = await callContractReadOnly(data);
    const result = Number(response.value);
    return result;
  } catch(err:any) {
    console.log(err.message)
    return 0;
  }
}
export async function getStackingMinimum(contractId:string):Promise<any> {
  try {
    const data = getData(contractId, 'get-stacking-minimum');
    data.functionArgs = [];
    const response = await callContractReadOnly(data);
    const result = Number(response.value);
    return result;
  } catch(err:any) {
    console.log(err.message)
    return 0;
  }
}

export async function callContractReadOnly(data:any) {
  const url = getConfig().stacksApi + '/v2/contracts/call-read/' + data.contractAddress + '/' + data.contractName + '/' + data.functionName
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
    const result = cvToJSON(deserializeCV(val.result));
    return result;
  } catch (err:any) {
    console.log('callContractReadOnly4: error: ', err.message);
  }
  return val;
}

export async function callContractMap(data:any) {
  const url = getConfig().stacksApi + '/v2/map_entry/' + data.contractAddress + '/' + data.contractName + '/' + data.functionName
  console.log('callContractReadOnly: ' + url)
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
    console.log('callContractReadOnly3: ', val);
    const result = cvToJSON(deserializeCV(val.result));
    return result;
  } catch (err) {
    console.log('callContractReadOnly4: ', err);
    return;
  }
}

function getValOrZero(resp:any, field:string) {
  try {
    return Number(resp.value.value[field].value)
  } catch (err) {
    return 0;
  }
}