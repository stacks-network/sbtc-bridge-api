import { Get, Route } from "tsoa";
import { fetchDataVar, indexSbtcEvent, findSbtcEvents, fetchNoArgsReadOnly, saveSbtcEvents, saveAllSbtcEvents, fetchUserSbtcBalance, fetchUserBalances, fetchSbtcWalletAddress } from '../lib/sbtc_rpc.js';
import { savePeginCommit, scanPeginCommitTransactions, scanPeginRRTransactions } from '../lib/bitcoin/rpc_commit.js';
import { getBlockCount } from "../lib/bitcoin/rpc_blockchain.js";
import { validateAddress } from "../lib/bitcoin/rpc_wallet.js";
import { updatePeginRequest, findPeginRequestById, findPeginRequestsByFilter } from '../lib/data/db_models.js';
import type { PeginRequestI, SbtcContractDataI, AddressObject } from 'sbtc-bridge-lib';
import { getConfig } from '../lib/config.js';
import { deserializeCV, cvToJSON } from "micro-stacks/clarity";

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/sbtc/pegins")
export class DepositsController {
  
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

  @Get("/scan")
  public async scanPeginRequests(): Promise<any> {
    await scanPeginRRTransactions();
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

  public async fetchUserBalances(addresses:AddressObject): Promise<AddressObject> {
    return await fetchUserBalances(addresses);
  }

  @Get("/data")
  public async fetchSbtcContractData(): Promise<SbtcContractDataI> {
    const sbtcContractData:SbtcContractDataI = await fetchNoArgsReadOnly();
    try {
      sbtcContractData.addressValidation = await validateAddress(sbtcContractData.sbtcWalletAddress);
    } catch (err) {
      console.log(err)
    }
    try {
      const contractId = getConfig().sbtcContractId;
      const contractOwner = await fetchDataVar(contractId.split('.')[0], contractId.split('.')[1], 'contract-owner');
      const result = cvToJSON(deserializeCV(contractOwner.data));
      console.log(result)
      sbtcContractData.contractOwner = result.value
    } catch (err) {
      console.log(err)
    }
    try {
      const bc = await getBlockCount();
      sbtcContractData.burnHeight = bc.count;
    } catch (err) {
      console.log(err)
      sbtcContractData.burnHeight = -1;
    }
    console.log('sbtcContractData: ', sbtcContractData)
    return sbtcContractData;
  }

  @Get("/wallet-address")
  public async fetchSbtcWalletAddress(): Promise<any> {
    return await fetchSbtcWalletAddress();
  }
}