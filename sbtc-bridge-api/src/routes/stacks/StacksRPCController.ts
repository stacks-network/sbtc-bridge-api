import { Get, Route } from "tsoa";
import { fetchDataVar, fetchNoArgsReadOnly, fetchUserSbtcBalance, fetchUserBalances, fetchSbtcWalletAddress } from './stacks_helper.js';
import { scanCommitments, savePeginCommit, scanBridgeTransactions, scanPeginRRTransactions } from '../../lib/bitcoin/rpc_commit.js';
import { getBlockCount } from "../../lib/bitcoin/rpc_blockchain.js";
import { updateBridgeTransaction, findBridgeTransactionById, findBridgeTransactionsByFilter } from '../../lib/data/db_models.js';
import { type BridgeTransactionType, type SbtcContractDataType, type AddressObject, buildDepositPayloadOpDrop, PayloadType, parseDepositPayload, parseWithdrawPayload, parsePayloadFromTransaction, buildWithdrawPayloadOpDrop, buildDepositPayload, buildWithdrawPayload } from 'sbtc-bridge-lib';
import { getConfig } from '../../lib/config.js';
import { BlocksController, TransactionController, WalletController } from "../bitcoin/BitcoinRPCController.js";
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { fetchTransactionHex } from "../../lib/bitcoin/api_mempool.js";
import { cvToJSON, deserializeCV } from "@stacks/transactions";

export interface BalanceI {
  balance: number;
}
let cachedUIObject:any;

@Route("/bridge-api/:network/v1/sbtc")
export class DepositsController {
  
  /**
   * Builds the sBTC deposit data for the op_return variant of the protocol.
   * Returns the hex encoded data as a string.
   * @stxAddress: address or contract principal that is the destination of the deposit 
   * For complete definition @see https://github.com/stacks-network/sbtc/blob/main/sbtc-core/src/operations/op_return/deposit.rs
   */
  @Get("/build/deposit/:stxAddress")
  public commitDepositData(stxAddress:string): string {
    const data = buildDepositPayload(getConfig().network, stxAddress);
		return data;
  }
  
  /**
   * Builds the sBTC deposit data for the op_drop variant of the protocol.
   * Returns the hex encoded data as a string.
   * @stxAddress: address or contract principal that is the destination of the deposit 
   * @revealFee: the fee needed to cover the reveal transaction that the stackers need to spend this deposit 
   * For complete definition @see https://github.com/stacks-network/sbtc/blob/main/sbtc-core/src/operations/op_return/deposit.rs
   */
  @Get("/build/deposit/op_drop/:stxAddress/:revealFee")
  public commitDepositDataOpDrop(stxAddress:string, revealFee:number): string {
    const data = buildDepositPayloadOpDrop(getConfig().network, stxAddress, revealFee);
		return data;
  }
  
  /**
   * Parses the sBTC withdraw request data.
   * Returns the hex encoded data as a string.
   * @data: the encoded deposit data 
   * For complete definition @see https://github.com/stacks-network/sbtc/blob/main/sbtc-core/src/operations/op_return/deposit.rs
   */
  @Get("/parse/deposit/:data")
  public commitDeposit(data:string): PayloadType {
    const payload = parseDepositPayload(hex.decode(data));
		return payload;
  }
  
  /**
   * Builds the sBTC withdraw request data for the op_return variant of the protocol.
   * Returns the hex encoded data as a string.
   * @signature: the users signature that proves they control the owning address  
   * @amount: the amount of sBTC to withdraw 
   * For complete definition @see https://github.com/stacks-network/sbtc/blob/main/sbtc-core/src/operations/op_return/withdrawal_request.rs
   */
  @Get("/build/withdrawal/:signature/:amount")
  public commitWithdrawalData(signature:string, amount:number): string {
    const data = buildWithdrawPayload(getConfig().network, amount, signature);
		return data
  }
  
