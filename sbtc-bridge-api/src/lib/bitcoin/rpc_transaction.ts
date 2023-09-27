import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../routes/bitcoin/BitcoinRPCController.js'
import { getBlock } from './rpc_blockchain.js';
import { fetchTransaction, fetchTransactionHex } from './api_mempool.js';
import { getConfig } from '../config.js';
import { parsePayloadFromTransaction } from 'sbtc-bridge-lib';

export async function sendRawTxRpc(hex:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${hex}]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  const result = await response.text();
  return result;
}

export async function fetchRawTx(txid:string, verbose:boolean) {
  let dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getrawtransaction","params":["${txid}", ${verbose}]}`;
  OPTIONS.body = dataString; 
  let res;
  try {
    const response = await fetch(BASE_URL, OPTIONS);
    //await handleError(response, 'fetchRawTransaction not found');
    const result = await response.json();
    res = result.result;
  } catch (err) {}
  //console.log('fetchRawTx: res1: ', res);
  if (!res) {
    res = await fetchTransaction(txid);
    res.hex = await fetchTransactionHex(txid);
  }
  /**
  if (res && verbose) {
    try {
      res.block = await getBlock(res.blockhash, 1)
    } catch (err) {
      console.log('Unable to get block info')
    }
  }
   */
  return res;
}
 
export async function readPayloadData(txid:string, verbose:boolean) {
  if (!txid) return
  const txHex = await fetchTransactionHex(txid);
  console.log('readPayloadData:txHex: ' + txHex);
  return parsePayloadFromTransaction(getConfig().network, txHex);
}

