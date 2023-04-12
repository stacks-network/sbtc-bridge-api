import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../controllers/BitcoinRPCController.js'
import { hexToAscii, decodeStacksAddress } from "../stacks_helper.js";
import util from 'util'
import { getBlock } from './rpc_blockchain.js';
import { bitcoinToSats } from '../utils.js';
import { getDataToSign, getStacksAddressFromSignature } from '../structured-data.js';
import * as  btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { network } from '../config.js';
import { hashMessage } from '@stacks/encryption';

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
  console.log('decodePegOutOutputs:outputs ', util.inspect(outputs, false, null, true /* enable colors */));
  // dust amount is sent to sbtc wallet in output 1
  let parsed = parseOutputs(outputs);
  console.log('decodePegOutOutputs:parsed ', util.inspect(parsed, false, null, true /* enable colors */));
  const dataToSign = getDataToSign(parsed.amountSats, parsed.sbtcWallet);
  const msgHash = hashMessage(dataToSign.toString('hex'));
  console.log('msgHash: ' + msgHash); 
  const stxAddress = getStacksAddressFromSignature(msgHash, parsed.signature.toString('binary'), parsed.compression);
  parsed.stxAddress = (network === 'testnet') ? stxAddress.tp2pkh : stxAddress.mp2pkh;
  console.log('decodePegOutOutputs:stxAddress ', util.inspect(stxAddress, false, null, true /* enable colors */));
  return parsed; 
}

type parsedDataType = {
  pegType: string;
  opType: string;
  stxAddress?: string;
  sbtcWallet: string;
  signature: Buffer;
  compression: number,
  amountSats: number;
  dustAmount: number;
};

export function parseOutputs(outputs:Array<any>):parsedDataType {
  if (outputs[0].scriptPubKey.type === 'nulldata') {
    // op_return
    const data = Buffer.from(outputs[0].scriptPubKey.hex, 'hex');
    const sig = data.subarray(12);
    const amt = data.subarray(3,11).readUInt32LE();
    console.log('sif: ' + sig);
    console.log('amt: ' + data.subarray(3,13).toString('hex'));
    console.log('amt: ' + amt);
    return {
      pegType: 'pegout',
      opType: 'return',
      compression: 0,
      sbtcWallet: outputs[1].scriptPubKey.address,
      signature: sig,
      amountSats: amt,
      dustAmount: bitcoinToSats(outputs[1].value)
    }
  } else if (outputs[0].scriptPubKey.type === 'nonstandard') {
    // op_drop
	  const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    const asm = outputs[0].scriptPubKey.asm.split(' ');
    const script = asm[4] 

    const asmScript = btc.Script.encode(['DUP', 'HASH160', Buffer.from(script, 'hex'), 'EQUALVERIFY', 'CHECKSIG'])

    console.log('getOpDropP2shScript:asmScript: ', asmScript)

    console.log('getOpDropP2shScript:script : ', script);
		const addr = btc.OutScript.decode(Uint8Array.from(Buffer.from(script, 'hex')));
		const addr1 = btc.Address(net).encode(addr);
		console.log('getOpDropP2shScript:addr : ', addr);
		console.log('getOpDropP2shScript:addr1 : ', addr1);









    //const p2pkh = outputs[0].scriptPubKey.asm.split(' ').slice(2);
    //const encscript = btc.Script.encode(fromASM(p2pkh));
    //console.log('encscript: ', encscript)
    //const script = btc.OutScript.decode(Buffer.from(outputs[0].scriptPubKey.asm))
    //const addr = outputs[1].scriptPubKey.address;
    //console.log('addr.encode(script): ', addr.encode(script))
    //console.log('script: ', script)
    //const data = Buffer.from(outputs[1].scriptPubKey.hex, 'hex');
    //const dropData = outputs[0].scriptPubKey.asm.split(' ')[0]
    //const data = Buffer.from(dropData, 'hex');
    //const pegOutAmount = data.subarray(0,8).readUInt32LE();
    //const signature = data.subarray(9);
 
    const data = Buffer.from(outputs[0].scriptPubKey.hex, 'hex');
    const amt = data.subarray(2,10).readUInt32LE();
    const sig = data.subarray(11, 141); 
    console.log('sif: ' + sig);
    console.log('amt: ' + data.subarray(2,10).toString('hex'));
    console.log('amt: ' + amt);
    return {
      pegType: 'pegout',
      opType: 'drop',
      compression: 1,
      sbtcWallet: outputs[1].scriptPubKey.address,
      signature: sig,
      amountSats: amt,
      dustAmount: bitcoinToSats(outputs[1].value)
    }
  } else {
    console.log('Error parsing : ', outputs)
    throw new Error('Outputs not parsable');
  }
}

export function fromASM(asm:string) {
  const ops = asm.split(' '); 
  const out = [];
  for (const op of ops) {
    if (op.startsWith('OP_')) {
      let opName:any = op.slice(3);
      if (opName === 'FALSE') opName = 0;
      if (opName === 'TRUE') opName = 1;
      // Handle numeric opcodes
      if (String(Number(opName)) === opName) opName = +opName;
      else if (btc.OP[opName] === undefined) throw new Error(`Wrong opcode='${op}'`);
      out.push(opName);
    } else {
      out.push(hex.decode(op));
    }
  }
  return out;
}
