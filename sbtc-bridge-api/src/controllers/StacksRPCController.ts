import { Get, Route } from "tsoa";
import { indexSbtcEvent, findSbtcEvents, fetchNoArgsReadOnly, saveSbtcEvents, saveAllSbtcEvents, fetchUserSbtcBalance, fetchSbtcWalletAddress } from '../lib/sbtc_rpc.js';

export interface BalanceI {
  balance: number;
}
export interface SbtcContractDataI {
  coordinator: { addr:string, key:string };
  sbtcWalletAddress: string;
  numKeys: number;
  numParties: number;
  tradingHalted: boolean;
  tokenUri: string;
  threshold: number;
  totalSupply: number;
  decimals: number;
  name: string;
}

@Route("/bridge-api/v1/sbtc")
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
    const sbtcContractData = await fetchNoArgsReadOnly();
    return sbtcContractData;
  }

  @Get("/wallet-address")
  public async fetchSbtcWalletAddress(): Promise<any> {
    return await fetchSbtcWalletAddress();
  }
}