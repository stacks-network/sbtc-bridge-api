import fetch from 'node-fetch';
import { BASE_URL, OPTIONS } from '../../routes/bitcoin/BitcoinRPCController.js'
import { getBlock } from './rpc_blockchain.js';
import { fetchTransaction, fetchTransactionHex } from './api_mempool.js';
import { getConfig } from '../config.js';
import { readDepositValue, parseOutputs, parseSbtcWalletAddress, parsePayloadFromUnknownOutput } from 'sbtc-bridge-lib' 
import type { DepositPayloadType, PayloadType, WithdrawalPayloadType } from 'sbtc-bridge-lib';
import util from 'util'
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { getAddressFromOutScript } from 'sbtc-bridge-lib/dist/wallet_utils.js';
import { c32address } from 'c32check';

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
 
export async function readPayloadData(txid:string, verbose:boolean) {
  if (!txid) return
  const txHex = await fetchTransactionHex(txid);
  console.log('readPayloadData:txHex: ' + txHex);
  const tx:btc.Transaction = btc.Transaction.fromRaw(hex.decode(txHex), {allowUnknowInput:true, allowUnknowOutput: true, allowUnknownOutputs: true, allowUnknownInputs: true})
  const out0 = tx.getOutput(0);
  const spendScr = btc.OutScript.decode(out0.script)

  const payload = {} as PayloadType;
  if (spendScr.type === 'unknown' && Number(out0.amount) === 0) {
    // op_return variant
    const out1 = tx.getOutput(1);
    const sbtcWalletAddress = getAddressFromOutScript(getConfig().network, out1.script)
    console.log('readPayloadData:sbtcWalletAddress: ' + sbtcWalletAddress);
    try {
      out0.script = out0.script.subarray(2)
      payload.payload = parsePayloadFromUnknownOutput(getConfig().network, out0, sbtcWalletAddress);
      payload.payload.amountSats = Number(out1.amount)
    } catch(err:any) {
      console.log('readPayloadData:payload:error: ' + err.message);
    }
  } else {
    // op_return variant
    const out1 = tx.getOutput(0);
    const sbtcWalletAddress = getAddressFromOutScript(getConfig().network, out1.script)
    payload.payload = parsePayloadFromUnknownOutput(getConfig().network, out0, sbtcWalletAddress);
    payload.payload.amountSats = Number(out1.amount)
  }










  /**
  const out1 = tx.getOutput(1);
  console.log('fetchPegTxData:sbtcWalletAddress: ', util.inspect(sbtcWalletAddress, false, null, true));
  const sbtcWalletAddress = parseSbtcWalletAddress(getConfig().network, res.vout);
  console.log('fetchPegTxData ', util.inspect(res.txid, false, null, true));
  const pegInAmountSats = readDepositValue(res.vout);
  payload.payload = parseOutputs(getConfig().network, res.vout[0], sbtcWalletAddress.bitcoinAddress, pegInAmountSats);
  payload.sbtcWallet = sbtcWalletAddress.bitcoinAddress;
  payload.burnBlockHeight = res.block.height;
  */
  return payload;
}

