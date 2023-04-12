import { Get, Route } from "tsoa";
import { fetchRawTx, sendRawTxRpc } from '../lib/bitcoin/rpc_transaction.js';
import { validateAddress, walletProcessPsbt, getAddressInfo, estimateSmartFee, loadWallet, unloadWallet, listWallets } from "../lib/bitcoin/rpc_wallet.js";
import { getBlockChainInfo, getBlockCount } from "../lib/bitcoin/rpc_blockchain.js";
import { fetchUTXOs, sendRawTx, fetchAddressTransactions } from "../lib/bitcoin/mempool_api.js";
import { fetchCurrentFeeRates as fetchCurrentFeeRatesCypher } from "../lib/bitcoin/blockcypher_api.js";
import { getConfig } from '../lib/config.js';

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

export const BASE_URL = `http://${getConfig().btcRpcUser}:${getConfig().btcRpcPwd}@${getConfig().btcNode}${getConfig().walletPath}`;

export const OPTIONS = {
  method: "POST",
  headers: { 'content-type': 'text/plain' },
  body: '' 
};
@Route("/bridge-api/v1/btc/tx")
export class TransactionController {
  @Get("/:txid")
  public async fetchRawTransaction(txid:string): Promise<any> {
    return await fetchRawTx(txid, true);
  }
  //@Post("/sendrawtx")
  public async sendRawTransaction(hex:string): Promise<any> {
      try {
        const resp = await sendRawTx(hex);
        return resp;
      } catch (err) {
        const resp =  await sendRawTxRpc(hex);
        return resp;
      }
  }
}
 
@Route("/bridge-api/v1/btc/wallet")
export class WalletController {
  
  public async validateAddress(address:string): Promise<any> {
    const result = await validateAddress(address);
    return result;
  }

  public async processPsbt(psbtHex:string): Promise<any> {
    const result = await walletProcessPsbt(psbtHex);
    return result;
  }

  public async fetchAddressTransactions(address:string): Promise<any> {
    const result = await fetchAddressTransactions(address);
    return result;
  }

  public async fetchUtxoSet(address:string, verbose:boolean): Promise<any> {
    const result = await getAddressInfo(address);
    try {
      const addressValidation = await validateAddress(address);
      result.addressValidation = addressValidation
    } catch (err:any) {
      console.log('fetchUtxoSet: addressValidation: ' + err.message)
      // carry on
    }
    try {
      console.log('fetchUtxoSet1:', result)
      const utxos = await fetchUTXOs(address);
      console.log('fetchUtxoSet2:', utxos)
      for (let utxo of utxos) {
        const tx = await fetchRawTx(utxo.txid, verbose);
        console.log('fetchUtxoSet3:', tx)
        utxo.tx = tx;
      }
      result.utxos = utxos
    } catch (err:any) {
      console.log('fetchUtxoSet: fetchUTXOs: ' + err.message)
      // carry on
    }
    return result;
  }
  @Get("/loadwallet/:name")
  public async loadWallet(name:string): Promise<any> {
    const wallets = await listWallets();
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
      return "Welcome to sBTC Bridge API...";
    }
}