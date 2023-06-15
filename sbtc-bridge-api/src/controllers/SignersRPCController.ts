import { Route } from "tsoa";
import { fetchPoxInfo } from '../lib/signers_rpc.js'
export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/signers/pox-info")
export class SignersController {
  
  public async fetchPoxInfo(): Promise<any> {
    const result = await fetchPoxInfo();
    return result;
  }

}