/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import type { SbtcConfig } from '$types/sbtc_config';
import type { SbtcContractDataType } from 'sbtc-bridge-lib';

export const defaultSbtcConfig:SbtcConfig = {
  loggedIn: false,
  sbtcContractData: {} as SbtcContractDataType,
  userSettings: {
    debugMode: false,
    testAddresses: false,
    currency: {
      cryptoFirst: false,
      myFiatCurrency: {
        _id: '',
        currency: '',
        fifteen: 0,
        last: 0,
        buy: 0,
        sell: 0,
        symbol: '',
        name: ''
      },
      denomination: ''
    }
  },
  keySets: {}
}

