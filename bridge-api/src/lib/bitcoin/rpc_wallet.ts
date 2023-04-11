import { BASE_URL, OPTIONS, handleError } from '../../controllers/BitcoinRPCController.js'
import fetch from 'node-fetch';
import type { FeeEstimateResponse } from '../../controllers/BitcoinRPCController.js'
import util from 'util'

export async function listUnspent() {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listunspent","params":[3, 6, []]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Unspent not found');
  const result = await response.json();
  return result.result;
}

export async function validateAddress(address:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"validateaddress","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Unspent not found');
  const result = await response.json();
  return result.result;
}

export async function estimateSmartFee(): Promise<FeeEstimateResponse> {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"estimatesmartfee","params":[6]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Fee info not found');
  const result = await response.json();
  const feeRate = result.result.feerate * 100000000; // to go to sats
  return {
    feeInfo: {
		  low_fee_per_kb: feeRate / 2,
		  medium_fee_per_kb: feeRate,
		  high_fee_per_kb: feeRate * 2
	  }
  };
}

export async function listReceivedByAddress() {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listreceivedbyaddress","params":[3, false, true]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'Receive by address error: ');
  const result = await response.json();
  return result.result;
}

export async function listWallets() {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listwallets","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'loadWallet internal error');
  const result = await response.json();
  return result;
}

export async function unloadWallet(name:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"unloadwallet","params":["${name}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'loadWallet internal error');
  const result = await response.json();
  return result;
}

export async function loadWallet(name:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"loadwallet","params":["${name}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'loadWallet internal error');
  const result = await response.json();
  return result.result;
}

export async function walletProcessPsbt(psbtHex:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"walletprocesspsbt","params":["${psbtHex}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'getAddressInfo internal error');
  const result = await response.json();
  return result.result;
}

export async function getAddressInfo(address:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getaddressinfo","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'getAddressInfo internal error');
  const result = await response.json();
  return result.result;
}

export async function importAddress(address:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"importaddress","params":["${address}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'importAddress internal error');
  const result = await response.json();
  return result.result;
}

export async function importPubkey(pubkey:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"importpubkey","params":["${pubkey}"]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'importPubkey internal error');
  const result = await response.json();
  return result.result;
}

export async function getWalletInfo(pubkey:string) {
  const dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getwalletinfo","params":[]}`;
  OPTIONS.body = dataString;
  const response = await fetch(BASE_URL, OPTIONS);
  await handleError(response, 'getWalletInfo internal error');
  const result = await response.json();
  return result.result;
}

