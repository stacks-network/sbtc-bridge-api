import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../controllers/BitcoinRPCController'
import { hexToAscii, decodeStacksAddress } from "../stacks_helper";
import util from 'util'
//import btc from '@scure/btc-signer';
import { getBlock } from './rpc_blockchain';
import { bitcoinToSats } from '../utils';
import { network } from '../config';
import { getStacksAddressFromSignature } from '../structured-data'
//import * as btc from '@scure/btc-signer';

//const btc = async ():Promise<any> => {
//  await import('micro-btc-signer');
//};
//console.log('btc0 ', util.inspect(btc, false, null, true /* enable colors */));
 
//const btc = await import('micro-btc-signer');
//import btc from '@scure/btc-signer';
//const btc = (...args: any[]) => import('@scure/btc-signer').then(({default: btc}) => (...args: any));
//const { NETWORK } = await import('micro-btc-signer');

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
  const data:any = await decodePegInOutputs(res.vout);
  data.burnBlockHeight = res.block.height;
  //console.log('fetchPegTxData ', util.inspect(data, false, null, true /* enable colors */));
  //console.log('=========================================================================================');
  return data;
}

async function decodePegInOutputs(outputs:any) {
  if (!outputs || outputs.length < 2) throw new Error('Incorrect number of outputs for a peg in.');
  // not vald - op_drop .. if (outputs[0].scriptPubKey.type !== 'nulldata') throw new Error('OP_RETURN in output 0 was expected but not found.');
  try {
    const res = readStacksAddressForPegIn(outputs[0].scriptPubKey)
    decodeStacksAddress(res.address)
    const amountSats = (outputs[1]) ? bitcoinToSats(outputs[1].value) : 0;
    const sbtcWallet = outputs[1].scriptPubKey.address;
    const pegIn = {
      pegType: 'pegin',
      opType: res.opType,
      stxAddress: res.address,
      amountSats, 
      sbtcWallet
    }
    return pegIn;
  } catch (err) {
    return await decodePegOutOutputs(outputs);
  }
}

function readStacksAddressForPegIn(scriptPubKey:any):{opType:string, address:string} {
  console.log('attemptStacksAddressForPegIn:scriptPubKey ', util.inspect(scriptPubKey, false, null, true /* enable colors */));
  if (scriptPubKey.type === 'nulldata') {
    // op_return?
    const addrHex = scriptPubKey.asm.split(' ')[1]
    return { opType: 'return', address: hexToAscii(addrHex)};
  } else {
    // op_drop?
    const addrHex = scriptPubKey.asm.split(' ')[0]
    return { opType: 'drop', address: hexToAscii(addrHex)};
  }
}

async function decodePegOutOutputs(outputs:any) {
  console.log('decodePegOutOutputs:scriptPubKey ', util.inspect(outputs[0].scriptPubKey, false, null, true /* enable colors */));
  if (outputs[0].scriptPubKey.type === 'nulldata') {
    // op_return
    const data = Buffer.from(outputs[0].scriptPubKey.hex, 'hex');
    //console.log('buffer ', util.inspect(data.toString('hex'), false, null, true /* enable colors */));
    const signature = data.subarray(12);
    const pegOutAmount = data.subarray(3,11).readUInt32LE();
    const stxAddress = await getOutput2ScriptPubKey(pegOutAmount, outputs[1].scriptPubKey.address, signature);
    return {
      pegType: 'pegout',
      opType: 'return',
      stxAddress,
      signature: (signature) ? signature.toString('hex') : '',
      amountSats: pegOutAmount,
      sbtcWallet: outputs[1].scriptPubKey.address,
      dustAmount: bitcoinToSats(outputs[1].value)
    };
  } else {
    // op_drop
    const dropData = outputs[0].scriptPubKey.asm.split(' ')[0]
    const data = Buffer.from(dropData, 'hex');
    const pegOutAmount = data.subarray(0,8).readUInt32LE();
    const signature = data.subarray(9);
    const stxAddress = await getOutput2ScriptPubKey(pegOutAmount, outputs[0].scriptPubKey.address, signature);
    return {
      pegType: 'pegout',
      opType: 'drop',
      stxAddress: '',
      signature: (signature) ? signature.toString('hex') : '',
      amountSats: pegOutAmount,
      sbtcWallet: outputs[0].scriptPubKey.address,
      dustAmount: bitcoinToSats(outputs[0].value)
    };
  }
}

export async function getOutput2ScriptPubKey(amount:number, sbtcWalletAddress:string, signature:Buffer):Promise<string> {
  console.log('getOutput2ScriptPubKey:');
  //console.log('btc:', btc);
  //let btc = await import('../../../node_modules/micro-btc-signer/index');
  //let btc = await import('micro-btc-signer');
  let btc = await import('@scure/btc-signer');
  console.log('btc:', btc);
  //const {TEST_NETWORK, NETWORK,Address,OutScript} = await import('@scure/btc-signer');
  //console.log('OutScript:', OutScript);
  const amtBuf = Buffer.alloc(9);
  amtBuf.writeUInt32LE(amount, 0);
  const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
  //console.log('btc1 ', util.inspect(btc, false, null, true /* enable colors */));
  const script = btc.OutScript.encode(btc.Address(net).decode(sbtcWalletAddress))
  console.log('decodePegOutOutputs ', util.inspect(Buffer.from(script).toString('hex'), false, null, true /* enable colors */));
  const scriptBuf = Buffer.from(script);
  const data = Buffer.concat([amtBuf, scriptBuf]);
  console.log('decodePegOutOutputs ', util.inspect(data, false, null, true /* enable colors */));
  //return { script: data }
  const stxAddress = getStacksAddressFromSignature(data.toString('hex'), signature.toString('hex'));
  return (network === 'testnet') ? stxAddress.tp2pkh : stxAddress.mp2pkh;
}

