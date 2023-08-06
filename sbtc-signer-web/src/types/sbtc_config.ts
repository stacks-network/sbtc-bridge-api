import type { AddressObject, PoxCycleInfo, BlockchainInfo, SbtcContractDataI } from 'sbtc-bridge-lib';

export type SbtcConfig = {
  sbtcWalletAddressInfo?: any;
  loggedIn: boolean;
  userSettings:SbtcUserSettingI;
  sbtcContractData: SbtcContractDataI;
  bcInfo?: BlockchainInfo;
  poxCycleInfo?: PoxCycleInfo;
  addressObject: AddressObject;
};

export type SbtcUserSettingI = {
  debugMode: boolean;
}