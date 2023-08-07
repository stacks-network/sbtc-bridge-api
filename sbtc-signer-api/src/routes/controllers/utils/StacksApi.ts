/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON, serializeCV } from "micro-stacks/clarity";
import { principalCV } from 'micro-stacks/clarity';
import { bytesToHex } from "micro-stacks/common";
import { getConfig } from '../../../lib/config.js';
import { fetchPegTxData } from './BitcoinRpc.js';
import { fetchAddress } from './MempoolApi.js';
import fetch from 'node-fetch';
import { findSbtcEventsByFilter, countSbtcEvents, saveNewSbtcEvent } from '../../../lib/database/db_models.js';
import util from 'util'
import type { payloadType, SbtcContractDataI, AddressObject, AddressMempoolObject } from 'sbtc-bridge-lib';
import * as btc from '@scure/btc-signer';

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
      console.log('Error fetching data from sbtc contrcat: ' + funcname + ' : ', response)
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

export async function indexSbtcEvent(txid:string) {
  try {
    const url = getConfig().stacksApi + '/extended/v1/tx/events?tx_id=' + txid;
    const response = await fetch(url);
    const result:any = await response.json();
    //console.log(' indexSbtcEvent: ', util.inspect(result, false, null, true /* enable colors */));
    return await indexEvents(result.events.filter((o:any) => o.event_type === 'smart_contract_log'));
  } catch (err) {
    console.log('err indexSbtcEvent: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

export async function saveAllSbtcEvents() {
  try {
    let offset = await countEvents();
    let events:Array<any>;
    do {
      events = await saveSbtcEvents(offset);
      offset += limit;
    } while (events.length === limit);
  } catch (err) {
    console.log('err saveAllSbtcEvents: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

export async function countEvents() {
  return await countSbtcEvents();
}

export async function saveSbtcEvents(offset:number):Promise<Array<any>> {
  try {
    const contractId = getConfig().sbtcContractId;
    const url = getConfig().stacksApi + '/extended/v1/contract/' + contractId + '/events?limit=' + limit + '&offset=' + offset;
    const response = await fetch(url);
    const result:any = await response.json();
    //console.log('Sbtc Events: : offset=' + offset + ' limit=' + limit + ' results=' + result.results.length);
    return await indexEvents(result.results);
  } catch (err) {
    console.log('err - saveSbtcEvents2: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

async function indexEvents(sbtcEvents:Array<any>) {
  for (const event of sbtcEvents) {
    try {
      const edata = cvToJSON(deserializeCV(event.contract_log.value.hex));
      const payloadData:payloadType = await fetchPegTxData(edata.value, true);
      console.log('indexEvents ', util.inspect(payloadData, false, null, true /* enable colors */));

      let newEvent = {
        contractId: event.contract_log.contract_id,
        eventIndex: event.event_index,
        txid: event.tx_id, 
        bitcoinTxid: edata.value,
        payloadData,
      };
      const result = await saveNewSbtcEvent(newEvent);
      console.log('saveSbtcEvents: saved one: ' + result, newEvent.payloadData);
      
    } catch (err:any) {
      console.log('indexEvents: Error: ' + err.message); //util.inspect(err, false, null, true /* enable colors */));
    }
  }
  return sbtcEvents;
}

export async function findSbtcEvents(offset:number):Promise<any> {
  return findSbtcEventsByFilter({});
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

export async function fetchSbtcWalletAddress() {
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
    console.log('callContractReadOnly4: ', err);
  }
  const result = cvToJSON(deserializeCV(val.result));
  return result;
}
