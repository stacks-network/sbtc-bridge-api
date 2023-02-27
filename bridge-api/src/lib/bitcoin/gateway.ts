import { fetchUTXOs } from "./mempool_api";
import { fetchCurrentFeeRates as fetchCurrentFeeRatesCypher } from "./blockcypher_api";
import { getAddressInfo, estimateSmartFee } from "./rpc_wallet";
import { fetchRawTransaction } from "./rpc_transaction";
import util from 'util'
import { btcNode, btcRpcUser, btcRpcPwd } from '../config';

export async function fetchUtxoSet(address:string) {
  const result = await getAddressInfo(address);
  const utxos = await fetchUTXOs(address);
  for (let utxo of utxos) {
    const tx = await fetchRawTransaction(utxo.txid, true);
    utxo.tx = tx;
  }
  result.utxos = utxos
  console.log('fetchUtxoSet: ', util.inspect(result, false, null, true /* enable colors */));
  return result;
}


export async function fetchCurrentFeeRates() {
  try {
    return estimateSmartFee();
  } catch(err) {
    console.log('fetchCurrentFeeRates:', err)
    return fetchCurrentFeeRatesCypher();
  }
}

export async function handleError (response:any, message:string) {
  if (response.status !== 200) {
    const result = await response.json();
    console.log('==========================================================================');
    if (result.error.code) console.log(message + ' : ' + result.error.code + ' : ' + result.error.message);
    else console.log(message, util.inspect(result.error, false, null, true /* enable colors */));
    console.log('==========================================================================');
    throw new Error(message);
  }
}

export const BASE_URL = `http://${btcRpcUser}:${btcRpcPwd}@${btcNode}/`;

export const OPTIONS = {
  method: "POST",
  headers: { 'content-type': 'text/plain' },
  body: '' 
};

