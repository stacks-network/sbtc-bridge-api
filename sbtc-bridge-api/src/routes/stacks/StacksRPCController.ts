import { Get, Route } from "tsoa";
import { fetchDataVar, fetchNoArgsReadOnly, fetchUserSbtcBalance, fetchUserBalances, fetchSbtcWalletAddress } from './stacks_helper.js';
import { scanCommitments, savePeginCommit, scanBridgeTransactions, scanPeginRRTransactions } from '../../lib/bitcoin/rpc_commit.js';
import { getBlockCount } from "../../lib/bitcoin/rpc_blockchain.js";
import { updateBridgeTransaction, findBridgeTransactionById, findBridgeTransactionsByFilter } from '../../lib/data/db_models.js';
import { type BridgeTransactionType, type SbtcContractDataType, type AddressObject, buildDepositPayloadOpDrop, PayloadType, parseDepositPayload, parseWithdrawPayload, parsePayloadFromTransaction, buildWithdrawPayloadOpDrop } from 'sbtc-bridge-lib';
import { getConfig } from '../../lib/config.js';
import { deserializeCV, cvToJSON } from "micro-stacks/clarity";
import { TransactionController } from "../bitcoin/BitcoinRPCController.js";
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { fetchTransactionHex } from "../../lib/bitcoin/api_mempool.js";
import { getAddressFromOutScript, parsePayloadFromOutput } from "sbtc-bridge-lib";

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/sbtc")
export class DepositsController {
  
  @Get("/build/deposit/:stxAddress/:revealFee")
  public commitDepositData(stxAddress:string, revealFee:number): string {
    const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    const data = buildDepositPayloadOpDrop(getConfig().network, stxAddress, revealFee);
		return data;
  }
  
  @Get("/parse/deposit/:data")
  public commitDeposit(data:string): PayloadType {
    const payload = parseDepositPayload(hex.decode(data));
		return payload;
  }
  
  @Get("/build/withdrawal/:signature/:amount")
  public commitWithdrawalData(signature:string, amount:number): string {
    const data = buildWithdrawPayloadOpDrop(getConfig().network, amount, signature);
		return data
  }
  
  @Get("/parse/withdrawal/:data/:sbtcWallet")
  public commitWithdrawal(data:string, sbtcWallet:string): PayloadType {
    const payload = parseWithdrawPayload(getConfig().network, data, sbtcWallet, 'vrs');
		return payload;
  }
  

  @Get("/parse/tx/:txid")
  public async parseTransaction(txid:string): Promise<PayloadType> {
    const txHex = await fetchTransactionHex(txid);
    return loc_parsePayloadFromTransaction(getConfig().network, txHex);
  }
  
  

  public async findPeginRequests(): Promise<any> {
    const result = await findBridgeTransactionsByFilter({ status: {$gt: -1}});
    return result;
  }

  public async findPeginRequestsByStacksAddress(stacksAddress:string): Promise<any> {
    const result = await findBridgeTransactionsByFilter({ stacksAddress });
    return result;
  }

  public async findBridgeTransactionById(_id:string): Promise<any> {
    const result = await findBridgeTransactionById(_id);
    return result;
  }

  public async savePeginCommit(peginRequest:BridgeTransactionType): Promise<any> {
    const result = await savePeginCommit(peginRequest);
    return result;
  }

  public async updatePeginCommit(peginRequest:BridgeTransactionType): Promise<any> {
    const p = await findBridgeTransactionById(peginRequest._id);
    if (p && p.status === 1) {
      const up = {
        amount: peginRequest.uiPayload.amountSats
      }
      const newP = await updateBridgeTransaction(peginRequest, up);
      console.log('updatePeginCommit: ', newP);
      return newP;
    } else {
      console.log('updatePeginCommit: error: ', p);
      return { status: 404 };
    }
  }

  //@Get("/scan")
  public async scanPeginRequests(): Promise<any> {
    await scanPeginRRTransactions();
    return await scanBridgeTransactions();
  }

  //@Get("/commits/scan/:btcAddress/:stxAddress/:sbtcWalletAddress/:revealFee")
  public async scanCommitments(btcAddress:string,stxAddress:string, sbtcWalletAddress:string, revealFee:number): Promise<any> {
    const controller = new TransactionController();
    const commitment = await controller.commitment(stxAddress, Number(revealFee));

    return await scanCommitments(btcAddress, stxAddress, sbtcWalletAddress, revealFee, commitment);
  }
}


@Route("/bridge-api/:network/v1/sbtc")
export class SbtcWalletController {

  @Get("/address/:address/balance")
  public async fetchUserSbtcBalance(address:string): Promise<BalanceI> {
    return await fetchUserSbtcBalance(address);
  }

  @Get("/address/balances/:stxAddress/:cardinal/:ordinal")
  public async fetchUserBalances(stxAddress:string, cardinal:string, ordinal:string): Promise<AddressObject> {
    return await fetchUserBalances(stxAddress, cardinal, ordinal);
  }

  @Get("/data")
  public async fetchSbtcContractData(): Promise<SbtcContractDataType> {
    let sbtcContractData:SbtcContractDataType = {} as SbtcContractDataType;
    try {
      sbtcContractData = await fetchNoArgsReadOnly();
    } catch (err:any) {
      sbtcContractData = {} as SbtcContractDataType;
      console.log(err.message)
    }
    try {
      const contractId = getConfig().sbtcContractId;
      const contractOwner = await fetchDataVar(contractId.split('.')[0], contractId.split('.')[1], 'contract-owner');
      const result = cvToJSON(deserializeCV(contractOwner.data));
      console.log(result)
      sbtcContractData.contractOwner = result.value
    } catch (err:any) {
      console.log(err.message)
    }
    try {
      const bc = await getBlockCount();
      sbtcContractData.burnHeight = bc.count;
    } catch (err:any) {
      console.log(err.message)
      sbtcContractData.burnHeight = -1;
    }
    //console.log('sbtcContractData: ', sbtcContractData)
    return sbtcContractData;
  }

  @Get("/wallet-address")
  public async fetchSbtcWalletAddress(): Promise<any> {
    return await fetchSbtcWalletAddress();
  }
}



function loc_parsePayloadFromTransaction(network:string, txHex:string):PayloadType {
  const tx:btc.Transaction = btc.Transaction.fromRaw(hex.decode(txHex), {allowUnknowInput:true, allowUnknowOutput: true, allowUnknownOutputs: true, allowUnknownInputs: true})
  const out0 = tx.getOutput(0);
  const script0 = out0.script!
  const spendScr = btc.OutScript.decode(script0);
  let payload = {} as PayloadType;
  if (spendScr.type === 'unknown') {
    const scriptPubKey = tx.getOutput(1).script
    payload = parsePayloadFromOutput(network, out0, hex.encode(scriptPubKey!));
    payload.sbtcWallet = getAddressFromOutScript('testnet', tx.getOutput(1).script!)
    //payload.dust = Number(tx.getOutput(1).amount)
  }
  console.log('parsePayloadFromTransaction: payload: ' + payload);
  return payload;
}
