import { fetchAddressTransactions } from './mempool_api.js';
import { updatePeginRequest, findPeginRequestsByFilter, saveNewPeginRequest } from '../data/db_models.js';
import type { PeginRequestI } from 'sbtc-bridge-lib' 

export async function savePeginCommit(peginRequest:PeginRequestI) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  //console.log('peginRequest: saved one: ', result);
  return result;
}

export async function findPeginRequests():Promise<Array<any>> {
  return findPeginRequestsByFilter({});
}

async function matchCommitmentIn(txs:Array<any>, peginRequest:PeginRequestI):Promise<number> {
  let matchCount = 0;
  for (const tx of txs) {
    //console.log('scanPeginCommitTransactions: tx: ', tx);
    for (const vout of tx.vout) {
      const senderAddress = tx.vin[0]?.prevout?.scriptpubkey_address || undefined;
      //console.log('matchCommitmentIn: matching: ' + peginRequest.amount + ' to ' + vout.value)
      if (peginRequest.commitTxScript?.address === vout.scriptpubkey_address) {
        const up = {
          tries:  (peginRequest.tries) ? peginRequest.tries + 1 : 1,
          btcTxid: tx.txid,
          senderAddress,
          status: 2,
          vout: vout
        }
        await updatePeginRequest(peginRequest, up);
        //console.log('scanPeginCommitTransactions: changes: ', up);
        matchCount++;
    } else {
        await updatePeginRequest(peginRequest, { tries:  ((peginRequest.tries || 1) + 1) });
        //console.log('scanPeginCommitTransactions: saveNewPeginRequest: ', peginRequest);
      }
    }
  }
  return matchCount;
}

async function matchOpReturns(txs:Array<any>, peginRequest:PeginRequestI):Promise<number> {
  let matchCount = 0;
  for (const tx of txs) {
    //console.log('scanPeginCommitTransactions: tx: ', tx);
    for (const vout of tx.vout) {
      if (vout.scriptpubkey_address === peginRequest.sbtcWalletAddress) {
        if (vout.value === peginRequest.amount) {
          const up = {
            btcTxid: tx.txid,
            status: 5,
            vout0: tx.vout[0],
            vout: vout
          }
          await updatePeginRequest(peginRequest, up);
          //console.log('scanPeginCommitTransactions: changes: ', up);
          matchCount++;
        }
      }
    }
  }
  return matchCount;
}

/**
 * Match a tx from this address which spends the script path by checking for 
 * either the reveal pubkey or reclaim pubkey in the output script
 * @param txs 
 * @param peginRequest 
 * @returns 
 */
async function matchRevealOrReclaimIn(txs:Array<any>, peginRequest:PeginRequestI):Promise<number> {
  let matchedTx;
  for (const tx of txs) {
    if (tx.txid !== peginRequest.btcTxid) { // filter out the commitment tx
      matchedTx = await inspecTx(tx, peginRequest)
    }
  }
  return matchedTx;
}

async function inspecTx(tx:any, peginRequest:PeginRequestI) {
  let matchedTx = 0;
  //console.log('scanPeginCommitTransactions: tx: ', tx);
  for (const vout of tx.vout) {
    //console.log('matchRevealOrReclaimIn: matching: ' + peginRequest.amount + ' to ' + vout.value)
    if (peginRequest.fromBtcAddress === vout.scriptpubkey_address) {
      // reveal path spent
      const up = {
        tries:  (peginRequest.tries) ? peginRequest.tries + 1 : 1,
        status: 3,
        reclaim: {
          btcTxid: tx.txid,
          vout: vout
        }
      }
      await updatePeginRequest(peginRequest, up);
      //console.log('matchRevealOrReclaimIn: changes: ', up);
    } else if (peginRequest.sbtcWalletAddress === vout.scriptpubkey_address) {
      // reclaim path spent
      const up = {
        tries:  (peginRequest.tries) ? peginRequest.tries + 1 : 1,
        status: 4,
        reveal: {
          btcTxid: tx.txid,
          vout: vout
        }
      }
      await updatePeginRequest(peginRequest, up);
      //console.log('matchRevealOrReclaimIn: changes: ', up);
    } else {
      await updatePeginRequest(peginRequest, { tries:  ((peginRequest.tries || 1) + 1) });
      //console.log('matchRevealOrReclaimIn: saveNewPeginRequest: ', peginRequest);
    }
  }
  return matchedTx;
}
export async function scanPeginCommitTransactions() {
  let matchCount = 0;
	const filter = { status: 1 };
  try {
    const requests:any = await findPeginRequestsByFilter(filter);
    if (!requests || requests.length === 0) return;
    for (const peginRequest of requests) {
      if (peginRequest.mode === 'op_return') {
        const txs:Array<any> = await fetchAddressTransactions(peginRequest.sbtcWalletAddress);
        matchOpReturns(txs, peginRequest);
      } else {
        if (peginRequest.commitTxScript) {
          const address = peginRequest.commitTxScript.address;
          try {
            const txs:Array<any> = await fetchAddressTransactions(address);
            if (txs && txs.length > 0) {
              //console.log('scanPeginCommitTransactions: processing: ' + txs.length + ' from ' + address);
              matchCount += await matchCommitmentIn(txs, peginRequest);
            }
          } catch(err:any) {
            console.log('scanPeginCommitTransactions: processing: ' + err.message);
          }
        }
      }
    }
  } catch (err: any) {
    console.log('scanPeginCommitTransactions: requests: ', err)
  }
	return { matched: matchCount };
}
export async function scanPeginRRTransactions() {
  let matchCount = 0;
	const filter = { status: 2 };
  try {
    const requests:any = await findPeginRequestsByFilter(filter);
    //console.log('scanPeginRRTransactions: processing1: ' + requests);
    if (!requests || requests.length === 0) return;
    for (const peginRequest of requests) {
      //console.log('scanPeginRRTransactions: processing2: ', peginRequest);
      if (peginRequest.vout) {
        const address = peginRequest.vout.scriptpubkey_address;
        if (address !== peginRequest.commitTxScript.address) throw new Error('The vout address does not match the address the user spent the commit to?')
        try {
          const txs:Array<any> = await fetchAddressTransactions(address);
          if (txs && txs.length > 0) {
            //console.log('scanPeginRRTransactions: processing3: ' + txs.length + ' from ' + address);
            matchCount += await matchRevealOrReclaimIn(txs, peginRequest);
          }
        } catch(err:any) {
          //console.log('scanPeginRRTransactions: processing4: ' + err.message);
        }
      }
    }
  } catch (err: any) {
    console.log('scanPeginRRTransactions: requests: ', err)
  }
	return { matched: matchCount };
}
