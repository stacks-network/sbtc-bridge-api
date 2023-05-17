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
export type PeginScriptI = {
  address?: string;
  script: string;
  paymentType: string;
  redeemScript?: string;
  witnessScript?: string;
  wsh?:string;
  leaves?:[any];
  tapInternalKey?:Uint8Array;
  tapLeafScript?:[any];
  tapMerkleRoot?:Uint8Array;
  tweakedPubkey?:Uint8Array;
}

export type VoutI = {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}