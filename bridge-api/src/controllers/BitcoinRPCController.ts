import { Get, Route } from "tsoa";
import { fetchUtxoSet, fetchCurrentFeeRates } from '../lib/bitcoin/gateway';

export interface FeeEstimateResponse {
    feeInfo: {
        low_fee_per_kb:number, 
        medium_fee_per_kb:number, 
        high_fee_per_kb:number
    };
}
  
@Route("/bridge-api/v1/btc-fee-estimate")
export class FeeEstimationController {
    @Get("/")
    public async getFeeEstimate(): Promise<FeeEstimateResponse> {
      return await fetchCurrentFeeRates();
    }
}

@Route("/bridge-api/v1/btc/address/:address/utxos")
export class UTXOController {
    @Get("/")
    public async fetchUtxoSet(address:string): Promise<any> {
      return await fetchUtxoSet(address);
    }
}

export class DefaultController {
    public getFeeEstimate(): string {
      return "Welcome to SBTC Bridge API...";
    }
}