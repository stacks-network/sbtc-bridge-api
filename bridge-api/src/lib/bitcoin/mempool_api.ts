import { mempoolUrl } from '../config';
import { hexToAscii, decodeStacksAddress } from "../stacks_helper";
import fetch from 'node-fetch';

/**
export async function fetchUtxoSet(address:string) {
  const url = mempoolUrl + '/address/' + address;
  const response = await fetch(url);
  if (response.status !== 200) throw new Error('Address not found - is the network correct?');
  const result = await response.json();
  const utxos = await fetchUTXOs(address);
  for (let utxo of utxos) {
    const tx = await fetchTransaction(utxo.txid);
    const hex = await fetchTransactionHex(utxo.txid);
    tx.hex = hex;
    utxo.tx = tx;
  }
  return { addressDetails: result, utxos };
}
 */

export async function fetchTransactionHex(txid:string) {
  //https://api.blockcypher.com/v1/btc/test3/txs/<txID here>?includeHex=true
  //https://mempool.space/api/tx/15e10745f15593a899cef391191bdd3d7c12412cc4696b7bcb669d0feadc8521/hex
  const url = mempoolUrl + '/tx/' + txid + '/hex';
  const response = await fetch(url);
  const hex = await response.text();
  return hex;
}

export async function fetchTransaction(txid:string) {
  const url = mempoolUrl + '/tx/' + txid;
  const response = await fetch(url);
  if (response.status !== 200) throw new Error('Unable to fetch transaction for: ' + txid);
  const tx = await response.json();
  return tx;
}

export async function fetchUTXOs(address:string) {
  const url = mempoolUrl + '/address/' + address + '/utxo';
  const response = await fetch(url);
  if (response.status !== 200) throw new Error('Unable to retrieve utxo set from mempool?');
  const result = await response.json();
  return result;
}

export async function readTx(txid:string) {
  const url = mempoolUrl + '/tx/' + txid;
  const response = await fetch(url);
  const result = await response.json();
  let error = '';
  try {
    return decodePegInOutputs(result.vout);
  } catch (err:any) {
    error = err.message;
  }
  throw new Error(error);
}

function decodePegInOutputs(outputs:any) {
  if (!outputs || outputs.length < 2) throw new Error('Incorrect number of outputs for a peg in.');
  const outZeroType = outputs[0].scriptpubkey_type.toLowerCase();
  if (outZeroType !== 'op_return') throw new Error('OP_RETURN in output 0 was expected but not found.');
  const stxAddress = hexToAscii(outputs[0].scriptpubkey).substring(2);
  try {
    decodeStacksAddress(stxAddress)
    const amountSats = (outputs[1]) ? outputs[1].value : 0;
    const sbtcWallet = outputs[1].scriptpubkey_address;
    return {
      type: 'pegin',
      stxAddress,
      amountSats,
      sbtcWallet
    }  
  } catch (err) {
    return decodePegOutOutputs(outputs);
  }
}

function decodePegOutOutputs(outputs:any) {
  const pegOutValue = Number(hexToAscii(outputs[0].scriptpubkey).substring(2));
  const amountSats = outputs[1].value;
  const sbtcWallet = outputs[1].scriptpubkey_address;
  return {
    type: 'pegout',
    stxAddress: '',
    amountSats: pegOutValue,
    sbtcWallet
  }
}