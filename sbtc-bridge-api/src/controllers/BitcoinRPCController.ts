import { Get, Route } from "tsoa";
import { fetchRawTx, sendRawTxRpc } from '../lib/bitcoin/rpc_transaction.js';
import { validateAddress, walletProcessPsbt, getAddressInfo, estimateSmartFee, loadWallet, unloadWallet, listWallets } from "../lib/bitcoin/rpc_wallet.js";
import { getBlockChainInfo, getBlockCount } from "../lib/bitcoin/rpc_blockchain.js";
import { fetchUTXOs, sendRawTx, fetchAddressTransactions } from "../lib/bitcoin/mempool_api.js";
import { fetchCurrentFeeRates as fetchCurrentFeeRatesCypher } from "../lib/bitcoin/blockcypher_api.js";
import { findPeginRequestById } from "../lib/data/db_models.js";
import { getConfig } from '../lib/config.js';
import { fetchTransactionHex } from '../lib/bitcoin/mempool_api.js';
import { schnorr } from '@noble/curves/secp256k1';
import { hex, base64 } from '@scure/base';
import type { Transaction } from '@scure/btc-signer'
import type { KeySet, WrappedPSBT, PeginRequestI } from 'sbtc-bridge-lib'
import * as btc from '@scure/btc-signer';
import { toStorable } from 'sbtc-bridge-lib' 

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
@Route("/bridge-api/:network/v1/btc/tx")
export class TransactionController {

  @Get("/keys")
  public getKeys(): KeySet {
    return {
      deposits: {
        revealPubKey: hex.encode(schnorr.getPublicKey(getConfig().btcSchnorrReveal)),
        reclaimPubKey: hex.encode(schnorr.getPublicKey(getConfig().btcSchnorrReclaim))
      }
    }
  }
  
  public async sign(wrappedPsbt:WrappedPSBT): Promise<WrappedPSBT> {
    //console.log('sign: ', wrappedPsbt);
    const pegin:PeginRequestI = await findPeginRequestById(wrappedPsbt.depositId)

    const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;

    const transaction:Transaction = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
		const script = toStorable(pegin.commitTxScript)
    
    //console.log('sign: script: ', script);

    if (pegin.status !== 2 || !pegin.btcTxid || !script) throw new Error('Incorrect status to be revealed / reclaimed')
    if (!pegin.commitTxScript) throw new Error('Incorrect data passed')
    if (!pegin.commitTxScript.address) throw new Error('Incorrect data passed')
    if (!script.tapMerkleRoot) throw new Error('Incorrect data passed')
    if (!script.tapInternalKey) throw new Error('Incorrect data passed')

    const sbtcWalletAddrScript = btc.Address(net).decode(pegin.sbtcWalletAddress)
    if (sbtcWalletAddrScript.type !== 'tr') throw new Error('Taproot required')
    const commitAddressScript = btc.Address(net).decode(pegin.commitTxScript.address);
    if (commitAddressScript.type !== 'tr') throw new Error('Taproot required')
    
    //console.log('sign: commitAddressScript: ', commitAddressScript);

    const commitTx = await fetchRawTx(pegin.btcTxid, true)
    const nextI:btc.TransactionInput = {
      txid: hex.decode(pegin.btcTxid),
      index: 0,
      nonWitnessUtxo: (commitTx.hex),
      tapLeafScript: script.tapLeafScript,
      tapMerkleRoot: script.tapMerkleRoot as Uint8Array
    }
    //console.log('nextI: ', nextI);
    transaction.addInput(nextI);

    let outAddr = pegin.sbtcWalletAddress;
    if (wrappedPsbt.txtype === 'reclaim') outAddr = commitTx.vin[0]?.prevout?.scriptpubkey_address

    const fee = 500 //transaction.fee;
    //console.log('sign: fee: ', fee);
    const amount = pegin.amount - fee;
    /**
    if (this.addressInfo.utxos.length === -1) { // never
      const feeUtxo = this.addInputForFee(tx);
      amount = pegin.amount + feeUtxo?.value - this.fee;
    }
    */
    transaction.addOutputAddress(outAddr, BigInt(amount), net);

    try {
      if (wrappedPsbt.txtype === 'reclaim') {
        transaction.sign(hex.decode(getConfig().btcSchnorrReclaim));
        transaction.finalize();
      } else {
        transaction.sign(hex.decode(getConfig().btcSchnorrReveal));
        //console.log('sign: btcSchnorrReveal: signed');
        transaction.finalize();
        //console.log('sign: btcSchnorrReveal: finalised');
      }
    } catch (err:any) {
      console.log('Error signing: ', err)
    }
    //const tx = btc.Transaction.fromRaw(hex.decode(wrappedPsbt.tx), { allowUnknowInput: true, allowUnknowOutput: true });
		wrappedPsbt.signedPsbt = base64.encode(transaction.toPSBT())
		//console.log('b64: ', wrappedPsbt.signedPsbt)
    const ttttt = btc.Transaction.fromPSBT(transaction.toPSBT());
    wrappedPsbt.signedTransaction = hex.encode(ttttt.toBytes());
		//console.log('hex: ', wrappedPsbt.signedTransaction)
    return wrappedPsbt;
  }
  
  public async signAndBroadcast(wrappedPsbt:WrappedPSBT): Promise<WrappedPSBT> {
    wrappedPsbt = await this.sign(wrappedPsbt);
    const signedTx = wrappedPsbt.signedTransaction;
    console.log('signAndBroadcast: ', signedTx);
    wrappedPsbt.broadcastResult = await this.sendRawTransaction(signedTx)
    console.log('signAndBroadcast: wrappedPsbt: ', wrappedPsbt);
    return wrappedPsbt;
  }
  
  @Get("/:txid")
  public async fetchRawTransaction(txid:string): Promise<any> {
    return await fetchRawTx(txid, true);
  }

  @Get("/:txid/hex")
  public async fetchTransactionHex(txid:string): Promise<any> {
    return await fetchTransactionHex(txid);
  }

  //@Post("/sendrawtx")
  public async sendRawTransaction(hex:string): Promise<any> {
      try {
        const resp = await sendRawTx(hex);
        //console.log('sendRawTransaction 1: ', resp);
        return resp;
      } catch (err) {
        const resp =  await sendRawTxRpc(hex);
        //console.log('sendRawTransaction 2: ', resp);
        return resp;
      }
  }
}
 
@Route("/bridge-api/:network/v1/btc/wallet")
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
      //console.log('fetchUtxoSet1:', result)
      const utxos = await fetchUTXOs(address);
      //console.log('fetchUtxoSet2:', utxos)
      for (let utxo of utxos) {
        const tx = await fetchRawTx(utxo.txid, verbose);
        //console.log('fetchUtxoSet3:', tx)
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
@Route("/bridge-api/:network/v1/btc/blocks")
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