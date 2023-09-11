/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON } from "micro-stacks/clarity";
import { getConfig } from '../../../lib/config.js';
import { fetchPegTxData } from './BitcoinRpc.js';
import fetch from 'node-fetch';
import { findAlphaEventsByFilter, countAlphaEvents, saveNewAlphaEvent } from '../../../lib/database/db_models.js';
import util from 'util'
import type { SbtcAlphaEvent, PayloadType } from 'sbtc-bridge-lib';

const limit = 10;

export async function indexAlphaEvent(txid:string) {
  try {
    const url = getConfig().stacksApi + '/extended/v1/tx/events?tx_id=' + txid;
    const response = await fetch(url);
    const result:any = await response.json();
    //console.log(' indexAlphaEvent: ', util.inspect(result, false, null, true /* enable colors */));
    return await indexEvents(result.events.filter((o:any) => o.event_type === 'smart_contract_log'));
  } catch (err) {
    console.log('err indexAlphaEvent: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

export async function saveAllAlphaEvents() {
  try {
    console.log('saveAllAlphaEvents: events/alpha/read-all')
    let offset = (await countEvents()).count;
    let events:Array<any>;
    do {
      events = await saveAlphaEvents(offset);
      console.log('saveAllAlphaEvents: ', events)
      offset += limit;
    } while (events.length === limit);
  } catch (err) {
    console.log('err saveAllAlphaEvents: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

export async function countEvents() {
  const result = { count: await countAlphaEvents() };
  return result;
}

export async function saveAlphaEvents(offset:number):Promise<Array<any>> {
  try {
    const contractId = getConfig().sbtcContractId;
    const url = getConfig().stacksApi + '/extended/v1/contract/' + contractId + '/events?limit=' + limit + '&offset=' + offset;
    const response = await fetch(url);
    const result:any = await response.json();
    console.log('Sbtc Alpha Events: : offset=' + offset + ' limit=' + limit + ' results=' + result.results.length);
    return await indexEvents(result.results);
  } catch (err) {
    console.log('err - saveAlphaEvents2: ', util.inspect(err, false, null, true /* enable colors */));
    return [];
  }
}

async function indexEvents(sbtcEvents:Array<any>) {
  for (const event of sbtcEvents) {
    try {
      const edata = cvToJSON(deserializeCV(event.contract_log.value.hex));
      const payloadData:PayloadType = await fetchPegTxData(edata.value, true);
      console.log('indexEvents: ', util.inspect(payloadData, false, null, true /* enable colors */));

      let newEvent:SbtcAlphaEvent = {
        contractId: event.contract_log.contract_id,
        eventIndex: event.event_index,
        txid: event.tx_id, 
        bitcoinTxid: edata.value,
        payloadData,
      };

      const result = await saveNewAlphaEvent(newEvent);
      console.log('saveAlphaEvents: saved one: ' + result, newEvent.payloadData);
      
    } catch (err:any) {
      //console.log('indexEvents: Error: ' + err.message); //util.inspect(err, false, null, true /* enable colors */));
    }
  }
  return sbtcEvents;
}

export async function findAlphaEvents(offset:number):Promise<any> {
  return findAlphaEventsByFilter({});
}