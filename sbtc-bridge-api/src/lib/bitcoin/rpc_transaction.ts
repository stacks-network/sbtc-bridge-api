import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../controllers/BitcoinRPCController.js'
import { c32address } from 'c32check';
import util from 'util'
import { getBlock } from './rpc_blockchain.js';
import { fetchTransaction, fetchTransactionHex } from './mempool_api.js';
import { bitcoinToSats } from '../utils.js';
import { getDataToSign, getStacksAddressFromSignature } from '../structured-data.js';
import * as  btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { getConfig } from '../config.js';
import { hashMessage } from '@stacks/encryption';
import { getNet } from '../utils.js'

export const MAGIC_BYTES_TESTNET = '5432';
export const MAGIC_BYTES_MAINNET = '5832';
export const PEGIN_OPCODE = '3C';
export const PEGOUT_OPCODE = '3E'; // >

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
  if (res && verbose) {
    res.block = await getBlock(res.blockhash, 1)
  }
  return res;
}
 
export async function fetchPegTxData(txid:string, verbose:boolean) {
  const res = await fetchRawTx(txid, true);
  //console.log('fetchPegTxData ', util.inspect(res, false, null, true /* enable colors */));
  const parsed = parseOutputs(res.vout);
  parsed.burnBlockHeight = res.block.height;
  return parsed;
}
type parsedDataType = {
  pegType: string;
  opType: string;
  stxAddress?: string;
  cname?: string|undefined;
  sbtcWallet: string;
  signature: string;
  compression: number,
  amountSats: number;
  dustAmount: number;
  burnBlockHeight: number;
};

function setSbtcWallet(outputs:Array<any>, parsed:parsedDataType) {
  if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
    parsed.sbtcWallet = outputs[1].scriptPubKey.address;
  } else {
    const scriptHex = outputs[0].scriptPubKey.asm.split(' ')[6];
    const encscript = btc.OutScript.decode(hex.decode(scriptHex));
    parsed.sbtcWallet = btc.Address(getNet()).encode(encscript);  }
}

function setPegInAmountSats(outputs:Array<any>, parsed:parsedDataType) {
  if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
    parsed.amountSats = bitcoinToSats(outputs[1].value);
  } else {
    parsed.amountSats = bitcoinToSats(outputs[0].value);
  }
}

export function parseOutputs(outputs:Array<any>) {
  const parsed = {
    pegType: 'pegin',
    compression: 0,
  } as parsedDataType;
  let d1;
  if (outputs[0].scriptPubKey.type.toLowerCase() === 'nonstandard') {
    d1 = Buffer.from(outputs[0].scriptPubKey.asm.split(' ')[1], 'hex');
    parsed.opType = 'drop';
  } else {
    d1 = Buffer.from(outputs[0].scriptPubKey.asm.split(' ')[1], 'hex');
    parsed.opType = 'return';
  }
  const magic = d1.subarray(0,2);
  //console.log('parseOutputs : d1 : ' + d1.toString('hex') + ' : ' + parsed.opType);
  //console.log('parseOutputs : magic : ' + magic.toString('hex'));
  //console.log('parseOutputs : data : ', util.inspect(d1, false, null, true /* enable colors */));

  const magicExpected = (getConfig().network === 'testnet') ? MAGIC_BYTES_TESTNET : MAGIC_BYTES_MAINNET;
  if (magic.toString('hex') !== magicExpected) 
    throw new Error('Wrong magic : expected: ' +  magicExpected + '  receved: ' + magic.toString('hex'))
  const opcode = d1.subarray(2,3).toString('hex');

  if (opcode.toUpperCase() === '3C') {
    const addr0 = parseInt(d1.subarray(3,4).toString('hex'), 16);
    const addr1 = d1.subarray(4,24).toString('hex');
    parsed.stxAddress = c32address(addr0, addr1);
    parsed.cname = d1.subarray(24).toString('utf8');
    if (parsed.cname.startsWith('\x00\x00\x00\x00\x00')) parsed.cname = undefined;
    setSbtcWallet(outputs, parsed);
    setPegInAmountSats(outputs, parsed);
  } else if (opcode.toUpperCase() === '3E') {
    parsed.pegType = 'pegout';
    parsed.dustAmount = bitcoinToSats(outputs[0].value);
    parsed.amountSats = d1.subarray(3,12).readUInt32LE();
    parsed.signature = d1.subarray(12, 77).toString('hex');
    parsed.compression = (outputs[0].scriptPubKey.type === 'nulldata') ? 0 : 1;
    setSbtcWallet(outputs, parsed)
    const dataToSign = getDataToSign(parsed.amountSats, parsed.sbtcWallet);
    const msgHash = hashMessage(dataToSign.toString('hex'));
    const stxAddress = getStacksAddressFromSignature(msgHash, parsed.signature, parsed.compression);
    parsed.stxAddress = (getConfig().network === 'testnet') ? stxAddress.tp2pkh : stxAddress.mp2pkh;
  } else { 
    throw new Error('Wrong opcode : expected: 3A or 3C :  receved: ' + opcode)
  }
  return parsed;
}