  /**
   * Builds the sBTC withdraw request data for the op_drop variant of the protocol.
   * Returns the hex encoded data as a string.
   * @signature: the users signature that proves they control the owning address  
   * @amount: the amount of sBTC to withdraw 
   * For complete definition @see https://github.com/stacks-network/sbtc/blob/main/sbtc-core/src/operations/op_return/withdrawal_request.rs
   */
  @Get("/build/withdrawal/op_drop/:signature/:amount")
  public commitWithdrawalDataOpDrop(signature:string, amount:number): string {
    const data = buildWithdrawPayloadOpDrop(getConfig().network, amount, signature);
		return data
  }
  
  /**
   * Parses the sBTC withdraw request data.
   * Returns the hex encoded data as a string.
   * @data: the encoded deposit data 
   * @sbtcWallet: the current sbtc wallets taproot address 
   * For complete definition @see https://github.com/stacks-network/sbtc/blob/main/sbtc-core/src/operations/op_return/withdrawal_request.rs
   */
  @Get("/parse/withdrawal/:data/:sbtcWallet")
  public commitWithdrawal(data:string, sbtcWallet:string): PayloadType {
    const payload = parseWithdrawPayload(getConfig().network, data, sbtcWallet, 'vrs');
		return payload;
  }
  

  @Get("/parse/tx/:txid")
  public async parseTransaction(txid:string): Promise<PayloadType> {
    const txHex = await fetchTransactionHex(txid);
    return loc_parsePayloadFromTransaction(getConfig().network, txHex);
  }
  
  

  public async findPeginRequests(): Promise<any> {
    const result = await findBridgeTransactionsByFilter({ status: {$gt: -1}});
    return result;
  }

  public async findPeginRequestsByStacksAddress(stacksAddress:string): Promise<any> {
    const result = await findBridgeTransactionsByFilter({ 'payloadData.stacksAddress': stacksAddress });
    return result;
  }

  public async findBridgeTransactionById(_id:string): Promise<any> {
    const result = await findBridgeTransactionById(_id);
    return result;
  }

  public async savePeginCommit(peginRequest:BridgeTransactionType): Promise<any> {
    const result = await savePeginCommit(peginRequest);
    return result;
  }

  public async updatePeginCommit(peginRequest:BridgeTransactionType): Promise<any> {
    const p = await findBridgeTransactionById(peginRequest._id);
    if (p && p.status === 1) {
      const up = {
        amount: peginRequest.uiPayload.amountSats
      }
      const newP = await updateBridgeTransaction(peginRequest, up);
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
    return await scanBridgeTransactions();
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

  public async initUiCache(): Promise<any> {
    try {
      console.log('Adding [keys, sbtcContractData, btcFeeRates] data to cache')
      const sbtcContractData = await this.fetchSbtcContractData();
      const controller2 = new TransactionController();
      const keys = await controller2.getKeys();
      const rates = await controller2.getRates();
      const controller = new BlocksController();
      const btcFeeRates = await controller.getFeeEstimate();

      cachedUIObject = {
        keys,
        sbtcContractData,
        btcFeeRates,
        rates
      }
    } catch (error) {
      console.log('Error in route initUiCache: ', error)
    }
    return cachedUIObject;
  }

  @Get("/init-ui")
  public async initUi(): Promise<any> {
    if (!cachedUIObject) await this.initUiCache()
    return cachedUIObject;
  }

  @Get("/address/:address/balance")
  public async fetchUserSbtcBalance(address:string): Promise<BalanceI> {
    return await fetchUserSbtcBalance(address);
  }

  @Get("/address/balances/:stxAddress/:cardinal/:ordinal")
  public async fetchUserBalances(stxAddress:string, cardinal:string, ordinal:string): Promise<AddressObject> {
    return await fetchUserBalances(stxAddress, cardinal, ordinal);
  }

  @Get("/data")
  public async fetchSbtcContractData(): Promise<SbtcContractDataType> {
    let sbtcContractData:SbtcContractDataType = {} as SbtcContractDataType;
    try {
      sbtcContractData = await fetchNoArgsReadOnly();
    } catch (err:any) {
      sbtcContractData = {} as SbtcContractDataType;
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

function loc_parsePayloadFromTransaction(network:string, txHex:string):PayloadType {
  let payload:PayloadType = parsePayloadFromTransaction(network, txHex);
  //console.log('parsePayloadFromTransaction: payload: ' + payload);
  return payload;
}
