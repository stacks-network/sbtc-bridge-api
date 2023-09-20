import { fetchAddressTransactions, fetchUTXOs } from './mempool_api.js';
import { updatePeginRequest, findPeginRequestsByFilter, saveNewPeginRequest } from '../data/db_models.js';
import type { BridgeTransactionType, CommitmentScriptDataType } from 'sbtc-bridge-lib'
import * as btc from '@scure/btc-signer';
import { buildDepositPayload, getPegWalletAddressFromPublicKey } from 'sbtc-bridge-lib' 
import { getConfig } from '../config.js';
import { hex } from '@scure/base';

export async function savePeginCommit(peginRequest:BridgeTransactionType) {
  if (!peginRequest.status || peginRequest.status < 1) peginRequest.status = 1;
  if (!peginRequest.updated) peginRequest.updated = new Date().getTime();
  const result = await saveNewPeginRequest(peginRequest);
  //console.log('peginRequest: saved one: ', result);
  return result;
}

export async function findPeginRequests():Promise<Array<any>> {
  return findPeginRequestsByFilter({});
}

async function matchCommitmentIn(txs:Array<any>, peginRequest:BridgeTransactionType):Promise<number> {
  let matchCount = 0;
  for (const tx of txs) {
    //console.log('scanPeginCommitTransactions: tx: ', tx);
    for (const vout of tx.vout) {
      const senderAddress = tx.vin[0]?.prevout?.scriptpubkey_address || undefined;
      //console.log('matchCommitmentIn: matching: ' + peginRequest.uiPayload.amountSats + ' to ' + vout.value)
      if (peginRequest.commitTxScript?.address === vout.scriptpubkey_address) {
        const up = {
          tries:  (peginRequest.tries) ? peginRequest.tries + 1 : 1,
          btcTxid: tx.txid,
          senderAddress,
          status: 2,
          vout: vout
        }
        await updatePeginRequest(peginRequest, up);
        matchCount++;
    } else {
        await updatePeginRequest(peginRequest, { tries:  ((peginRequest.tries || 1) + 1) });
      }
    }
  }
  return matchCount;
}

async function matchOpReturns(txs:Array<any>, peginRequest:BridgeTransactionType):Promise<number> {
  let matchCount = 0;
  for (const tx of txs) {
    //console.log('scanPeginCommitTransactions: tx: ', tx);
    for (const vout of tx.vout) {
      if (vout.scriptpubkey_address === getPegWalletAddressFromPublicKey(getConfig().network, peginRequest.uiPayload.sbtcWalletPublicKey)) {
        if (vout.value === peginRequest.uiPayload.amountSats) {
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
async function matchRevealOrReclaimIn(txs:Array<any>, peginRequest:BridgeTransactionType):Promise<number> {
  let matchedTx;
  for (const tx of txs) {
    if (tx.txid !== peginRequest.btcTxid) { // filter out the commitment tx
      matchedTx = await inspecTx(tx, peginRequest)
    }
  }
  return matchedTx;
}

async function inspecTx(tx:any, peginRequest:BridgeTransactionType) {
  let matchedTx = 0;
  //console.log('scanPeginCommitTransactions: tx: ', tx);
  for (const vout of tx.vout) {
    //console.log('matchRevealOrReclaimIn: matching: ' + peginRequest.uiPayload.amountSats + ' to ' + vout.value)
    if (peginRequest.uiPayload.bitcoinAddress === vout.scriptpubkey_address) {
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
    } else if (getPegWalletAddressFromPublicKey(getConfig().network, peginRequest.uiPayload.sbtcWalletPublicKey) === vout.scriptpubkey_address) {
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
        const txs:Array<any> = await fetchAddressTransactions(getPegWalletAddressFromPublicKey(getConfig().network, peginRequest.uiPayload.sbtcWalletPublicKey));
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

export async function scanCommitments(btcAddress:string, stxAddress:string, sbtcWalletAddress:string, revealFee:number, commitment:CommitmentScriptDataType) {
  console.log('scanCommitments: Scanning commits: ')
  let txs:Array<any> = await fetchAddressTransactions(btcAddress);
  if (!txs || txs.length === 0) return
  console.log('fixCommitments: ' + txs.length + ' from ' + btcAddress);
  let matchCount = 0;
  console.log('fixCommitments: txs.length: ' + txs.length);
  const foundTx = [];
  do {
    for (const tx of txs) {
      if (tx.vout && tx.vout[0]) {
        if (tx.vout[0].scriptpubkey_type === 'op_return') {
          console.log('scanCommitments: return: tx: ' + tx.txid + ' is ' + tx.vout[0].scriptpubkey_type + ' value = ' + tx.vout[1].value + ' sats');
        } else {
          if (tx.vout[0].scriptpubkey_type === 'v1_p2tr') {
            if (isUnspent(tx.vout[0].scriptpubkey_address, tx.txid)) {
              const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
              const data = buildDepositPayload(net, revealFee, stxAddress, true, undefined);
              const peginRequest:BridgeTransactionType = {
                btcTxid: tx.txid,
                network: 'testnet',
                created: new Date().getTime(),
                updated: new Date().getTime(),
                uiPayload: {
                  amountSats: tx.vout[0].value,
                  principal: hex.encode(data),
                  bitcoinAddress: btcAddress,
                  reclaimPublicKey: '',
                  paymentPublicKey: '',
                  sbtcWalletPublicKey: sbtcWalletAddress,
                },
            
                commitTxScript: commitment,
                originator: stxAddress,
                status: 2,
                mode: 'op_drop',
                requestType: 'deposit',
                vout: tx.vout[0]
              }
              const pegins = await findPeginRequestsByFilter({ status:2, fromBtcAddress: btcAddress, amount: tx.vout[0].value, originator: stxAddress, mode: 'op_drop', })
              console.log('pegin  pegins.length: ' + pegins.length);
              if (!pegins || pegins.length === 0) {
                try {
                  if (peginRequest.commitTxScript.address !== peginRequest.vout.scriptpubkey_address) {
                    throw new Error('Commitment data does not match the payment - probably an old version of the wire format... skipping entry.')
                  }
                  // avoid overwriting the data for now..
                  //const saveP = await saveNewPeginRequest(peginRequest);
                  foundTx.push(peginRequest);
                } catch(err) {
                  console.log(err.message)
                }
              }
              console.log('scanCommitments: drop: tx: ' + tx.txid + ' is ' + tx.vout[0].scriptpubkey_type + ' value = ' + tx.vout[0].value + ' sats' + ' scriptpubkey_address = ' + tx.vout[0].scriptpubkey_address + ' commit address: ' + peginRequest.commitTxScript.address);
            }
          }
        }
      }
      matchCount++;
    }
    try {
      txs = await fetchAddressTransactions(btcAddress, getLastSeenTxId(txs));
    } catch(err) {
      txs = undefined;
    }
  } while (txs && txs.length === 50);

  return foundTx;
}

function getLastSeenTxId (txs:Array<any>):string {
  const lastTx = txs[txs.length - 1]
  return lastTx.txid;
}

async function isUnspent (address:string, txid:string):Promise<boolean> {
  const utxos = await fetchUTXOs(address)
  if (!utxos || utxos.length === 0) return false
  return utxos.find((o) => o.txid === txid);
}