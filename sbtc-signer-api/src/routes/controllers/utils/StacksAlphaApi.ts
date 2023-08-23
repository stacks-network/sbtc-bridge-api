/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON, serializeCV } from "micro-stacks/clarity";
import { principalCV } from 'micro-stacks/clarity';
import { bytesToHex } from "micro-stacks/common";
import { getConfig } from '../../../lib/config.js';
import { fetchAddress } from './MempoolApi.js';
import fetch from 'node-fetch';
import type { SbtcContractDataI, AddressObject, AddressMempoolObject } from 'sbtc-bridge-lib';
import * as btc from '@scure/btc-signer';
import { callContractReadOnly } from './StacksMiniApi.js'

const limit = 10;

const noArgMethods = [
  'get-coordinator-data',
  'get-bitcoin-wallet-public-key',
  'get-num-keys',
  'get-num-signers',
  'get-threshold',
  'get-trading-halted',
  'get-token-uri',
  'get-total-supply',
  'get-decimals',
  'get-name',
]

export async function fetchNoArgsReadOnly():Promise<SbtcContractDataI> {
  const result = {} as SbtcContractDataI
  const contractId = getConfig().sbtcContractId;
  const data = {
    contractAddress: contractId!.split('.')[0],
    contractName: contractId!.split('.')[1],
    functionName: '',
    functionArgs: [],
    network: getConfig().network
  }
  for (let arg in noArgMethods) {
    let funcname = noArgMethods[arg]
    let  response;
    try {
      data.functionName = funcname;
      response = await callContractReadOnly(data);
      resolveArg(result, response, funcname)
    } catch (err) {
      console.log('Error fetching sbtc alpha data from sbtc contrcat: ' + funcname + ' : ', response)
    }
  }
  return result;
}

function resolveArg(result:SbtcContractDataI, response:any, arg:string) {
  let current = response
  if (response.value && response.value.value) {
    current = response.value.value
  }
  switch (arg) {
    case 'get-coordinator-data':
      result.coordinator = response.value.value;
      break;
    case 'get-bitcoin-wallet-public-key':
      //console.log('get-bitcoin-wallet-public-key: response: ', response)
      try {
        const fullPK = response.value.value.split('x')[1];
        // converting to x-only..
        result.sbtcWalletPublicKey = fullPK;
        const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
        const trObj = btc.p2tr(fullPK.substring(1), undefined, net);
        if (trObj.type === 'tr') result.sbtcWalletAddress = trObj.address;
      } catch(err) {
        console.log('get-bitcoin-wallet-public-key: current: ', current)
        console.log('get-bitcoin-wallet-public-key: err: ', err)
      }
      break;
    case 'get-num-keys':
      result.numKeys = current.value;
      break;
    case 'get-num-signers':
      result.numParties = current.value;
      break;
    case 'get-threshold':
      result.threshold = Number(current.value);
      break;
    case 'get-trading-halted':
      result.tradingHalted = current.value;
      break;
    case 'get-token-uri':
      result.tokenUri = current.value;
      break;
    case 'get-total-supply':
      result.totalSupply = Number(current);
      break;
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
    console.log('fetchUserBalances: stacksTokenInfo: ' + err.message);
  }
}

export async function fetchSbtcAlphaWalletAddress() {
  try {
    const contractId = getConfig().sbtcContractId;
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
      functionName: 'get-bitcoin-wallet-public-key',
      functionArgs: [],
      network: getConfig().network
    }
    const result = await callContractReadOnly(data);
    if (result.value && result.value.value) {
      return result.value.value
    }
    if (result.type.indexOf('some') > -1) return result.value
    if (getConfig().network === 'testnet') {
      return 'tb1q....'; // alice
    }
  } catch (err) {
    return 'tb1qa....';
  }
}

export async function fetchUserSbtcBalance(stxAddress:string):Promise<{ balance: number }> {
  try {
    const contractId = getConfig().sbtcContractId;
    //const functionArgs = [`0x${bytesToHex(serializeCV(uintCV(1)))}`, `0x${bytesToHex(serializeCV(standardPrincipalCV(address)))}`];
    const functionArgs = [`0x${bytesToHex(serializeCV(principalCV(stxAddress)))}`];
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
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