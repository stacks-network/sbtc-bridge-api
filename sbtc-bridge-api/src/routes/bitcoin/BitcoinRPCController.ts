import { Post, Get, Route } from "tsoa";
import { fetchRawTx, sendRawTxRpc } from '../../lib/bitcoin/rpc_transaction.js';
import { generateNewAddress, createWallet, validateAddress, walletProcessPsbt, getAddressInfo, estimateSmartFee, loadWallet, unloadWallet, listWallets, importAddress } from "../../lib/bitcoin/rpc_wallet.js";
import { getBlockHeader, getBlockChainInfo, getBlockCount, getBlock, getTxOutProof } from "../../lib/bitcoin/rpc_blockchain.js";
import { fetchUTXOs, sendRawTxDirectMempool, fetchAddressTransactions } from "../../lib/bitcoin/api_mempool.js";
import { sendRawTxDirectBlockCypher, fetchCurrentFeeRates as fetchCurrentFeeRatesCypher } from "../../lib/bitcoin/api_blockcypher.js";
import { findBridgeTransactionById } from "../../lib/data/db_models.js";
import { getConfig } from '../../lib/config.js';
import { fetchTransactionHex } from '../../lib/bitcoin/api_mempool.js';
import { schnorr } from '@noble/curves/secp256k1';
import { hex, base64 } from '@scure/base';
import type { Transaction } from '@scure/btc-signer'
import type { KeySet, WrappedPSBT, BridgeTransactionType, CommitmentScriptDataType } from 'sbtc-bridge-lib'
import * as btc from '@scure/btc-signer';
import { toStorable, getStacksAddressFromSignature, buildDepositPayloadOpDrop, getPegWalletAddressFromPublicKey } from 'sbtc-bridge-lib' 
import { verifyMessageSignatureRsv } from '@stacks/encryption';
import { hashMessage } from '@stacks/encryption';
import { updateBridgeTransaction } from '../../lib/data/db_models.js';
import { getExchangeRates } from '../../lib/data/db_models.js'


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

//export const BASE_URL = `http://${getConfig().btcRpcUser}:${getConfig().btcRpcPwd}@${getConfig().btcNode.substring(7)}${getConfig().walletPath}`;
export const BASE_URL = `http://${getConfig().btcRpcUser}:${getConfig().btcRpcPwd}@${getConfig().btcNode}${getConfig().walletPath}`;

export const OPTIONS = {
  method: "POST",
  headers: { 'content-type': 'text/plain' },
  body: '' 
};
@Route("/bridge-api/:network/v1/btc/tx")
export class TransactionController {

  //@Get("/keys")
  public getKeys(): KeySet {
    return {
      deposits: {
        revealPubKey: hex.encode(schnorr.getPublicKey(process.env.btcSchnorrReveal)),
        reclaimPubKey: hex.encode(schnorr.getPublicKey(process.env.btcSchnorrReclaim)),
        oraclePubKey: '' 
      }
    }
  }
    
  //@Get("/rates")
  public async getRates() {
    const rates = await getExchangeRates();
    return rates;
  }

