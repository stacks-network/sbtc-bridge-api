import { deserializeCV, cvToJSON, serializeCV, uintCV, noneCV, someCV } from "micro-stacks/clarity";
import { principalCV } from 'micro-stacks/clarity';
import { bytesToHex } from "micro-stacks/common";
import { getConfig } from '../../../lib/config.js';
import { fetchAddress } from './MempoolApi.js';
import fetch from 'node-fetch';
import { type SbtcMiniWalletI, type SbtcMiniContractDataI, type AddressObject, type AddressMempoolObject, sbtcMiniContracts } from 'sbtc-bridge-lib';
import * as btc from '@scure/btc-signer';

export let statelessMiniData;
const nullWallet = { cycle: 1, version: undefined, hashbytes: undefined, address: undefined, pubkey: undefined }

const noArgMethods = [
  { contract: sbtcMiniContracts.token, method: 'get-total-supply' },
  { contract: sbtcMiniContracts.token, method: 'get-token-uri' },
  { contract: sbtcMiniContracts.token, method: 'get-decimals' },
  { contract: sbtcMiniContracts.token, method: 'get-symbol' },
  { contract: sbtcMiniContracts.token, method: 'get-name' },
  { contract: sbtcMiniContracts.pool, method: 'get-current-window' },
  { contract: sbtcMiniContracts.pool, method: 'get-current-cycle-pool' },
]

export async function readMiniSbtcData():Promise<SbtcMiniContractDataI> {
  const result = {} as SbtcMiniContractDataI
  const contractAddress = getConfig().sbtcMiniDeployer;
  const data = {
    contractAddress,
    contractName: '',
    functionName: '',
    functionArgs: [],
    network: getConfig().network
  }
  for (let arg of noArgMethods) {
    let funcname = arg.method
    let  response;
    try {
      data.contractName = arg.contract
      data.functionName = funcname;
      response = await callContractReadOnly(data);
      resolveArg(result, response, funcname)
    } catch (err) {
      console.log('Error fetching sbtc mini data from sbtc contrcat: ' + funcname + ' : ', response)
    }
  }
  return result;
}

function resolveArg(result:SbtcMiniContractDataI, response:any, arg:string) {
  let current = response
  if (response.value && response.value.value) {
    current = response.value.value
  }
  switch (arg) {
    case 'get-current-window':
      result.currentWindow = current.value;
      break;
    case 'get-current-cycle-pool':
      result.currentCyclePool = current.value;
      break;
    case 'get-token-uri':
      result.tokenUri = current.value;
      break;
    case 'get-total-supply':
      result.totalSupply = Number(current);
      break;
    case 'get-symbol':
      result.symbol = current
    case 'get-decimals':
      result.decimals = Number(current);
      break;
    case 'get-name':
      result.name = current;
      break;
    default:
      break;
  }
}  

export async function fetchDataVar(contractAddress:string, contractName:string, dataVarName:string) {
  try {
    const url = getConfig().stacksApi + '/v2/data_var/' + contractAddress + '/' + contractName + '/' + dataVarName;
    const response = await fetch(url);
    const result:any = await response.json();
    return result;
  } catch(err:any) {
    console.log('fetchDataVar: ' + err.message);
  }
}

export async function fetchSbtcMiniWalletAddress(cycleId:number|undefined):Promise<SbtcMiniWalletI> {
  try {
    const contractAddress = getConfig().sbtcMiniDeployer;
    const arg = uintCV(cycleId || 1)
    const data = {
      contractAddress,
      contractName: sbtcMiniContracts.registry,
      functionName: 'get-cycle-sbtc-wallet',
      functionArgs: [`0x${bytesToHex( serializeCV(arg) )}`],
      network: getConfig().network
    }
    const result = await callContractReadOnly(data);
    console.log('fetchSbtcMiniWalletAddress: ', result)
    if (result && result.hasOwnProperty('type') && result.type === '(optional none)') {
      return nullWallet
    }
    return { cycle: cycleId, version: result.value.value.version, hashbytes: result.value.value.hashbytes, address: undefined, pubkey: undefined }
  } catch (err) {
    return nullWallet
  }
}

export async function fetchUserSbtcBalance(stxAddress:string):Promise<{ balance: number }> {
  try {
    const contractAddress = getConfig().sbtcMiniDeployer;
    const functionArgs = [`0x${bytesToHex(serializeCV(principalCV(stxAddress)))}`];
    const data = {
      contractAddress,
      contractName: sbtcMiniContracts.token,
      functionName: 'get-balance',
      functionArgs,
      network: getConfig().network
    }
    const result = await callContractReadOnly(data);
    if (result.value && result.value.value) {
      return { balance: Number(result.value.value) };
    }
    return { balance: 0 };
  } catch (err) {
    return { balance: 0 };
  }
}

export async function isProtocolCaller(stxAddress:string):Promise<boolean> {
  try {
    const contractAddress = getConfig().sbtcMiniDeployer;
    const functionArgs = [`0x${bytesToHex(serializeCV(principalCV(stxAddress)))}`];
    const data = {
      contractAddress,
      contractName: sbtcMiniContracts.controller,
      functionName: 'is-protocol-caller',
      functionArgs,
      network: getConfig().network
    }
    const result = await callContractReadOnly(data);
    if (result && result.hasOwnProperty('success') && !result.success) {
      return false;
    }
    if (result.value && result.value.value) {
      return result.value.value;
    }
    return result.value;
  } catch (err) {
    return false;
  }
}

export async function fetchUserBalances(stxAddress:string, cardinal:string, ordinal:string):Promise<AddressObject> {
  const userBalances:AddressObject = {} as AddressObject;
  userBalances.stxAddress = stxAddress;
  userBalances.cardinal = cardinal;
  userBalances.ordinal = ordinal;
  try {
    const url = getConfig().stacksApi + '/extended/v1/address/' + userBalances.stxAddress + '/balances';
    const response = await fetch(url);
    const result:any = await response.json();
    userBalances.stacksTokenInfo = result;
  } catch(err) {
    console.log('fetchUserBalances: stacksTokenInfo: ', err)
  }
  try {
    const sBtcBalance = await fetchUserSbtcBalance(userBalances.stxAddress);
    userBalances.sBTCBalance = sBtcBalance.balance
  } catch(err) {
    console.log('fetchUserBalances: sBtcBalance: ', err)
  }
  try {
    const address:AddressMempoolObject = await fetchAddress(userBalances.cardinal);
    userBalances.cardinalInfo = address
  } catch(err) {
    console.log('fetchUserBalances: cardinalInfo: ', err)
  }
  try {
    const address:AddressMempoolObject = await fetchAddress(userBalances.ordinal);
    userBalances.ordinalInfo = address
  } catch(err) {
    console.log('fetchUserBalances: ordinalInfo: ', err)
  }
  return userBalances;
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
  } catch (err) {
    console.log('callContractReadOnly: Error: ', err);
  }
  console.log('callContractReadOnly: ', url);
  console.log('callContractReadOnly: ', val)
  const result = cvToJSON(deserializeCV(val.result));
  return result;
}
