import { getConfig } from "../../lib/config.js";
import { hex } from '@scure/base';
import { contractPrincipalCV, serializeCV, principalCV, uintCV, tupleCV, bufferCV } from '@stacks/transactions';
import { callContractReadOnly } from "../stacks/stacks_helper.js";
import { getDaoConfig } from "../../lib/config_dao.js";
import * as btc from '@scure/btc-signer';
import { getAddressFromHashBytes, getHashBytesFromAddress } from "./pox_helper.js";
import { Delegation, Stacker, StackerInfo } from "../../types/pox_types.js";

export async function getPoxInfo() {
  const url = getConfig().stacksApi + '/v2/pox';
  const response = await fetch(url)
  return await response.json();
}

export async function getPoxBitcoinAddressInfo(address:string, cycle:number, sender:string):Promise<any> {
  return {
    partialStackedByCycle: await getPartialStackedByCycle(address, cycle, sender),
  };
}

export async function getPoxStacksAddressInfo(address:string, cycle:number):Promise<StackerInfo> {
  return {
    stacksAddress: address,
    stacker: await getStackerInfo(address),
    delegation: await getCheckDelegation(address),
    poxRejection: (cycle > 0) ? await getPoxRejection(address, cycle) : undefined,
  };
}

export async function getPoxCycleInfo(cycle:number):Promise<any> {
  const totalStacked = await getTotalUstxStacked(cycle)
  const numRewardSetPoxAddresses = await getNumRewardSetPoxAddresses(cycle)
  const numbEntriesRewardCyclePoxList = await getNumbEntriesRewardCyclePoxList(cycle)
  const totalPoxRejection = await getTotalPoxRejection(cycle)
  const rewardSetSize = await getRewardSetSize(cycle)
  return {
    rewardSetSize: (cycle > 0 && rewardSetSize) ? Number(rewardSetSize) : undefined,
    numRewardSetPoxAddresses: (numRewardSetPoxAddresses) ? Number(numRewardSetPoxAddresses) : 0,
    numbEntriesRewardCyclePoxList: (numbEntriesRewardCyclePoxList) ? Number(numbEntriesRewardCyclePoxList) : 0,
    totalPoxRejection: (totalPoxRejection) ? Number(totalPoxRejection) : 0,
    totalUstxStacked: (totalStacked && totalStacked.value) ? Number(totalStacked.value) : 0
  };
}

export async function getAllowanceContractCallers(address:string, contract:string):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`, `0x${hex.encode(serializeCV(contractPrincipalCV(contract.split('.')[0], contract.split('.')[1] )))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-allowance-contract-callers',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return result;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
}


async function getStackerInfo(address:string):Promise<Stacker|undefined> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-stacker-info',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return (result.value) ? {
      rewardSetIndexes: result.value.value['reward-set-indexes'].value,
      lockPeriod: result.value.value['reward-set-indexes'].value,
      firstRewardCycle: result.value.value['first-reward-cycle'].value,
      poxAddr: { 
        version: result.value.value['pox-addr'].value.version.value, 
        hashBytes: result.value.value['pox-addr'].value.hashbytes.value
      },
      bitcoinAddr: getAddressFromHashBytes(result.value.value['pox-addr'].value.hashbytes.value, result.value.value['pox-addr'].value.version.value),
    } : undefined;

    /**
    ;; how long the uSTX are locked, in reward cycles.
    ;; reward cycle when rewards begin
    ;; indexes in each reward-set associated with this user.
    ;; these indexes are only valid looking forward from
    ;;  `first-reward-cycle` (i.e., they do not correspond
    ;;  to entries in the reward set that may have been from
    ;;  previous stack-stx calls, or prior to an extend)
    ;; principal of the delegate, if stacker has delegated
     */


  } catch (e) { funding = '0' }
  return
}

async function getCheckDelegation(address:string):Promise<Delegation> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-check-delegation',
    functionArgs,
  }
  const val = await callContractReadOnly(data);
  console.log('getCheckDelegation: ', val.value)
  return (val.value) ? {
    amountUstx: val.value.value['first-reward-cycle'].value,
    delegatedTo: val.value.value['delegated-to'].value,
    untilBurnHt: val.value.value['first-reward-cycle'].value,
    poxAddr: val.value.value['first-reward-cycle'].value,
  } : {
    amountUstx: 0,
    delegatedTo: undefined,
    untilBurnHt: 0,
    poxAddr: undefined
  }
}

export async function getTotalUstxStacked(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-total-ustx-stacked',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? val.value: 0
}

export async function getRewardSetPoxAddress(cycle:number, index:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`, `0x${hex.encode(serializeCV(uintCV(index)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'get-reward-set-pox-address',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? val.value.value: 0
}

export async function getNumbEntriesRewardCyclePoxList(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'get-num-reward-set-pox-addresses',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? val.value: 0
}

export async function getBurnHeightToRewardCycle(burnHeight:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(burnHeight)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'burn-height-to-reward-cycle',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? val.value.value: 0
}

async function getTotalPoxRejection(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'get-total-pox-rejection',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? val.value.value: 0
}


async function getPoxRejection(address:string, cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`,`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-pox-rejection',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? { poxRejectionPerStackerPerCycle: val.value.value } : { poxRejectionPerStackerPerCycle: 0 }
}

async function getRewardSetSize(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-reward-set-size',
    functionArgs,
  }
  const val = (await callContractReadOnly(data));
  return (val.value) ? val.value: 0
}

async function getNumRewardSetPoxAddresses(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-num-reward-set-pox-addresses',
    functionArgs,
  }
  try {
    const result = await callContractReadOnly(data);
    return result.value;
  } catch (e) {  
    return { stacked: 0 }
  }
}

async function getPartialStackedByCycle(address:string, cycle:number, sender:string):Promise<any> {
  const poxAddress = getHashBytesFromAddress(address)
  console.debug('getPartialStackedByCycle 1: ' + address)
  console.debug('getPartialStackedByCycle: ', poxAddress)
  try {
    const functionArgs = [
      `0x${hex.encode(serializeCV(tupleCV({version: bufferCV(poxAddress.version), hashbytes: bufferCV(poxAddress.hashBytes)})))}`,
      `0x${hex.encode(serializeCV(uintCV(cycle)))}`,
      (sender.indexOf('.') === -1) ? `0x${hex.encode(serializeCV(principalCV(sender)))}` : `0x${hex.encode(serializeCV(contractPrincipalCV(sender.split('.')[0], sender.split('.')[1] )))}`
    ];
    const data = {
      contractAddress: getConfig().poxContractId.split('.')[0],
      contractName: getConfig().poxContractId.split('.')[1],
      functionName: 'get-partial-stacked-by-cycle',
      functionArgs,
    }
    const result = await callContractReadOnly(data);
    return (result.value) ? Number(result.value) : 0;
  } catch (e) {
    return { stacked: 0 }
  }
}

