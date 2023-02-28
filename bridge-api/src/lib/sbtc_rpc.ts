/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON, serializeCV } from "micro-stacks/clarity";
import { principalCV } from 'micro-stacks/clarity';
import { bytesToHex } from "micro-stacks/common";
import { sbtcContractId, stacksApi, network } from './config';
import { readTx } from './bitcoin/mempool_api';
import fetch from 'node-fetch';
import type { BalanceI, SbtcContractDataI } from '../controllers/StacksRPCController';

const noArgMethods = [
  'get-coordinator-data',
  'get-bitcoin-wallet-address',
  'get-num-keys',
  'get-num-parties',
  'get-threshold',
  'get-trading-halted',
  'get-token-uri',
  'get-total-supply',
  'get-decimals',
  'get-name',
]

export async function fetchNoArgsReadOnly():Promise<SbtcContractDataI> {
  const result = {} as SbtcContractDataI
  const contractId = sbtcContractId;
  const data = {
    contractAddress: contractId!.split('.')[0],
    contractName: contractId!.split('.')[1],
    functionName: '',
    functionArgs: [],
    network
  }
  for (let arg in noArgMethods) {
    let funcname = noArgMethods[arg]
    try {
      data.functionName = funcname;
      const response = await callContractReadOnly(data);
      resolveArg(result, response, funcname)
    } catch (err) {
      console.log('Error fetching data from sbtc contrcat: ' + funcname)
    }
  }
  return result;
}

function resolveArg(result:SbtcContractDataI, response:any, arg:string) {
  let current = response
  if (response.value && response.value.value) {
    current = response.value.value
  }
  let property = '';
  switch (arg) {
    case 'get-coordinator-data':
      result.coordinator = current.value;
      break;
    case 'get-bitcoin-wallet-address':
      result.bitcoinWalletAddress = current.value;
      break;
    case 'get-num-keys':
      result.numKeys = current.value;
      break;
    case 'get-num-parties':
      result.numKeys = current.value;
      break;
    case 'get-threshold':
      result.threshold = Number(current.value);
      break;
    case 'get-trading-halted':
      result.tradingHalted = current.value;
      break;
    case 'get-token-uri':
      result.totalSupply = Number(current.value);
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


export async function fetchSbtcEvents() {
  try {
    const contractId = sbtcContractId;
    const url = stacksApi + '/extended/v1/contract/' + contractId + '/events';
    const response = await fetch(url);
    const result:any = await response.json();
    console.log('events: ', result)
    for (const event of result.results) {
      event.data = cvToJSON(deserializeCV(event.contract_log.value.hex));
    }
    const txs = [];
    for (let event of result.results) {
      event.txData = await readTx(event.data.value);
    }
  
    return { events: result.results };
  } catch (err) {
    return { events: [] };
  }
}

export async function fetchSbtcWalletAddress() {
  try {
    const contractId = sbtcContractId;
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
      functionName: 'get-bitcoin-wallet-address',
      functionArgs: [],
      network
    }
    const result = await callContractReadOnly(data);
    if (result.value && result.value.value) {
      return result.value.value
    }
    if (result.type.indexOf('some') > -1) return result.value
    if (network === 'testnet') {
      return 'tb1q....'; // alice
    }
  } catch (err) {
    return 'tb1qa....';
  }
}

export async function fetchUserSbtcBalance(stxAddress:string):Promise<BalanceI> {
  try {
    const contractId = sbtcContractId;
    //const functionArgs = [`0x${bytesToHex(serializeCV(uintCV(1)))}`, `0x${bytesToHex(serializeCV(standardPrincipalCV(address)))}`];
    const functionArgs = [`0x${bytesToHex(serializeCV(principalCV(stxAddress)))}`];
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
      functionName: 'get-balance',
      functionArgs,
      network
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

async function callContractReadOnly(data:any) {
  const url = stacksApi + '/v2/contracts/call-read/' + data.contractAddress + '/' + data.contractName + '/' + data.functionName
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
