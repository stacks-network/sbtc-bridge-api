/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { deserializeCV, cvToJSON } from "micro-stacks/clarity";
import { getConfig } from '../../lib/config.js';
import { readPayloadData } from '../../lib/bitcoin/rpc_transaction.js';
import fetch from 'node-fetch';
import { findContractEventsByFilter, countContractEvents, saveNewContractEvent } from '../../lib/data/db_models.js';
import util from 'util'
import { getAddressFromOutScript, type PayloadType } from 'sbtc-bridge-lib';
import { SbtcClarityEvent } from "sbtc-bridge-lib/dist/types/sbtc_types.js";
import { fetchAddressTransactions, fetchTransaction } from "../../lib/bitcoin/api_mempool.js";
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';

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
    return new Array<SbtcClarityEvent>;
  }
}

export async function saveAllSbtcEvents() {
  try {
    let offset = await countContractEvents();
    console.log('saveAllSbtcEvents offset: ' + offset);
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
    console.log('Sbtc Events: : url=' + url);
    console.log('Sbtc Events: : results=' + (result.results) ? result.results.length : 0);
    return await indexEvents(result.results);
  } catch (err:any) {
    console.log('err - saveSbtcEvents2: ' + err);
    return [];
  }
}

async function indexEvents(sbtcEvents:Array<any>) {
  for (const event of sbtcEvents) {
    try {
      //console.log('event ', event);
      const edata:any = cvToJSON(deserializeCV(event.contract_log.value.hex));
      const eventType = edata.value.notification.value;
      const eventTxId = edata.value.payload.value.split('x')[1];
      //console.log('edata ', edata);
      const payloadData:PayloadType = await readPayloadData(eventTxId);
      payloadData.eventType = eventType;
      //console.log('indexEvents ', util.inspect(payloadData, false, null, true /* enable colors */));
      
      let recipient;
      try {
        if (eventType === 'burn') {
          const txIn = await fetchTransaction(edata.value.payload.value.split('x')[1])
          const tx:btc.Transaction = btc.Transaction.fromRaw(hex.decode(txIn.hex), {allowUnknowInput:true, allowUnknowOutput: true, allowUnknownOutputs: true, allowUnknownInputs: true})
          recipient = getAddressFromOutScript(getConfig().network, tx.getOutput(1).script as Uint8Array)
        }
      } catch (err:any) {
        console.log('indexEvents: unable to get recipient from ', edata);
      }
      //const txs:Array<any> = await fetchAddressTransactions(recipient);
      //let fulfilTx:any;
      //for (let thisTx of txs) {
      //  if (thisTx.vout[0].value === payloadData.amountSats) {
      //    fulfilTx = thisTx
      //  }
      //}
      //console.log(fulfilTx)

      let newEvent = {
        contractId: event.contract_log.contract_id,
        eventIndex: event.event_index,
        txid: event.tx_id,
        bitcoinTxid: edata.value,
        recipient,
        payloadData,
      };
      const result = await saveNewContractEvent(newEvent);
      console.log('saveSbtcEvents: saved result: ', result);
      console.log('saveSbtcEvents: saved payloadData: ', newEvent.payloadData);
      
    } catch (err:any) {
      console.log('indexEvents: Error: ' + err.message); //util.inspect(err, false, null, true /* enable colors */));
    }
  }
  return sbtcEvents;
}

export async function findSbtcEvents(offset:number):Promise<any> {
  return findContractEventsByFilter({});
}
export async function findSbtcEventsByFilter(filter:any):Promise<any> {
  return findContractEventsByFilter(filter);
}