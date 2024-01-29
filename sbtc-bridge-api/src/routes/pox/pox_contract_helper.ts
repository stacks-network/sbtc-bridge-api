import { getConfig } from "../../lib/config.js";
import { hex } from '@scure/base';
import { contractPrincipalCV, serializeCV, principalCV, uintCV, tupleCV, bufferCV } from '@stacks/transactions';
import { callContractReadOnly } from "../stacks/stacks_helper.js";
import { getDaoConfig } from "../../lib/config_dao.js";
import * as btc from '@scure/btc-signer';
import { getHasbytesFromAddress } from "../dao/pox_helper.js";

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

export async function getPoxStacksAddressInfo(address:string, cycle:number):Promise<any> {
  return {
    stackerInfo: await getStackerInfo(address),
    checkDelegation: await getCheckDelegation(address),
    delegationInfo: await getDelegationInfo(address),
    poxRejection: (cycle > 0) ? await getPoxRejection(address, cycle) : undefined,
  };
}

export async function getPoxCycleInfo(cycle:number):Promise<any> {
  return {
    rewardSetSize: (cycle > 0) ? await getRewardSetSize(cycle) : undefined,
    numRewardSetPoxAddresses: await getNumRewardSetPoxAddresses(cycle),
    getNumbEntriesRewardCyclePoxList: await getNumbEntriesRewardCyclePoxList(cycle),
    getTotalPoxRejection: await getTotalPoxRejection(cycle),
    getTotalUstxStacked: await getTotalUstxStacked(cycle)
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


async function getStackerInfo(address:string):Promise<any> {
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
    return result;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
}

async function getCheckDelegation(address:string):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-check-delegation',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return result;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
}

export async function getTotalUstxStacked(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-total-ustx-stacked',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return result;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
}

export async function getRewardSetPoxAddress(cycle:number, index:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`, `0x${hex.encode(serializeCV(uintCV(index)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'get-reward-set-pox-address',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return result
}

export async function getNumbEntriesRewardCyclePoxList(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'get-num-reward-set-pox-addresses',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return result
}

async function getTotalPoxRejection(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
    const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'get-total-pox-rejection',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return result
}




async function getDelegationInfo(address:string):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-delegation-info',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return result;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
}

async function getPoxRejection(address:string, cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(address)))}`,`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-pox-rejection',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return result;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
}

async function getRewardSetSize(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().poxContractId.split('.')[0],
    contractName: getConfig().poxContractId.split('.')[1],
    functionName: 'get-reward-set-size',
    functionArgs,
  }
  let funding:string;
  try {
    const result = await callContractReadOnly(data);
    return result.value;
  } catch (e) { funding = '0' }
  return { stacked: 0 }
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
  const poxAddress = getHasbytesFromAddress(address)
  console.debug('getPartialStackedByCycle 1: ' + address)
  console.debug('getPartialStackedByCycle: ' + poxAddress)
  try {
    const functionArgs = [
      `0x${hex.encode(serializeCV(tupleCV({version: bufferCV(poxAddress.version), hashbytes: bufferCV(poxAddress.hashBytes)})))}`,
      `0x${hex.encode(serializeCV(uintCV(cycle)))}`,
      `0x${hex.encode(serializeCV(principalCV(sender)))}`,
    ];
    const data = {
      contractAddress: getConfig().poxContractId.split('.')[0],
      contractName: getConfig().poxContractId.split('.')[1],
      functionName: 'get-partial-stacked-by-cycle',
      functionArgs,
    }
    const result = await callContractReadOnly(data);
    return result.value;
  } catch (e) {  
    return { stacked: 0 }
  }
}

