import { fetchAddressTransactions } from './mempool_api.js';
import { findPeginRequestsByFilter, saveNewPeginRequest } from '../data/db_models.js';
import type { PeginRequestI } from '../../types/pegin_request.js';
import { getConfig } from '../config.js';
import { bitcoinToSats} from '../utils.js';

export async function savePaymentRequest(peginRequest:PeginRequestI) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  console.log('peginRequest: saved one: ', result);
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
        console.log('findAllInitialPeginRequests: tx: ', tx);
        for (const vout of tx.vout) {
          if (peginRequest.tries < 15) {
            if (peginRequest.mode.indexOf('op_drop') > -1 && vout.scriptpubkey === peginRequest.timeBasedPegin?.script) {
              peginRequest.btcTxid = tx.txid;
              peginRequest.amount = bitcoinToSats(tx.vout[1].value);
              peginRequest.vout = vout;
              peginRequest.status = 2;
              const result = await saveNewPeginRequest(peginRequest);
              console.log('findAllInitialPeginRequests: result: ', result);
              console.log('findAllInitialPeginRequests: txid: ', tx.txid);
              console.log('findAllInitialPeginRequests: vout: ', vout);
            } else if (peginRequest.mode.indexOf('op_return') > -1) {
              console.log('chainamt: ' + bitcoinToSats(tx.vout[1].value));
              console.log('peginamt: ' + peginRequest.amount);
              if (bitcoinToSats(tx.vout[1].value) === peginRequest.amount) {
                peginRequest.btcTxid = tx.txid;
                peginRequest.vout = vout;
                peginRequest.status = 2;
              }
            }
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

