import { Route } from "tsoa";
import { fetchPoxInfo, getNumRewardSetPoxAddresses, getTotalPoxRejection, isPoxActive, rewardCycleToBurnHeight, getRewardSetSize, getTotalUstxStacked, getStackingMinimum } from '../lib/signers_rpc.js'
import { getConfig } from '../lib/config.js';
import type { PoxCycleInfo } from 'sbtc-bridge-lib'
export interface BalanceI {
  balance: number;
}

@Route("/signer-api/:network/v1/signers/pox-info")
export class SignersController {
  
  public async fetchWebDid(domain:string): Promise<any> {
    const path = 'https://' + domain + '/.well-known/did.json';
    const response = await fetch(path);
    const res = await response.json();
    console.log('fetchWebDid: ' + res)
    return res;
  }

  public async fetchPoxInfo(): Promise<any> {
    const contractId = getConfig().poxContractId;
    const result = await fetchPoxInfo(contractId);
    return result;
  }

  public async fetchPoxCycleInfo(rewardCycleId:number): Promise<PoxCycleInfo> {
    const contractId = getConfig().poxContractId;
    const numbPoxAddressInRewardSet = await getNumRewardSetPoxAddresses(contractId, rewardCycleId)
    const totalPoxRejection = await getTotalPoxRejection(contractId, rewardCycleId)
    const poxActive = await isPoxActive(contractId, rewardCycleId)
    const cycleToBurnHeight = await rewardCycleToBurnHeight(contractId, rewardCycleId)
    const rewardSetSize = await getRewardSetSize(contractId, rewardCycleId)
    const totalUstxStacked = await getTotalUstxStacked(contractId, rewardCycleId)
    const stackingMinimum = await getStackingMinimum(contractId)
    const cycleInfo = {
      numbPoxAddressInRewardSet,
      totalPoxRejection,
      poxActive,
      cycleToBurnHeight,
      rewardSetSize,
      totalUstxStacked,
      stackingMinimum
    }
    return cycleInfo;
  }

}
