/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import type { SbtcConfig } from '$types/sbtc_config';
import type { AddressObject, SbtcContractDataI } from 'sbtc-bridge-lib';

export const defaultSbtcConfig:SbtcConfig = {
  loggedIn: false,
  addressObject: {} as AddressObject,
  sbtcContractData: {} as SbtcContractDataI,
  userSettings: {
    debugMode: false,
  }
}

