import fetch from 'node-fetch';
import { getConfig } from '../../../lib/config.js';
//import { parseSbtcWalletAddress, parseOutputsBitcoinCore } from './payload_helper.js'
import { PayloadType, parseOutputs, parseSbtcWalletAddress } from 'sbtc-bridge-lib' 
import { fetchTransaction, fetchTransactionHex } from './MempoolApi.js';
import { hex } from '@scure/base';
import { c32address, c32addressDecode } from 'c32check';

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
  const struc = parseSbtcWalletAddress(getConfig().network, res.vout);
  const sbtcWalletAddress = struc.bitcoinAddress;
  const pegInAmountSats = struc.amountSats;
  let parsed:PayloadType = {
    sbtcWallet: sbtcWalletAddress,
    burnBlockHeight: (res.status) ? res.status.block_height : 0,
  };
  //console.log('fetchPegTxData: output stacksAddress: ', parsed)
  /**
 */
  let stacksAddress;
  let opcode;
  try {
    console.log('fetchPegTxData: opcode: ' + res.vout[0].scriptpubkey_asm)
    const raw = res.vout[0].scriptpubkey_asm.split(' ')[2]
    const d0 = hex.decode(raw)
    const d1 = d0.subarray(2)
    console.log('fetchPegTxData: d1: ', hex.encode(d1))
    opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
    console.log('fetchPegTxData: opcode: ', opcode)
    const prinType = parseInt(hex.encode(d1.subarray(1,2)), 8);
    console.log('fetchPegTxData prinType: ', prinType)
  
    //if (opcode !== '3C') throw new Error('Wrong opcode for deposit: should be 3C was ' + opcode)
    //const prinType = parseInt(hex.encode(d1.subarray(1,2)), 16);
    //console.log('fetchPegTxData: prinType: ', prinType)
    const addr0 = parseInt(hex.encode(d1.subarray(1,2)), 8);
    console.log('fetchPegTxData: addr0: ', addr0)
    const addr1 = hex.encode(d1.subarray(2,22));
    console.log('fetchPegTxData: addr1: ', addr1)
    stacksAddress = c32address(addr0, addr1);
    console.log('fetchPegTxData: output stacksAddress: ', stacksAddress)
  } catch (e:any) {
    //console.log('fetchPegTxData: err: ' + e.message)
    //return parsed
  }
  //return parsed

  try {
    //console.log('fetchPegTxData: output 0: ', d1)
    if (!stacksAddress) {
      parsed.payload = parseOutputs(getConfig().network, res.vout[0], sbtcWalletAddress, pegInAmountSats);
    } else {
      parsed.payload = {
        opcode,
        prinType: 0,
        stacksAddress,
        lengthOfCname: 0,
        cname: undefined,
        lengthOfMemo: 0,
        memo: undefined,
        revealFee: 0,
        amountSats: pegInAmountSats
      }
    }
    console.log('fetchPegTxData: parseOutputs: ' + 'parsedparsedparsedparsedparsedparsedparsed' + ' ' + res.vout[0].scriptpubkey_asm)
  } catch (err:any) {
    console.log('fetchPegTxData: parseOutputs: ' + err.message + ' ' + res.vout[0].scriptpubkey_asm)
    //parsed.payload = parseOutputsBitcoinCore(getConfig().network, res.vout[0], sbtcWalletAddress, pegInAmountSats);
  }
  //console.log('fetchPegTxData parsed: ', parsed);
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
  /**
  if (res && verbose) {
    try {
      res.block = await getBlock(res.blockhash, 1)
    } catch (err) {
      console.log('Unable to get block info', err)
    }
  }
   */
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

