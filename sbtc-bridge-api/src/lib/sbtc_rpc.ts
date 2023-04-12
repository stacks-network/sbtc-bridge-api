/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON, serializeCV } from "micro-stacks/clarity";
import { principalCV } from 'micro-stacks/clarity';
import { bytesToHex } from "micro-stacks/common";
import { getConfig } from './config.js';
import { fetchPegTxData } from './bitcoin/rpc_transaction.js';
import fetch from 'node-fetch';
import type { BalanceI } from '../controllers/StacksRPCController.js';
import { findSbtcEventsByFilter, countSbtcEvents, saveNewSbtcEvent } from './data/db_models.js';
import util from 'util'
import type { SbtcContractDataI } from '../types/sbtc_contract_data.js';

const limit = 10;

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
    case 'get-bitcoin-wallet-address':
      result.sbtcWalletAddress = response.value.value;
      break;
    case 'get-num-keys':
      result.numKeys = current.value;
      break;
    case 'get-num-parties':
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
    const contractId = getConfig().sbtcContractId;
    const url = getConfig().stacksApi + '/extended/v1/tx/events?tx_id=' + txid;
    const response = await fetch(url);
    const result:any = await response.json();
    //console.log(' indexSbtcEvent: ', util.inspect(result, false, null, true /* enable colors */));
    return await indexEvents(result.events.filter((o:any) => o.event_type === 'smart_contract_log'));

    /**
    const events = result.events.filter((o:any) => o.event_type === 'smart_contract_log');
    const edata = cvToJSON(deserializeCV(events[0].contract_log.value.hex));
    const pegData = await fetchPegTxData(edata.value, true);
    console.log('Sbtc Events: : pegData=', pegData);
    */
  } catch (err) {
    console.log('err indexSbtcEvent: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

export async function saveAllSbtcEvents() {
  try {
    let offset = await countSbtcEvents();
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

export async function saveSbtcEvents(offset:number):Promise<Array<any>> {
  try {
    const sbtcEvents:Array<any> = []
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
      const pegData = await fetchPegTxData(edata.value, true);
      console.log('indexEvents ', util.inspect(pegData, false, null, true /* enable colors */));

      let newEvent = {
        contractId: event.contract_log.contract_id,
        eventIndex: event.event_index,
        txid: event.tx_id,
        bitcoinTxid: edata.value,
        pegData,
      };
      const result = await saveNewSbtcEvent(newEvent);
      console.log('saveSbtcEvents: saved one: ' + newEvent.pegData.pegType + ' : ' + newEvent.pegData.opType + ' : ' + newEvent.pegData.stxAddress);
      
    } catch (err:any) {
      console.log('indexEvents: Error: ' + err.message); //util.inspect(err, false, null, true /* enable colors */));
    }
  }
  return sbtcEvents;
}

export async function findSbtcEvents(offset:number):Promise<Array<any>> {
  return findSbtcEventsByFilter({});
}

export async function fetchSbtcWalletAddress() {
  try {
    const contractId = getConfig().sbtcContractId;
    const data = {
      contractAddress: contractId!.split('.')[0],
      contractName: contractId!.split('.')[1],
      functionName: 'get-bitcoin-wallet-address',
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

export async function fetchUserSbtcBalance(stxAddress:string):Promise<BalanceI> {
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

async function callContractReadOnly(data:any) {
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
