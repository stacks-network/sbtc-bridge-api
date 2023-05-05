import { Get, Route } from "tsoa";
import { indexSbtcEvent, findSbtcEvents, fetchNoArgsReadOnly, saveSbtcEvents, saveAllSbtcEvents, fetchUserSbtcBalance, fetchSbtcWalletAddress } from '../lib/sbtc_rpc.js';
import { savePeginCommit, scanPeginCommitTransactions } from '../lib/bitcoin/rpc_commit.js';
import { getBlockCount } from "../lib/bitcoin/rpc_blockchain.js";
import { validateAddress } from "../lib/bitcoin/rpc_wallet.js";
import type { PeginRequestI } from '../types/pegin_request.js';
import type { SbtcContractDataI } from '../types/sbtc_contract_data.js';
import { findPeginRequestById, findPeginRequestsByFilter } from '../lib/data/db_models.js';

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/sbtc/pegins")
export class PaymentsController {
  
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

  @Get("/scan")
  public async scanPeginRequests(): Promise<any> {
    return await scanPeginCommitTransactions();
  }
}


@Route("/bridge-api/:network/v1/sbtc")
export class SbtcWalletController {
  @Get("/events/save")
  public async saveAllSbtcEvents(): Promise<any> {
    return await saveAllSbtcEvents();
  }

  @Get("/events/index/stacks/:txid")
  public async indexSbtcEvent(txid:string): Promise<any> {
    return await indexSbtcEvent(txid);
  }

  @Get("/events/save/:page")
  public async saveSbtcEvents(page:number): Promise<any> {
    return await saveSbtcEvents(page);
  }

  @Get("/events/:page")
  public async findSbtcEvents(page:number): Promise<any> {
    return await findSbtcEvents(page);
  }

  @Get("/address/:address/balance")
  public async fetchUserSbtcBalance(address:string): Promise<BalanceI> {
    return await fetchUserSbtcBalance(address);
  }

  @Get("/data")
  public async fetchSbtcContractData(): Promise<SbtcContractDataI> {
    const sbtcContractData:SbtcContractDataI = await fetchNoArgsReadOnly();
    sbtcContractData.addressValidation = await validateAddress(sbtcContractData.sbtcWalletAddress);
    const bc = await getBlockCount();
    sbtcContractData.burnHeight = bc.count;
    return sbtcContractData;
  }

  @Get("/wallet-address")
  public async fetchSbtcWalletAddress(): Promise<any> {
    return await fetchSbtcWalletAddress();
  }
}