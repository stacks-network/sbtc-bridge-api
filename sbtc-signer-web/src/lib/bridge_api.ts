import { CONFIG } from '$lib/config';
import type { AddressObject } from 'sbtc-bridge-lib' 

export function addNetSelector (path:string) {
  if (CONFIG.VITE_NETWORK === 'testnet' || CONFIG.VITE_NETWORK === 'devnet') {
    if (path.indexOf('bridge-api') > -1) {
      return path.replace('bridge-api', 'bridge-api/testnet');
    } else {
      return path.replace('signer-api', 'signer-api/testnet');
    }
  } else if (CONFIG.VITE_NETWORK === 'simnet') {
    if (path.indexOf('bridge-api') > -1) {
      return path.replace('bridge-api', 'bridge-api/simnet');
    } else {
      return path.replace('signer-api', 'signer-api/simnet');
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

export async function fetchExchangeRates() {
  const path = addNetSelector(CONFIG.VITE_BRIDGE_API + '/btc/tx/rates');
  const response = await fetchCatchErrors(path);
  if (response.status !== 200) {
    return [{
      currency: "USD",
      fifteen:0,
      last:0,
      buy:0,
      sell:0,
      symbol:"$",
      name:"US Dollor",
      _id:"64c236634b5e0bdea234cb0e"
    },
  ]
  }
  const txs = await response.json();
  return txs;
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
