import { CONFIG } from '$lib/config';
import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';
import type { AddressMempoolObject } from 'sbtc-bridge-lib' 
import type { BridgeTransactionType } from 'sbtc-bridge-lib' 

export const COMMS_ERROR = 'Error communicating with the server. Please try later.'
export const smbp = 900
export const xsbp = 700

export function dnsValidate(val:string|undefined) {
  if (!val) return false
  return (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(val))
}

export function fmtNumber(amount:number|undefined, precision:number|undefined) {
  if (!amount || amount === 0) return 0;
  if (precision && precision > 0) {
    const strAmt = '' + amount
    const part1 = strAmt.substring(0, strAmt.length - precision)
    const part2 = strAmt.substring(strAmt.length - precision)
    //const remAmt = ((amount) % precision)
    //let floatAmt = parseFloat(amount).toFixed(precision);     // formatted as a decimal

    //let floatAmt = Number(part1 + '.' + part2)
    const floatAmt = new Intl.NumberFormat().format(Number(part1));
    return floatAmt + '.' + part2
  }
  return new Intl.NumberFormat().format(amount);
}

export function isSupported(address:string) {
  const network = CONFIG.VITE_NETWORK;
  const msg = 'Please enter a valid ' + network + ' bitcoin address.'
  if (!address || address.length < 10) {
    throw new Error(msg);
  }
  const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
  const obj = btc.Address(net).decode(address);
  if (obj.type !== 'tr' && obj.type !== 'wpkh' && obj.type !== 'wsh') throw new Error(msg)
  return true;
  /**
  if (obj.type === 'pk') {
    throw new Error('Legacy addresses are not supported in the current version. ' + msg);
  }
  if (obj.type === 'ms' || obj.type === 'tr_ms') {
    throw new Error('Multisig addresses are not supported in the current version. ' + msg);
  }
  if (obj.type === 'pkh' || obj.type === 'sh') {
    // classis non segwit
    valid = true;
  }
  if (obj.type === 'wpkh' || obj.type === 'wsh' || obj.type === 'tr') {
    // segwit
    valid = true;
  }
  if (!valid) {
    throw new Error('Addresses is neither a classic (p2pkh/p2sh) or segwit (p2wpkh/p2wsh) or taproot address. ' + msg);
  }
  return valid;
   */
}

export function getNet() {
  return (CONFIG.VITE_NETWORK === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
  //if (network === 'litecoin') return { pubKeyHash: 0x30, scriptHash: 0x32 };
  //if (network === 'testnet') return { bech32: 'tb', pubKeyHash: 0x6f, scriptHash: 0xc4 };
  //if (network === 'regtest') return { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4 };
}
export function explorerAddressUrl(addr:string) {
	return CONFIG.VITE_STACKS_EXPLORER + '/address/' + addr + '?chain=' + CONFIG.VITE_NETWORK;
}
export function explorerBtcTxUrl(txid:string|undefined) {
  if (!txid) return '?';
	return CONFIG.VITE_BSTREAM_EXPLORER + '/tx/' + txid;
}

export function explorerBtcAddressUrl(address:string) {
	return CONFIG.VITE_BSTREAM_EXPLORER + '/address/' + address;
}
export function explorerTxUrl(txid:string) {
	return CONFIG.VITE_STACKS_EXPLORER + '/txid/' + txid + '?chain=' + CONFIG.VITE_NETWORK;
}

export function bitcoinBalanceFromMempool(addressMempoolObject:AddressMempoolObject|undefined) {
  if (!addressMempoolObject) return 0;
   return addressMempoolObject.chain_stats.funded_txo_sum - addressMempoolObject.chain_stats.spent_txo_sum
}

const priv = secp.utils.randomPrivateKey()
export const keySetForFeeCalculation = {
  priv,
  ecdsaPub: secp.getPublicKey(priv, true),
  schnorrPub: secp.getPublicKey(priv, false)
}

export function compare( a:BridgeTransactionType, b:BridgeTransactionType ) {
  if ( a.status < b.status ){
    return -1;
  }
  if ( a.status > b.status ){
    return 1;
  }
  return 0;
}
export function compareCurrencies( a:{ value: string; name: string; }, b:{ value: string; name: string; } ) {
  if ( a.value < b.value ){
    return -1;
  }
  if ( a.value > b.value ){
    return 1;
  }
  return 0;
}