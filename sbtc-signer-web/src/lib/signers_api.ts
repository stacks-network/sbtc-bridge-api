import { CONFIG } from '$lib/config';
import type { BlockchainInfo } from 'sbtc-bridge-lib' 
import { addNetSelector } from './bridge_api'

/**
export async function fetchPoxInfo():Promise<BlockchainInfo|undefined> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/pox/info');
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}
 */

export async function getAllowanceContractCallers(stxAddress:string):Promise<BlockchainInfo|undefined> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/sbtc/stacking/get-allowance-contract-callers/' + stxAddress);
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

export async function getDelegationInfo(stxAddress:string):Promise<BlockchainInfo|undefined> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/sbtc/stacking/get-delegation-info/' + stxAddress);
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

export async function fetchWebDid(domain:string):Promise<BlockchainInfo|undefined> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/vouching/domain/' + encodeURI(domain));
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

export async function fetchDashboardInfo():Promise<any> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/mini/sbtc/application/data');
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

export async function fetchSbtcData() {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/mini/sbtc/data');
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

