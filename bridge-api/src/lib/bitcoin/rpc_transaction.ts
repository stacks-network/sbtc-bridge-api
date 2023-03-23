import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../controllers/BitcoinRPCController.js'
import { hexToAscii } from "../stacks_helper.js";
import { c32address } from 'c32check';
import util from 'util'
import { getBlock } from './rpc_blockchain.js';
import { bitcoinToSats } from '../utils.js';
import { getDataToSign, getStacksAddressFromSignature } from '../structured-data.js';
import * as  btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { network } from '../config.js';
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
  const response = await fetch(BASE_URL, OPTIONS);
  //await handleError(response, 'fetchRawTransaction not found');
  const result = await response.json();
  const res = result.result;
  if (verbose) {
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
    parsed.sbtcWallet = btc.Address(getNet()).encode(encscript);
  }
}

export function parseOutputs(outputs:Array<any>) {
  const parsed = {
    pegType: 'pegin',
    opType: 'return',
    compression: 0,
  } as parsedDataType;

  console.log('parseOutputs : outputs : ', util.inspect(outputs, false, null, true /* enable colors */));
  let d1;
  if (outputs[0].scriptPubKey.type.toLowerCase() === 'nonstandard') {
    d1 = Buffer.from(outputs[0].scriptPubKey.asm.split(' ')[1], 'hex');
    parsed.opType = 'drop';
    console.log('parseOutputs : magic : ' + d1.toString('hex') + ' : ' + parsed.opType);
  } else {
    d1 = Buffer.from(outputs[0].scriptPubKey.asm.split(' ')[1], 'hex');
    parsed.opType = 'drop';
  }
  const magic = d1.subarray(0,2);
  //console.log('parseOutputs : d1 : ' + d1.toString('hex') + ' : ' + parsed.opType);
  //console.log('parseOutputs : magic : ' + magic.toString('hex'));
  //console.log('parseOutputs : data : ', util.inspect(d1, false, null, true /* enable colors */));

  const magicExpected = (network === 'testnet') ? MAGIC_BYTES_TESTNET : MAGIC_BYTES_MAINNET;
  if (magic.toString('hex') !== magicExpected) 
    throw new Error('Wrong magic : expected: ' +  magicExpected + '  receved: ' + magic.toString('hex'))
  const opcode = d1.subarray(2,3).toString('hex');

  console.log('parseOutputs : magic : ' + magic.toString('hex'));
  console.log('parseOutputs : opcode : ' + opcode);

  if (opcode.toUpperCase() === '3C') {
    const addr0 = parseInt(d1.subarray(3,4).toString('hex'), 16);
    const addr1 = d1.subarray(4,24).toString('hex');
    parsed.stxAddress = c32address(addr0, addr1);
    parsed.cname = d1.subarray(24).toString('utf8');
    if (parsed.cname.startsWith('\x00\x00\x00\x00\x00')) parsed.cname = undefined;
    setSbtcWallet(outputs, parsed);
  } else if (opcode.toUpperCase() === '3E') {
    parsed.pegType = 'pegout';
    parsed.dustAmount = bitcoinToSats(outputs[0].value);
    parsed.amountSats = d1.subarray(3,12).readUInt32LE();
    parsed.signature = d1.subarray(12, 77).toString('hex');
		//console.log('getOpDropP2shScript:signature : ', d1.length);
		//console.log('getOpDropP2shScript:signature : ', parsed.signature.length);
		//console.log('getOpDropP2shScript:signature : ', parsed.signature);
		//console.log('getOpDropP2shScript:amountSats : ', parsed.amountSats);

    parsed.compression = (outputs[0].scriptPubKey.type === 'nulldata') ? 0 : 1;

    setSbtcWallet(outputs, parsed)
		console.log('getOpDropP2shScript:amountSats : ', parsed.amountSats);
		console.log('getOpDropP2shScript:sbtcWallet : ', parsed.sbtcWallet);

    const dataToSign = getDataToSign(parsed.amountSats, parsed.sbtcWallet);
    const msgHash = hashMessage(dataToSign.toString('hex'));
		console.log('getOpDropP2shScript:dataToSign : ', Buffer.from(dataToSign).toString('hex'));
		console.log('getOpDropP2shScript:msgHash : ', Buffer.from(msgHash));
    const stxAddress = getStacksAddressFromSignature(msgHash, parsed.signature, parsed.compression);
    parsed.stxAddress = (network === 'testnet') ? stxAddress.tp2pkh : stxAddress.mp2pkh;

  } else { 
    throw new Error('Wrong opcode : expected: 3A or 3C :  receved: ' + opcode)
  }
  return parsed;
}

