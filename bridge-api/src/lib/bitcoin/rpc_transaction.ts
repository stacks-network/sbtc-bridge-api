import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../controllers/BitcoinRPCController'
import { hexToAscii, decodeStacksAddress } from "../stacks_helper";
import util from 'util'
import { Buffer } from 'node:buffer';
import { getBlock } from './rpc_blockchain';
import { bitcoinToSats } from '../utils';


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
  const data:any = decodePegInOutputs(res.vout);
  data.burnBlockHeight = res.block.height;
  //console.log('fetchPegTxData ', util.inspect(data, false, null, true /* enable colors */));
  //console.log('=========================================================================================');
  return data;
}

function decodePegInOutputs(outputs:any) {
  if (!outputs || outputs.length < 2) throw new Error('Incorrect number of outputs for a peg in.');
  if (outputs[0].scriptPubKey.type !== 'nulldata') throw new Error('OP_RETURN in output 0 was expected but not found.');
  try {
    const addrHex = outputs[0].scriptPubKey.asm.split(' ')[1]
    const stxAddress = hexToAscii(addrHex);
    decodeStacksAddress(stxAddress)
    const amountSats = (outputs[1]) ? bitcoinToSats(outputs[1].value) : 0;
    const sbtcWallet = outputs[1].scriptPubKey.address;
    const pegIn = {
      pegType: 'pegin',
      stxAddress,
      amountSats, 
      sbtcWallet
    }
    return pegIn;
  } catch (err) {
    return decodePegOutOutputs(outputs);
  }
}

function decodePegOutOutputs(outputs:any) {
  const data = Buffer.from(outputs[0].scriptPubKey.hex, 'hex');
  //console.log('buffer ', util.inspect(data.toString('hex'), false, null, true /* enable colors */));
  let pegOutAmount;
  let signature;
  signature = data.subarray(12);
  const temp = data.subarray(3,11)
  pegOutAmount = data.subarray(3,11).readUInt32LE();
  const dustAmount = bitcoinToSats(outputs[1].value);
  const sbtcWallet = outputs[1].scriptPubKey.address;
  return {
    pegType: 'pegout',
    stxAddress: '',
    signature: (signature) ? signature.toString('hex') : '',
    amountSats: pegOutAmount,
    sbtcWallet,
    dustAmount
  }
}