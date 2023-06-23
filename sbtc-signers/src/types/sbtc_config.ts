import type { PegInTransactionI } from "$lib/domain/PegInTransaction";
import type { PegOutTransactionI } from "$lib/domain/PegOutTransaction";
import type { BlockchainInfo, PeginRequestI, SbtcContractDataI, AddressObject, KeySet } from 'sbtc-bridge-lib' 

export type SbtcConfig = {
  sbtcWalletAddressInfo?: any;
  pegInMongoId?: string;
  pegOutMongoId?: string;
  btcFeeRates?: any;
  loggedIn: boolean;
  pegInTransaction?:PegInTransactionI;
  pegOutTransaction?:PegOutTransactionI;
  addressObject?: AddressObject;
  stxAddress?: string;
  sigData:any;
  pegIn:boolean;
  peginRequest?:PeginRequestI;
  userSettings:SbtcUserSettingI;
  sbtcContractData: SbtcContractDataI;
  bcInfo: BlockchainInfo|undefined;
  keys: KeySet;
  innerWidth:number;
};

export type SbtcUserSettingI = {
  useOpDrop: boolean;
  debugMode: boolean;
  testAddresses: boolean;
}