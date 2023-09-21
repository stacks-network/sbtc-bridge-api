/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON } from "micro-stacks/clarity";
import { getConfig } from '../../lib/config.js';
import { readPayloadData } from '../../lib/bitcoin/rpc_transaction.js';
import fetch from 'node-fetch';
import { findContractEventsByFilter, countContractEvents, saveNewContractEvent } from '../../lib/data/db_models.js';
import util from 'util'
import type { PayloadType } from 'sbtc-bridge-lib';

const limit = 10;

export async function indexSbtcEvent(txid:string) {
  try {
    const url = getConfig().stacksApi + '/extended/v1/tx/events?tx_id=' + txid;
    const response = await fetch(url);
    const result:any = await response.json();
    //console.log(' indexSbtcEvent: ', util.inspect(result, false, null, true /* enable colors */));
    return await indexEvents(result.events.filter((o:any) => o.event_type === 'smart_contract_log'));
  } catch (err:any) {
    console.log('err indexSbtcEvent: ' + err);
    return [];
  }
}

export async function saveAllSbtcEvents() {
  try {
    let offset = await countContractEvents();
    let events:Array<any>;
    do {
      events = await saveSbtcEvents(offset);
      offset += limit;
    } while (events.length === limit);
  } catch (err:any) {
    console.log('err saveAllSbtcEvents: ' + err);
    return [];
  }
}

export async function saveSbtcEvents(offset:number):Promise<Array<any>> {
  try {
    const contractId = getConfig().sbtcContractId;
    const url = getConfig().stacksApi + '/extended/v1/contract/' + contractId + '/events?limit=' + limit + '&offset=' + offset;
    const response = await fetch(url);
    const result:any = await response.json();
    console.log('Sbtc Events: : offset=' + offset + ' limit=' + limit + ' results=' + result.results.length);
    return await indexEvents(result.results);
  } catch (err:any) {
    console.log('err - saveSbtcEvents2: ' + err);
    return [];
  }
}

async function indexEvents(sbtcEvents:Array<any>) {
  for (const event of sbtcEvents) {
    try {
      const edata:any = cvToJSON(deserializeCV(event.contract_log.value.hex));
      console.log('event ' + event.contract_log.value.repr);
      //console.log('edata.value.payload.value ', edata.value.payload.value);
      const payloadData:PayloadType = await readPayloadData(edata.value.payload.value, true);
      console.log('indexEvents ', util.inspect(payloadData, false, null, true /* enable colors */));

      let newEvent = {
        contractId: event.contract_log.contract_id,
        eventIndex: event.event_index,
        txid: event.tx_id,
        bitcoinTxid: edata.value,
        payloadData,
      };
      const result = await saveNewContractEvent(newEvent);
      console.log('saveSbtcEvents: saved one: ' + result, newEvent.payloadData);
      
    } catch (err:any) {
      console.log('indexEvents: Error: ', err); //util.inspect(err, false, null, true /* enable colors */));
    }
  }
  return sbtcEvents;
}

export async function findSbtcEvents(offset:number):Promise<any> {
  return findContractEventsByFilter({});
}