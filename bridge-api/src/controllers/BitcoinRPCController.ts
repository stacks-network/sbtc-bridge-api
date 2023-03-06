import { Get, Route } from "tsoa";
import { fetchRawTx } from '../lib/bitcoin/rpc_transaction';
import { getAddressInfo, estimateSmartFee, loadWallet, unloadWallet, listWallets } from "../lib/bitcoin/rpc_wallet";
import { getBlockChainInfo, getBlockCount } from "../lib/bitcoin/rpc_blockchain";
import { fetchUTXOs } from "../lib/bitcoin/mempool_api";
import { fetchCurrentFeeRates as fetchCurrentFeeRatesCypher } from "../lib/bitcoin/blockcypher_api";
import { btcNode, btcRpcUser, btcRpcPwd, walletPath } from '../lib/config';

export interface FeeEstimateResponse {
    feeInfo: {
        low_fee_per_kb:number;
        medium_fee_per_kb:number;
        high_fee_per_kb:number;
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

export const BASE_URL = `http://${btcRpcUser}:${btcRpcPwd}@${btcNode}${walletPath}`;

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
    console.log('BASE_URL : ' + BASE_URL);
    const result = await getAddressInfo(address);
    // mempool 
    const utxos = await fetchUTXOs(address);
    // bitcoin rpc - only usefull with own/imported addresses: const utxos = await listUnspent();
    // other; electrumx, hiro ??
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
  @Get("/loadwallet/:name")
  public async loadWallet(name:string): Promise<any> {
    const wallets = await listWallets();
    console.log('wallets: ', wallets)
    for (const wallet in wallets) {
      try {
        await unloadWallet(name);
      } catch(err:any) {
        console.error('wallet: ' + name + ' : ' + err.message)
      }
    }
    const result = await loadWallet(name);
    return result;
  }
  @Get("/listwallets")
  public async listWallets(): Promise<any> {
    const wallets = await listWallets();
    console.log('wallets: ', wallets)
    const result = await listWallets();
    return result;
  }
}



@Route("/bridge-api/v1/btc/blocks")
export class BlocksController {

  @Get("/fee-estimate")
  public async getFeeEstimate(): Promise<FeeEstimateResponse> {
    try {
      return fetchCurrentFeeRatesCypher();
    } catch(err) {
      return estimateSmartFee();
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