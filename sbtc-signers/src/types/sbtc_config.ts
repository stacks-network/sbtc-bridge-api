import type { PoxCycleInfo, BlockchainInfo, SbtcContractDataI } from 'sbtc-bridge-lib';

export type SbtcConfig = {
  sbtcWalletAddressInfo?: any;
  loggedIn: boolean;
  userSettings:SbtcUserSettingI;
  sbtcContractData: SbtcContractDataI;
  bcInfo?: BlockchainInfo;
  poxCycleInfo?: PoxCycleInfo;
};

export type SbtcUserSettingI = {
  debugMode: boolean;
}