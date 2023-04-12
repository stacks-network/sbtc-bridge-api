import { fetchAddressTransactions } from './bitcoin/mempool_api.js';
import { findPeginRequestsByFilter, saveNewPeginRequest } from './data/db_models.js';
import type { PeginRequestI } from '../types/pegin_request.js';

export async function savePaymentRequest(peginRequest:PeginRequestI) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  console.log('peginRequest: saved one: ', peginRequest);
  return result;
}

export async function findPeginRequests():Promise<Array<any>> {
  return findPeginRequestsByFilter({});
}

export async function findPeginRequestsByStxAddress(stxAddress:string):Promise<Array<any>> {
	const filter = { stxAddress: stxAddress };
  return findPeginRequestsByFilter(filter);
}

export async function findAllInitialPeginRequests() {
	const filter = { status: 1 };
	const requests:Array<PeginRequestI> = await findPeginRequestsByFilter(filter);
  for (const peginRequest of requests) {
    const address = peginRequest.timeBasedPegin.address;
    const txs:Array<any> = await fetchAddressTransactions(address);
    for (const tx of txs) {
      for (const vout of tx.vout) {
        if (vout.scriptpubkey === peginRequest.timeBasedPegin.script) {
          console.log('findAllInitialPeginRequests: tx: ', tx);
          peginRequest.btcTxid = tx.txid;
          peginRequest.vout = vout;
          peginRequest.status = 2;
          const result = await saveNewPeginRequest(peginRequest);
          console.log('findAllInitialPeginRequests: result: ', result);
          console.log('findAllInitialPeginRequests: txid: ', tx.txid);
          console.log('findAllInitialPeginRequests: vout: ', vout);
        }
      }      
    }
  }
	return requests;
}

