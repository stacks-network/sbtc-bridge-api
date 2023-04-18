import { fetchAddressTransactions } from './mempool_api.js';
import { findPeginRequestsByFilter, saveNewPeginRequest } from '../data/db_models.js';
import type { PeginRequestI } from '../../types/pegin_request.js';
import { bitcoinToSats} from '../utils.js';

export async function savePaymentRequest(peginRequest:PeginRequestI) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  console.log('peginRequest: saved one: ', result);
  return result;
}

export async function findPeginRequests():Promise<Array<any>> {
  return findPeginRequestsByFilter({});
}

export async function findPeginRequestsByStxAddress(stxAddress:string):Promise<Array<any>> {
	const filter = { stxAddress: stxAddress };
  return findPeginRequestsByFilter(filter);
}

async function matchTransactionToPegin(txs:Array<any>, peginRequest:PeginRequestI):Promise<number> {
  let matchCount = 0;
  for (const tx of txs) {
    //console.log('findAllInitialPeginRequests: tx: ', tx);
    for (const vout of tx.vout) {
      if (peginRequest.tries < 15) {
        if (peginRequest.mode.indexOf('op_drop') > -1 && vout.scriptpubkey === peginRequest.timeBasedPegin?.script) {
          peginRequest.btcTxid = tx.txid;
          peginRequest.amount = bitcoinToSats(tx.vout[1].value);
          peginRequest.vout = vout;
          peginRequest.status = 2;
          await saveNewPeginRequest(peginRequest);
          console.log('findAllInitialPeginRequests: saveNewPeginRequest: ', peginRequest);
          matchCount++;
        } else if (peginRequest.mode.indexOf('op_return') > -1) {
          console.log('chainamt: ' + bitcoinToSats(tx.vout[1].value));
          console.log('peginamt: ' + peginRequest.amount);
          if (bitcoinToSats(tx.vout[1].value) === peginRequest.amount) {
            peginRequest.btcTxid = tx.txid;
            peginRequest.vout = vout;
            peginRequest.status = 2;
            matchCount++;
          }
        }
      } else {
        peginRequest.tries += 1;
        await saveNewPeginRequest(peginRequest);
        console.log('findAllInitialPeginRequests: saveNewPeginRequest: ', peginRequest);
      }
    }   
  }
  return matchCount;
}

export async function findAllInitialPeginRequests() {
  let matchCount = 0;
	const filter = { status: 1 };
  try {
    const requests:any = await findPeginRequestsByFilter(filter);
    if (!requests || requests.length === 0) return;
      for (const peginRequest of requests) {
      const address = peginRequest.timeBasedPegin.address;
      try {
        const txs:Array<any> = await fetchAddressTransactions(address);
        if (txs && txs.length > 0) {
          matchCount += await matchTransactionToPegin(txs, peginRequest);
        }
      } catch(err:any) {
        console.log('findAllInitialPeginRequests: processing: ' + err.message);
      }
    }
  } catch (err: any) {
    console.log('findAllInitialPeginRequests: requests: ', err)
  } 
	return { matched: matchCount };
}

