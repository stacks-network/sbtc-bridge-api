import { Get, Route } from "tsoa";
import { fetchDataVar, indexSbtcEvent, findSbtcEvents, fetchNoArgsReadOnly, saveSbtcEvents, saveAllSbtcEvents, fetchUserSbtcBalance, fetchUserBalances, fetchSbtcWalletAddress } from '../lib/sbtc_rpc.js';
import { scanCommitments, savePeginCommit, scanPeginCommitTransactions, scanPeginRRTransactions } from '../lib/bitcoin/rpc_commit.js';
import { getBlockCount } from "../lib/bitcoin/rpc_blockchain.js";
import { validateAddress } from "../lib/bitcoin/rpc_wallet.js";
import { updatePeginRequest, findPeginRequestById, findPeginRequestsByFilter } from '../lib/data/db_models.js';
import { type PeginRequestI, type SbtcContractDataI, type AddressObject, buildDepositPayload, depositPayloadType, parseDepositPayload, buildWithdrawalPayload, parseWithdrawalPayload, withdrawalPayloadType } from 'sbtc-bridge-lib';
import { getConfig } from '../lib/config.js';
import { deserializeCV, cvToJSON } from "micro-stacks/clarity";
import { TransactionController } from "../controllers/BitcoinRPCController.js";
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/sbtc")
export class DepositsController {
  
  @Get("/build/deposit/:stxAddress/:revealFee")
  public commitDepositData(stxAddress:string, revealFee:number): string {
    const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    const data = buildDepositPayload(net, revealFee, stxAddress, true, undefined);
		return hex.encode(data);
  }
  
  @Get("/parse/deposit/:data")
  public commitDeposit(data:string): depositPayloadType {
    const payload = parseDepositPayload(hex.decode(data), 0);
		return payload;
  }
  
  @Get("/build/withdrawal/:signature/:amount")
  public commitWithdrawalData(signature:string, amount:number): string {
    const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    const data = buildWithdrawalPayload(net, amount, hex.decode(signature), true);
		return hex.encode(data);
  }
  
  @Get("/parse/withdrawal/:data/:sbtcWallet")
  public commitWithdrawal(data:string, sbtcWallet:string): withdrawalPayloadType {
    const payload = parseWithdrawalPayload(getConfig().network, hex.decode(data), sbtcWallet);
		return payload;
  }
  

  public async findPeginRequests(): Promise<any> {
    const result = await findPeginRequestsByFilter({ status: {$gt: -1}});
    return result;
  }

  public async findPeginRequestsByStacksAddress(stacksAddress:string): Promise<any> {
    const result = await findPeginRequestsByFilter({ stacksAddress });
    return result;
  }

  public async findPeginRequestById(_id:string): Promise<any> {
    const result = await findPeginRequestById(_id);
    return result;
  }

  public async savePeginCommit(peginRequest:PeginRequestI): Promise<any> {
    const result = await savePeginCommit(peginRequest);
    return result;
  }

  public async updatePeginCommit(peginRequest:PeginRequestI): Promise<any> {
    const p = await findPeginRequestById(peginRequest._id);
    if (p && p.status === 1) {
      const up = {
        amount: peginRequest.amount
      }
      const newP = await updatePeginRequest(peginRequest, up);
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
    return await scanPeginCommitTransactions();
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

  /**
  //@Get("/events/save")
  public async saveAllSbtcEvents(): Promise<any> {
    return await saveAllSbtcEvents();
  }

  //@Get("/events/index/stacks/:txid")
  public async indexSbtcEvent(txid:string): Promise<any> {
    return await indexSbtcEvent(txid);
  }

  //@Get("/events/save/:page")
  public async saveSbtcEvents(page:number): Promise<any> {
    return await saveSbtcEvents(page);
  }

  //@Get("/events/:page")
  public async findSbtcEvents(page:number): Promise<any> {
    return await findSbtcEvents(page);
  }
   */

  @Get("/address/:address/balance")
  public async fetchUserSbtcBalance(address:string): Promise<BalanceI> {
    return await fetchUserSbtcBalance(address);
  }

  @Get("/address/balances/:stxAddress/:cardinal/:ordinal")
  public async fetchUserBalances(stxAddress:string, cardinal:string, ordinal:string): Promise<AddressObject> {
    return await fetchUserBalances(stxAddress, cardinal, ordinal);
  }

  @Get("/data")
  public async fetchSbtcContractData(): Promise<SbtcContractDataI> {
    let sbtcContractData:SbtcContractDataI = {} as SbtcContractDataI;
    try {
      sbtcContractData = await fetchNoArgsReadOnly();
    } catch (err:any) {
      sbtcContractData = {} as SbtcContractDataI;
      console.log(err.message)
    }
    try {
      sbtcContractData.addressValidation = await validateAddress(sbtcContractData.sbtcWalletAddress);
    } catch (err:any) {
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