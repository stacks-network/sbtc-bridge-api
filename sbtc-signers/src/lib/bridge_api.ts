import { CONFIG } from '$lib/config';
import type { AddressObject } from 'sbtc-bridge-lib' 

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
async function fetchCatchErrors(path:string) {
  try {
    const response = await fetch(path);
    return response;
  } catch (err:any) {
    console.log('fetchCatchErrors: ', err)
    return new Response(undefined, {
      status: 505,
    }) 
  }
}

async function extractResponse(response:any) {
  try {
    return await response.json();
  } catch(err) {
    try {
      return await response.text();
    } catch(err) {
      console.log('error fetching response.. ', err)
    }
  }
}

export async function fetchSbtcWalletAddress() {
  const path = addNetSelector(CONFIG.VITE_BRIDGE_API + '/sbtc/wallet-address');
  const response = await fetchCatchErrors(path);
  return await extractResponse(response);
}

export async function fetchSbtcData() {
  const path = addNetSelector(CONFIG.VITE_BRIDGE_API + '/sbtc/data');
  try {
    const response = await fetchCatchErrors(path);
    return await extractResponse(response);
  } catch(err) {
    return {}
  }
}

export async function fetchUserSbtcBalance(stxAddress:string) {
  try {
    const path = addNetSelector(CONFIG.VITE_BRIDGE_API + '/sbtc/address/' + stxAddress + '/balance');
    const response = await fetch(path);
    return await extractResponse(response);
  } catch (err) {
    return { balance: 0 };
  }
}
export async function fetchUserBalances(adrds:AddressObject) {
  const path = addNetSelector(CONFIG.VITE_BRIDGE_API + '/sbtc/address/balances/' + adrds.stxAddress + '/' + adrds.cardinal + '/' + adrds.ordinal);
  const response = await fetch(path);
  if (response.status !== 200) {
    console.log('Bitcoin address not known - is the network correct?');
  }
  const res = await extractResponse(response);
  return res;
}
