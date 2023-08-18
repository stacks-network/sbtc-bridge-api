import type { SbtcMiniContractDataI, AddressObject, PoxCycleInfo, BlockchainInfo, ExchangeRate } from 'sbtc-bridge-lib';

export type SbtcConfig = {
  exchangeRates?: Array<ExchangeRate>;
  sbtcWalletAddressInfo?: any;
  loggedIn: boolean;
  userSettings:SbtcUserSettingI;
  sbtcContractData: SbtcMiniContractDataI;
  dashboard: DashboardInfoI;
  bcInfo?: BlockchainInfo;
  poxCycleInfo?: PoxCycleInfo;
  keySets: { [key: string]: AddressObject; };
};

export type SbtcUserSettingI = {
  debugMode: boolean;
  testAddresses: boolean;
  currency: {
    cryptoFirst: boolean;
    myFiatCurrency: ExchangeRate;
    denomination: string;
  }
}

export type DashboardInfoI = {
    countTotal: number,
    sumRequests: Array<{
      _id: string,
      total: number,
      count: number
    }>,
  poxCycle: number;
  countHandoffs: number;
}
