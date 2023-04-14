import { fetchAddressTransactions } from './bitcoin/mempool_api.js';
import { findPeginRequestsByFilter, saveNewPeginRequest } from './data/db_models.js';
import type { PeginRequestI } from '../types/pegin_request.js';
import { getConfig } from './config.js';

export async function savePaymentRequest(peginRequest:PeginRequestI) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  console.log('peginRequest: saved one: ', peginRequest);
  return result;
}

export async function findPeginRequests():Promise<Array<any>> {
  return findPeginRequestsByFilter(getConfig().network, {});
}

export async function findPeginRequestsByStxAddress(stxAddress:string):Promise<Array<any>> {
	const filter = { stxAddress: stxAddress };
  return findPeginRequestsByFilter(getConfig().network, filter);
}

export async function findAllInitialPeginRequests(net:string) {
	const filter = { status: 1 };
	const requests:Array<PeginRequestI> = await findPeginRequestsByFilter(net, filter);
  for (const peginRequest of requests) {
    const address = peginRequest.timeBasedPegin.address;
    try {
      const txs:Array<any> = await fetchAddressTransactions(address);
      for (const tx of txs) {
        for (const vout of tx.vout) {
          if (peginRequest.tries < 5 && vout.scriptpubkey === peginRequest.timeBasedPegin.script) {
            console.log('findAllInitialPeginRequests: tx: ', tx);
            peginRequest.btcTxid = tx.txid;
            peginRequest.vout = vout;
            peginRequest.status = 2;
            const result = await saveNewPeginRequest(peginRequest);
            console.log('findAllInitialPeginRequests: result: ', result);
            console.log('findAllInitialPeginRequests: txid: ', tx.txid);
            console.log('findAllInitialPeginRequests: vout: ', vout);
          } else {
            peginRequest.tries += 1;
            const result = await saveNewPeginRequest(peginRequest);
          }
        }   
      }
    } catch(err) {
      console.log('findAllInitialPeginRequests: processing: ' + address, err);
    }
  }
	return requests;
}

