import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../controllers/BitcoinRPCController.js'
import { c32address } from 'c32check';
import { getBlock } from './rpc_blockchain.js';
import { fetchTransaction, fetchTransactionHex } from './mempool_api.js';
import { bitcoinToSats } from '../utils.js';
import { getDataToSign, getStacksAddressFromSignature } from '../structured-data.js';
import { getConfig } from '../config.js';
import { hashMessage } from '@stacks/encryption';
import { getSbtcWallet, getPegInAmountSats, getWitnessData } from '../utils.js'

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
    try {
      res.block = await getBlock(res.blockhash, 1)
    } catch (err) {
      console.log('Unable to get block info')
    }
  }
  return res;
}
 
export async function fetchPegTxData(txid:string, verbose:boolean) {
  const res = await fetchRawTx(txid, true);
  //console.log('fetchPegTxData ', util.inspect(res, false, null, true /* enable colors */));
  const sbtcWalletAddress = getSbtcWallet(res.vout);
  const pegInAmountSats = getPegInAmountSats(res.vout);
  const parsed = parseOutputs(res.vout[0], sbtcWalletAddress, pegInAmountSats);
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
  revealFee: number;
};

export function parseOutputs(output0:any, sbtcWalletAddress:string, amountSats: number) {
  const parsed = {
    pegType: 'pegin',
    compression: 0,
    sbtcWallet: sbtcWalletAddress,
  } as parsedDataType;
  let witnessData = getWitnessData(output0);
  const d1 = witnessData.d1;
  const opcode = witnessData.opcode;
  const index = (witnessData.magic) ? 2 : 0;

  if (opcode.toUpperCase() === '3C') {
    const addr0 = parseInt(d1.subarray(index + 1, index + 2).toString('hex'), 16);
    const addr1 = d1.subarray(index + 2, index + 22).toString('hex');
    parsed.stxAddress = c32address(addr0, addr1);
    parsed.cname = d1.subarray(index + 22, index + 56).toString('utf8');
    parsed.amountSats = amountSats;
    parsed.revealFee = d1.subarray(index + 56, index + 84).readUInt32BE();
    //TODO MJC: better way to do this ?
    if (parsed.cname.startsWith('\x00\x00\x00\x00\x00')) parsed.cname = undefined;
  } else if (opcode.toUpperCase() === '3E') {
    parsed.pegType = 'pegout';
    parsed.dustAmount = bitcoinToSats(output0.value);
    parsed.amountSats = d1.subarray(index + 1, index + 10).readUInt32BE();
    parsed.signature = d1.subarray(index + 10, index + 75).toString('hex');
    parsed.compression = (output0.scriptPubKey.type === 'nulldata') ? 0 : 1;
    const dataToSign = getDataToSign(parsed.amountSats, parsed.sbtcWallet);
    const msgHash = hashMessage(dataToSign.toString('hex'));
    const stxAddress = getStacksAddressFromSignature(msgHash, parsed.signature, parsed.compression);
    parsed.stxAddress = (getConfig().network === 'testnet') ? stxAddress.tp2pkh : stxAddress.mp2pkh;
  } else { 
    throw new Error('Wrong opcode : expected: 3A or 3C :  receved: ' + opcode)
  }
  return parsed;
}

