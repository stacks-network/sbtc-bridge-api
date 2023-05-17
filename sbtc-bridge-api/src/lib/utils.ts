import { getConfig } from './config.js';
import * as  btc from '@scure/btc-signer';
import { hex } from '@scure/base';
export const MAGIC_BYTES_TESTNET = '5432';
export const MAGIC_BYTES_MAINNET = '5832';
export const PEGIN_OPCODE = '3C';
export const PEGOUT_OPCODE = '3E';


const btcPrecision = 100000000

export function getNet() {
  return  (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
}

export function satsToBitcoin(amountSats:number) {
  return  Math.round(amountSats) / btcPrecision
}

export function bitcoinToSats(amountBtc:number) {
  return  Math.round(amountBtc * btcPrecision)
}

export function getSbtcWallet(outputs:Array<any>) {
  let sbtcWallet;
  if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
    sbtcWallet = outputs[1].scriptPubKey.address;
  } else {
    const scriptHex = outputs[0].scriptPubKey.asm.split(' ')[6];
    const encscript = btc.OutScript.decode(hex.decode(scriptHex));
    sbtcWallet = btc.Address(getNet()).encode(encscript);  
  }
  return sbtcWallet;
}

export function getPegInAmountSats(outputs:Array<any>) {
  let amountSats = 0;
  if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
    amountSats = bitcoinToSats(outputs[1].value);
  } else {
    amountSats = bitcoinToSats(outputs[0].value);
  }
  return amountSats;
}

export function getWitnessData(output0:any) {
  let d1;
  let opType;
  let realMagic;
  let opcode;
  if (output0.scriptPubKey.type.toLowerCase() === 'nonstandard') {
    d1 = Buffer.from(output0.scriptPubKey.asm.split(' ')[1], 'hex');
    opType = 'drop';
  } else {
    d1 = Buffer.from(output0.scriptPubKey.asm.split(' ')[1], 'hex');
    opType = 'return';
  }
  const magic = d1.subarray(0,2);
  const magicExpected = (getConfig().network === 'testnet') ? MAGIC_BYTES_TESTNET : MAGIC_BYTES_MAINNET;
  if (magic.toString('hex') === magicExpected) {
    realMagic = magic.toString('hex');
    opcode = d1.subarray(2,3).toString('hex');
  } else {
    opcode = d1.subarray(0,1).toString('hex');
  }
  return {
    d1,
    opType,
    magic,
    opcode
  }
}
