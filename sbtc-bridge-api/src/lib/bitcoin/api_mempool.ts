import { getConfig } from '../config.js';
import fetch from 'node-fetch';
import type { AddressMempoolObject } from 'sbtc-bridge-lib';
import { checkAddressForNetwork  } from 'sbtc-bridge-lib' 

export async function fetchBitcoinTipHeight() {
  try {
    const url = getConfig().mempoolUrl + '/blocks/tip/height';
    const response = await fetch(url);
    const hex = await response.text();
    return hex;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function fetchTransactionHex(txid:string) {
  try {
    //https://api.blockcypher.com/v1/btc/test3/txs/<txID here>?includeHex=true
    //https://mempool.space/api/tx/15e10745f15593a899cef391191bdd3d7c12412cc4696b7bcb669d0feadc8521/hex
    const url = getConfig().mempoolUrl + '/tx/' + txid + '/hex';
    const response = await fetch(url);
    const hex = await response.text();
    return hex;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function fetchTransaction(txid:string) {
  try {
    if (txid.split(':').length > 0) return;
    const url = getConfig().mempoolUrl + '/tx/' + txid;
    const response = await fetch(url);
    if (response.status !== 200) throw new Error('fetchTransaction: Unable to fetch transaction for: ' + txid);
    const tx = await response.json();
    return tx;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function fetchAddress(address:string):Promise<AddressMempoolObject> {
  const url = getConfig().mempoolUrl + '/address/' + address;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchAddressTransactions(address:string, txId?:string) {
	const urlBase = getConfig().mempoolUrl + '/address/' + address + '/txs';
	let url = urlBase
	if (txId) {
		url = urlBase + '/chain/' + txId;
	}
	console.log('fetchAddressTransactions: url: ' + url)
	let response:any;
	let allResults:Array<any> = [];
	let results:Array<any>;
	let fetchMore = true;
	do {
		try {
			response = await fetch(url);
			results = await response.json();
			if (results && results.length > 0) {
				console.log('fetchAddressTransactions: ' + results.length + ' found at ' + results[(results.length-1)].status.block_height)
				url = urlBase + '/chain/' + results[(results.length-1)].txid;
				allResults = allResults.concat(results)
			} else {
			  fetchMore = false
			}
		} catch(err:any) {
			console.error('fetchAddressTransactions' + err.message)
			fetchMore = false
		}
	} while (fetchMore);
	console.log('fetchAddressTransactions: total of ' + allResults.length + ' found at ' + address)
	return allResults;
  } 

  export async function fetchAddressTransactionsMin(address:string) {
    const url = getConfig().mempoolUrl + '/address/' + address + '/txs';
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }
  
  export async function fetchUtxosForAddress(address:string) {
    let url = getConfig().electrumUrl + '/address/' + address + '/utxo';
    console.log('fetchUtxoSetDevnet: fetchUtxosForAddress' + url);
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }
  
  export async function fetchUTXOs(address:string) {
  try {
    // this will work on test/main net but not devnet
    const url = getConfig().mempoolUrl + '/address/' + address + '/utxo';
    const response = await fetch(url);
    //if (response.status !== 200) throw new Error('Unable to retrieve utxo set from mempool?');
    const result = await response.json();
    return result;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function readTx(txid:string) {
  const url = getConfig().mempoolUrl + '/tx/' + txid;
  const response = await fetch(url);
  const result = await response.json();
  let error = '';
  try {
    return (result.vout);
  } catch (err:any) {
    error = err.message;
  }
  throw new Error(error);
}

export async function sendRawTxDirectMempool(hex:string) {
  const url = getConfig().mempoolUrl + '/tx';
  console.log('sendRawTxDirectMempool: ', url)
  const response = await fetch(url, {
    method: 'POST',
    //headers: { 'Content-Type': 'application/json' },
    body: hex
  });
  let result:any;
  if (response.status !== 200) throw new Error('Mempool error: ' + response.status + ' : ' + response.statusText);
  try {
    result = await response.json();
  } catch (err) {
    result = await response.text();
  }
  return result;
}
