import {Get,Post,Route,Body,Query,Header,Path,SuccessResponse,Controller as Router } from "tsoa"
import { fetchAllowanceContractCallers, fetchDelegationInfo, fetchPoxInfo, getNumRewardSetPoxAddresses, getTotalPoxRejection, isPoxActive, rewardCycleToBurnHeight, getRewardSetSize, getTotalUstxStacked, getStackingMinimum } from './utils/StacksSignersApi.js'
import { getConfig } from '../../lib/config.js';
import type { PoxCycleInfo } from 'sbtc-bridge-lib'
import type { AddressObject, SbtcContractDataI } from 'sbtc-bridge-lib';
import { deserializeCV, cvToJSON } from 'micro-stacks/clarity';
import { getBlockCount, validateAddress } from './utils/BitcoinRpc.js'
import { fetchDataVar, fetchNoArgsReadOnly, fetchUserSbtcBalance, fetchUserBalances, fetchSbtcWalletAddress } from './utils/StacksApi.js';

@Route("/signer-api/{network}/v1/signers")

export class SignersController extends Router {
  
  @Get("/fetch-delegation-info/{stxAddress}")
  public async getDelegationInfo(stxAddress:string): Promise<any> {
    const result = await fetchDelegationInfo(stxAddress);
    return result;
  }

  @Get("/fetch-contract-data")
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
    return sbtcContractData;
  }

  public async getAllowanceContractCallers(stxAddress:string): Promise<any> {
    const result = await fetchAllowanceContractCallers(stxAddress);
    return result;
  }

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

  //@Get("/address/:address/balance")
  public async fetchUserSbtcBalance(address:string): Promise<{ balance: number }> {
    return await fetchUserSbtcBalance(address);
  }

  public async fetchUserBalances(stxAddress:string, cardinal:string, ordinal:string): Promise<AddressObject> {
    return await fetchUserBalances(stxAddress, cardinal, ordinal);
  }

  //@Get("/wallet-address")
  public async fetchSbtcWalletAddress(): Promise<any> {
    return await fetchSbtcWalletAddress();
  }

}