  public async sign(wrappedPsbt:WrappedPSBT): Promise<WrappedPSBT> {
    if (!wrappedPsbt?.stxSignature || !wrappedPsbt?.stxSignature.message) {
      wrappedPsbt.broadcastResult = { failed: true, reason: 'No signature data found.' }
      return wrappedPsbt;
    }
    const verified = verifyMessageSignatureRsv({
      message:wrappedPsbt.stxSignature.message, 
      publicKey: wrappedPsbt.stxSignature.publicKey,
      signature: wrappedPsbt.stxSignature.signature 
    });
    if (!verified) {
      wrappedPsbt.broadcastResult = { failed: true, reason: 'Invalid signature.' }
      return wrappedPsbt;
    }
    const msgHash = hashMessage(wrappedPsbt.stxSignature.message);
    const stxAddresses = await getStacksAddressFromSignature(msgHash, wrappedPsbt.stxSignature.signature);
    const stacksAddress = (getConfig().network === 'testnet') ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
  
    console.log('sign: ', wrappedPsbt);
    console.log('sign: stxAddresses: ', stxAddresses);
    const pegin:BridgeTransactionType = await findBridgeTransactionById(wrappedPsbt.depositId);
  
    if (pegin.originator !== stacksAddress) {
      wrappedPsbt.broadcastResult = { failed: true, reason: 'Stgacks address of signer is different to the deposit originator: ' + pegin.originator + ' p2pkh address recovered: ' + stacksAddress };
      return wrappedPsbt;
    }
  
    const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
  
    const transaction:Transaction = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
    const script = toStorable(pegin.commitTxScript)
    
    console.log('sign: btcTxid: ', pegin.btcTxid);
  
    if (pegin.status !== 2 || !pegin.btcTxid || !script)  {
      wrappedPsbt.broadcastResult = { failed: true, reason: 'Incorrect status to be revealed / reclaimed' }
      return wrappedPsbt;
    }
    if (!pegin.commitTxScript || !pegin.commitTxScript.address || !script.tapMerkleRoot || !script.tapInternalKey)  {
      wrappedPsbt.broadcastResult = { failed: true, reason: 'Incorrect data passed' }
      return wrappedPsbt;
    }

    const sbtcWalletAddress = getPegWalletAddressFromPublicKey(getConfig().network, pegin.uiPayload.sbtcWalletPublicKey);
  
    const sbtcWalletAddrScript = btc.Address(net).decode(sbtcWalletAddress)
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
  
    let outAddr = sbtcWalletAddress;
    if (wrappedPsbt.txtype === 'reclaim') outAddr = commitTx.vin[0]?.prevout?.scriptpubkey_address
  
    const fee = 4000 //transaction.fee;
    //console.log('sign: fee: ', fee);
    if (!pegin.vout) throw new Error('no vout??')
    const amount = pegin.vout.value - fee;
    console.log('pegin.vout.value: ', pegin.vout.value);
    console.log('fee: ', fee);
    console.log('wrappedPsbt.txtype: ', wrappedPsbt.txtype);
    /**
    if (this.addressInfo.utxos.length === -1) { // never
      const feeUtxo = this.addInputForFee(tx);
      amount = pegin.amount + feeUtxo?.value - this.fee;
    }
    */
    
    transaction.addOutputAddress(pegin.uiPayload.bitcoinAddress, BigInt(amount), net);
  
    try {
      if (wrappedPsbt.txtype === 'reclaim') {
        transaction.sign(hex.decode(process.env.btcSchnorrReclaim));
      } else if (wrappedPsbt.txtype === 'reveal') {
        transaction.sign(hex.decode(process.env.btcSchnorrReveal));
      }
      console.log('sign: signed');
      transaction.finalize();
    } catch (err:any) {
      console.log('Error signing: ', err)
      wrappedPsbt.broadcastResult = { failed: true, reason: err.message }
      return wrappedPsbt;      
    }
    //const tx = btc.Transaction.fromRaw(hex.decode(wrappedPsbt.tx), { allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
    wrappedPsbt.signedPsbt = base64.encode(transaction.toPSBT())
    //console.log('b64: ', wrappedPsbt.signedPsbt)
    const ttttt = btc.Transaction.fromPSBT(transaction.toPSBT());
    wrappedPsbt.signedTransaction = hex.encode(ttttt.extract());
    //console.log('hex: ', wrappedPsbt.signedTransaction)
    return wrappedPsbt;
  }
  
  public async signAndBroadcast(wrappedPsbt:WrappedPSBT): Promise<WrappedPSBT> {
    wrappedPsbt = await this.sign(wrappedPsbt);
    if (wrappedPsbt.broadcastResult && wrappedPsbt.broadcastResult.failed) {
      return wrappedPsbt;
    }
    const signedTx = wrappedPsbt.signedTransaction;
    try {
      const result = await this.sendRawTransaction(signedTx, 0);
      console.log(result)
      wrappedPsbt.broadcastResult = result;
      const pegin:BridgeTransactionType = await findBridgeTransactionById(wrappedPsbt.depositId);
      let upd = undefined;
      if (wrappedPsbt.txtype === 'reclaim') {
        if (wrappedPsbt.broadcastResult.tx) {
          upd = {
            status: 3,
            reclaim: {
              btcTxid: wrappedPsbt.broadcastResult.tx.txid,
              //vout: vout
            }
          }
        }
      } else {
        if (wrappedPsbt.broadcastResult.tx) {
          upd = {
            status: 4,
            reveal: {
              btcTxid: wrappedPsbt.broadcastResult.tx.txid,
              //vout: vout
            }
          }
        }
      }
      if (upd) await updateBridgeTransaction(pegin, upd);

    } catch (err:any) {
      wrappedPsbt.broadcastResult = { failed: true, reason: 'Error broadcasting - ' + err.message }
      console.log('signAndBroadcast: ', err)
    }
    console.log('signAndBroadcast: wrappedPsbt: ', wrappedPsbt);
    return wrappedPsbt;
  }
  
  //@Get("/commitment/:stxAddress/:revealFee")
  public async commitment(stxAddress:string, revealFee:number): Promise<CommitmentScriptDataType> {
    const keys = this.getKeys();
		console.log('reclaimAddr.pubkey: ' + keys.deposits.reclaimPubKey)
		console.log('revealAddr.pubkey: ' + keys.deposits.revealPubKey)
    const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    const data = buildDepositPayloadOpDrop(getConfig().network, stxAddress, revealFee);
		const scripts =  [
			{ script: btc.Script.encode([hex.decode(data), 'DROP', hex.decode(keys.deposits.revealPubKey), 'CHECKSIG']) },
			{ script: btc.Script.encode([hex.decode(keys.deposits.reclaimPubKey), 'CHECKSIG']) }
		]
		const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
		return toStorable(script)
  }
  
  //@Get("/:txid")
  public async fetchRawTransaction(txid:string): Promise<any> {
    return await fetchRawTx(txid, true);
  } 

