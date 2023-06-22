import type { PeginRequestI, SbtcContractDataI, AddressObject, KeySet } from 'sbtc-bridge-lib' 
import type { BlockchainInfo } from 'sbtc-bridge-lib';

export type SbtcConfig = {
  sbtcWalletAddressInfo?: any;
  btcFeeRates?: any;
  loggedIn: boolean;
  addressObject?: AddressObject;
  stxAddress?: string;
  sigData:any;
  pegIn:boolean;
  peginRequest:PeginRequestI;
  userSettings:SbtcUserSettingI;
  sbtcContractData: SbtcContractDataI;
  bcInfo: BlockchainInfo|undefined;
  keys: KeySet;
};

export type SbtcUserSettingI = {
  useOpDrop: boolean;
  debugMode: boolean;
  testAddresses: boolean;
}