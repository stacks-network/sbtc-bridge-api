import { fetchAddressTransactions } from './mempool_api.js';
import { updatePeginRequest, findPeginRequestsByFilter, saveNewPeginRequest } from '../data/db_models.js';
import type { PeginRequestI } from '../../types/pegin_request.js';
import { bitcoinToSats} from '../utils.js';

export async function savePeginCommit(peginRequest:PeginRequestI) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  console.log('peginRequest: saved one: ', result);
  return result;
}

export async function findPeginRequests():Promise<Array<any>> {
  return findPeginRequestsByFilter({});
}


async function matchTransactionToPegin(txs:Array<any>, peginRequest:PeginRequestI):Promise<number> {
  let matchCount = 0;
  for (const tx of txs) {
    //console.log('scanPeginCommitTransactions: tx: ', tx);
    for (const vout of tx.vout) {
      console.log('matchTransactionToPegin: matching: ' + peginRequest.amount + ' to ' + vout.value)
      if (peginRequest.amount === vout.value && peginRequest.tries < 15) {
        if (peginRequest.mode.indexOf('op_drop') > -1 && vout.scriptpubkey === peginRequest.commitTxScript?.script) {
          const up = {
            tries:  peginRequest.tries++,
            btcTxid: tx.txid,
            status: 2,
            vout: vout
          }
          await updatePeginRequest(peginRequest, up);
          console.log('scanPeginCommitTransactions: changes: ', up);
          matchCount++;
        } else if (peginRequest.mode.indexOf('op_return') > -1) {
          console.log('chainamt: ' + bitcoinToSats(tx.vout[1].value));
          console.log('peginamt: ' + peginRequest.amount);
          if (bitcoinToSats(tx.vout[1].value) === peginRequest.amount) {
            const up = {
              tries:  peginRequest.tries++,
              btcTxid: tx.txid,
              status: 2,
              vout: vout
            }
            await updatePeginRequest(peginRequest, up);
            console.log('scanPeginCommitTransactions: updatePeginRequest: changes: ', up);
              matchCount++;
          }
        }
      } else {
        await updatePeginRequest(peginRequest, { tries:  peginRequest.tries++ });
        console.log('scanPeginCommitTransactions: saveNewPeginRequest: ', peginRequest);
      }
    }   
  }
  return matchCount;
}

export async function scanPeginCommitTransactions() {
  let matchCount = 0;
	const filter = { status: 1 };
  try {
    const requests:any = await findPeginRequestsByFilter(filter);
    if (!requests || requests.length === 0) return;
    for (const peginRequest of requests) {
      if (peginRequest.commitTxScript) {
        const address = peginRequest.commitTxScript.address;
        try {
          const txs:Array<any> = await fetchAddressTransactions(address);
          if (txs && txs.length > 0) {
            console.log('scanPeginCommitTransactions: processing: ' + txs.length + ' from ' + address);
            matchCount += await matchTransactionToPegin(txs, peginRequest);
          }
        } catch(err:any) {
          console.log('scanPeginCommitTransactions: processing: ' + err.message);
        }
      }
    }
  } catch (err: any) {
    console.log('scanPeginCommitTransactions: requests: ', err)
  }
	return { matched: matchCount };
}