  //@Get("/:txid/hex")
  public async fetchTransactionHex(txid:string): Promise<any> {
    return await fetchTransactionHex(txid);
  }

  //@Post("/sendrawtx")
  public async sendRawTransaction(hex:string, maxFeeRate:number): Promise<any> {
      try {
        const resp =  await sendRawTxRpc(hex, maxFeeRate);
        if (resp && resp.error && resp.error.code) {
          console.log('sendRawTransaction:sendRawTxRpc: ', resp)
          throw new Error('Local rpc call failed.. try external service')
        }
        console.log('sendRawTransaction 1: bitcoin core:', resp);
        return resp;
      } catch (err) {
        try {
          console.log('sendRawTransaction 2: trying mempool: ');
          const resp = await sendRawTxDirectMempool(hex);
          console.log('sendRawTransaction 2: sendRawTxDirectMempool: ', resp);
          return resp;
        } catch (err) {
          console.log('sendRawTransaction 2: trying block cypher: ');
          const resp = await sendRawTxDirectBlockCypher(hex);
          console.log('sendRawTransaction 3: sendRawTxDirectBlockCypher: ', resp);
          return resp;
        }
      }
  }
}
 
@Route("/bridge-api/:network/v1/btc/wallet")
export class WalletController {
  
  public async validateAddress(address:string): Promise<any> {
    //checkAddressForNetwork(getConfig().network, address)
    const result = await validateAddress(address);
    return result;
  }

  //@Post("/walletprocesspsbt")
  public async processPsbt(psbtHex:string): Promise<any> {
    const result = await walletProcessPsbt(psbtHex);
    return result;
  }

  //@Get("/wallet/create/:wallet")
  public async createWallet(wallet:string): Promise<any> {
    //checkAddressForNetwork(getConfig().network, address)
    const result = await createWallet(wallet);
    return result;
  }

  //@Get("/address/:address/txs")
  public async fetchAddressTransactions(address:string): Promise<any> {
    //checkAddressForNetwork(getConfig().network, address)
    const result = await fetchAddressTransactions(address);
    return result;
  }

  //@Get("/address/:address/utxos?verbose=true")
  public async fetchUtxoSet(address:string, verbose:boolean): Promise<any> {
    let result:any = {};
    //checkAddressForNetwork(getConfig().network, address);
      if (address) {
        try {
          if (getConfig().network === 'simnet') {
            console.log('importing address')
            await importAddress(address)
          }
          result = await getAddressInfo(address);
          const addressValidation = await validateAddress(address);
          result.addressValidation = addressValidation
        } catch (err:any) {
          console.log('fetchUtxoSet: addressValidation: ' + address + ' : ' + err.message)
          // carry on
        }
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
      console.log('fetchUtxoSet: fetchUTXOs: ' + address + ' : ' + err.message)
      // carry on
    }
    return result;
  }
  //@Get("/getnewaddress/:addressType")
  public async generateNewAddress(addressType:string): Promise<any> {
    //const wallets = await loadWallet("TBTC-0001");
    await generateNewAddress(addressType);
    const result = await loadWallet(addressType);
    return result;
  }
  //@Get("/loadwallet/:name")
  public async loadWallet(name:string): Promise<any> {
    const wallets = await listWallets();
    for (const wallet in wallets) {
      try {
        //await unloadWallet(wallet);
        console.log('wallet: unloaded: ' + wallet)
      } catch(err:any) {
        console.error('wallet: ' + name + ' : ' + err.message)
      }
    }
    const result = await loadWallet(name);
    console.error('wallet: loaded: ' + name)
    return result;
  }
  //@Get("/listwallets")
  public async listWallets(): Promise<any> {
    const result = await listWallets();
    return result;
  }
}
@Route("/bridge-api/:network/v1/btc/blocks")
export class BlocksController {

  //@Get("/fee-estimate")
  public async getFeeEstimate(): Promise<FeeEstimateResponse> {
    try {
      return fetchCurrentFeeRatesCypher();
    } catch(err) {
      return estimateSmartFee();
    }
  }
  
  //@Get("/info")
    public async getInfo(): Promise<any> {
      return getBlockChainInfo();
  }
  @Get("/gettxoutproof/:txs/:blockhash")
  public async getTxOutProof(txs:string, blockhash:string): Promise<any> {
    return getTxOutProof(txs.split(','), blockhash);
  }

  @Get("/block/:blockhash/:verbosity")
  public async getBlock(blockhash:string, verbosity:number): Promise<any> {
    return getBlock(blockhash, verbosity);
  }

  @Get("/block-header/:blockhash/:verbosity")
  public async getHeader(blockhash:string, verbosity:boolean): Promise<any> {
    return getBlockHeader(blockhash, verbosity);
  }
  public async getCount(): Promise<any> {
    return getBlockCount();
  }
}

export class DefaultController {
    public getFeeEstimate(): string {
      return "Welcome to sBTC Bridge API...";
    }
}