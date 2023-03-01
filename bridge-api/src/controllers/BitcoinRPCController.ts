import { Get, Route } from "tsoa";
import { fetchRawTx } from '../lib/bitcoin/rpc_transaction';
import { getAddressInfo, estimateSmartFee } from "../lib/bitcoin/rpc_wallet";
import { getBlockChainInfo, getBlockCount } from "../lib/bitcoin/rpc_blockchain";
import { fetchUTXOs } from "../lib/bitcoin/mempool_api";
import { fetchCurrentFeeRates as fetchCurrentFeeRatesCypher } from "../lib/bitcoin/blockcypher_api";
import { btcNode, btcRpcUser, btcRpcPwd } from '../lib/config';

export interface FeeEstimateResponse {
    feeInfo: {
        low_fee_per_kb:number, 
        medium_fee_per_kb:number, 
        high_fee_per_kb:number
    };
}
export async function handleError (response:any, message:string) {
  if (response?.status !== 200) {
    const result = await response.json();
    console.log('==========================================================================');
    if (result?.error?.code) console.log(message + ' : ' + result.error.code + ' : ' + result.error.message);
    else console.log(message, result.error);
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
@Route("/bridge-api/v1/btc/tx")
export class TransactionController {
  @Get("/:txid")
  public async fetchRawTransaction(txid:string): Promise<any> {
    console.log('fetchRawTx: ' + txid);
    return await fetchRawTx(txid, true);
  }
}

@Route("/bridge-api/v1/btc/wallet")
export class WalletController {

    @Get("/address/:address/utxos")
    public async fetchUtxoSet(address:string): Promise<any> {
      const result = await getAddressInfo(address);
      console.log('fetchUtxoSet : result : ', result);
      const utxos = await fetchUTXOs(address);
      console.log('fetchUtxoSet : utxos : ', utxos);
      for (let utxo of utxos) {
        const tx = await fetchRawTx(utxo.txid, true);
        console.log('fetchUtxoSet : tx : ', tx);
        utxo.tx = tx;
      }
      result.utxos = utxos
      console.log('fetchUtxoSet: ', result.utxos);
      return result;
    }

}

@Route("/bridge-api/v1/btc/blocks")
export class BlocksController {

  @Get("/fee-estimate")
  public async getFeeEstimate(): Promise<FeeEstimateResponse> {
    try {
      return estimateSmartFee();
    } catch(err) {
      console.log('fetchCurrentFeeRates:', err)
      return fetchCurrentFeeRatesCypher();
    }
  }
  
  @Get("/info")
    public async getInfo(): Promise<any> {
      return getBlockChainInfo();
  }
  @Get("/count")
    public async getCount(): Promise<any> {
      return getBlockCount();
  }
}

export class DefaultController {
    public getFeeEstimate(): string {
      return "Welcome to SBTC Bridge API...";
    }
}