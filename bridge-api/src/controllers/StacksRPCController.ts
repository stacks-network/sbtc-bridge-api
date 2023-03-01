import { Get, Route } from "tsoa";
import { fetchNoArgsReadOnly, fetchSbtcEvents, fetchUserSbtcBalance, fetchSbtcWalletAddress } from '../lib/sbtc_rpc';

export interface BalanceI {
  balance: number;
}
export interface SbtcContractDataI {
  coordinator: { addr:string, key:string };
  bitcoinWalletAddress: string;
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
  @Get("/events")
  public async fetchSbtcEvents(): Promise<any> {
    return await fetchSbtcEvents();
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