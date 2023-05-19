import type { VoutI, PeginScriptI } from 'sbtc-bridge-lib/src/index' 

export type PeginRequestI = {
  _id?:string;
  status: number;
  tries: number;
	updated?: number;
  amount: number;
  mode: string,
  requestType:string;
  wallet?: string,
  btcTxid?: string;
  fromBtcAddress: string;
  revealPub: string;
  reclaimPub: string;
  stacksAddress: string;
  sbtcWalletAddress: string;
  commitTxScript: PeginScriptI;
  vout?: VoutI;
  reveal?: {
    btcTxid: string;
    vout: VoutI;
  },
  reclaim?: {
    btcTxid: string;
    vout: VoutI;
  }
}