import fetch from 'node-fetch';
import { getConfig } from '../../../lib/config.js';
import { payloadType, readDepositValue, parseOutputs, parseSbtcWalletAddress } from 'sbtc-bridge-lib' 
import { fetchTransaction, fetchTransactionHex } from './MempoolApi.js';

async function handleError (response:any, message:string) {
  if (response?.status !== 200) {
    const result = await response.json();
    console.log('==========================================================================');
    if (result?.error?.code) console.log(message + ' : ' + result.error.code + ' : ' + result.error.message);
    else console.log(message, result.error);
    console.log('==========================================================================');
    throw new Error(message);
  }
}

const BASE_URL = `http://${getConfig().btcRpcUser}:${getConfig().btcRpcPwd}@${getConfig().btcNode}${getConfig().walletPath}`;

const OPTIONS = {
  method: "POST",
  headers: { 'content-type': 'text/plain' },
  body: '' 
};

export async function getAddressInfo(address:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getaddressinfo","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'getAddressInfo internal error: ' + address);
  const result = await response.json();
  return result.result;
}

export async function fetchPegTxData(txid:string, verbose:boolean) {
  const res = await fetchRawTx(txid, true);
  //console.log('fetchPegTxData ', util.inspect(res, false, null, true /* enable colors */));
  const sbtcWalletAddress = parseSbtcWalletAddress(getConfig().network, res.vout);
  const pegInAmountSats = readDepositValue(res.vout);
  const parsed:payloadType = parseOutputs(getConfig().network, res.vout[0], sbtcWalletAddress, pegInAmountSats);
  parsed.burnBlockHeight = res.block.height;
  return parsed;
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
  if (res && verbose) {
    try {
      res.block = await getBlock(res.blockhash, 1)
    } catch (err) {
      console.log('Unable to get block info')
    }
  }
  return res;
}
 

export async function validateAddress(address:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"validateaddress","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Unspent not found');
  const result = await response.json();
  return result.result;
}

export async function startScantxoutset(address:string) {
  const addressInfo:any = await getAddressInfo(address);
  let dataString = `{"jsonrpc":"1.0","id":"curltext","method":"scantxoutset","params":["start", ["raw(${addressInfo.scriptPubKey})"]]}`;
  OPTIONS.body = dataString;
  fetch(BASE_URL, OPTIONS);

  dataString = `{"jsonrpc":"1.0","id":"curltext","method":"scantxoutset","params":["status"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'scantxoutset not found');
  const result = await response.json();
  //console.log('startScantxoutset.result: ', result.result)
  return result.result;
}

export async function getBlockChainInfo() {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Receive by address error: ');
  const result = await response.json();
  return result.result;
}

export async function getBlock(hash:string, verbosity:number) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":["${hash}", ${verbosity}]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'getBlock error: ');
  const result = await response.json();
  return result.result;
}

export async function getBlockCount() {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockcount","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Receive by address error: ');
  const result = await response.json();
  return { count: result.result };
}

