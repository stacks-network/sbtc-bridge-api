import { CONFIG } from '$lib/config';
import type { BlockchainInfo } from 'sbtc-bridge-lib' 

function addNetSelector (path:string) {
  if (CONFIG.VITE_NETWORK === 'testnet' || CONFIG.VITE_NETWORK === 'devnet') {
    if (path.indexOf('bridge-api') > -1) {
      return path.replace('bridge-api', 'bridge-api/testnet');
    } else {
      return path.replace('signer-api', 'signer-api/testnet');
    }
  } else {
    if (path.indexOf('bridge-api') > -1) {
      return path.replace('bridge-api', 'bridge-api/mainnet');
    } else {
      return path.replace('signer-api', 'signer-api/mainnet');
    }
  }
}
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

export async function getDelegationInfo(stxAddress:string):Promise<BlockchainInfo|undefined> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/pox/get-delegation-info/' + stxAddress);
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

export async function fetchStatelessInfo():Promise<any> {
  const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/info');
  try {
    const response = await fetch(path);
    const res = await response.json();
    return res;
  } catch(err) {
    return undefined;
  }
}

