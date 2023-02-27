import { Get, Route } from "tsoa";
import { fetchSbtcEvents, fetchUserSbtcBalance, fetchSbtcWalletAddress } from '../lib/sbtc_rpc';

@Route("/bridge-api/v1/sbtc")
export class SbtcWalletController {
  @Get("/events")
  public async fetchSbtcEvents(): Promise<any> {
    return await fetchSbtcEvents();
  }

  @Get("/address/:address/balance")
  public async fetchUserSbtcBalance(address:string): Promise<any> {
    return await fetchUserSbtcBalance(address);
  }

  @Get("/wallet-address")
  public async fetchSbtcWalletAddress(): Promise<any> {
    return await fetchSbtcWalletAddress();
  }
}