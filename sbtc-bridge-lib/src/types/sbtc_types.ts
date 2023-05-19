export type SigData = {
  pegin: boolean; 
  webWallet: boolean; 
  signature?: string;
  outputsForDisplay: any;
  inputsForDisplay: any;
}
export type SbtcContractDataI = {
  coordinator?: { addr: { value: string }, key:string };
  sbtcWalletAddress: string;
  numKeys?: number;
  numParties?: number;
  tradingHalted?: boolean;
  tokenUri?: string;
  threshold?: number;
  totalSupply?: number;
  decimals?: number;
  name?: string;
  burnHeight?: number;
  addressValidation?: AddressValidationI;
}
export type AddressValidationI = {
  isvalid: boolean;
  address: string;
  scriptPubKey: string;
  isscript: boolean;
  iswitness: boolean;
  "witness_version": number;
  "witness_program": string;
}
export type SbtcBalance = {
	cardinal?: string;
	ordinal?: string;
  address:string;
  balance:number;
};
export type PeginRequestI = {
  _id?:string;
  status: number;
  tries?: number;
	updated?: number;
  amount: number;
  mode: string,
  requestType:string;
  wallet?: string,
  btcTxid?: string;
  senderAddress?: string;
  fromBtcAddress: string;
  revealPub: string;
  reclaimPub: string;
  stacksAddress: string;
  sbtcWalletAddress: string;
  commitTxScript?: PeginScriptI;
  vout?: VoutI;
}
export type PeginScriptI = {
  address?: string;
  script: string|Uint8Array|undefined;
  paymentType: string;
  redeemScript?: string|Uint8Array;
  witnessScript?: string|Uint8Array;
  wsh?:string;
  leaves?:any;
  tapInternalKey?:string|Uint8Array;
  tapLeafScript?:any;
  tapMerkleRoot?:string|Uint8Array;
  tweakedPubkey?:string|Uint8Array;
}
export type VoutI = {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}
export type PegInData = {
	requestData?: PeginRequestI;
	confirmations?: number;
	burnHeight?: number;
	stacksAddress?: string;
	sbtcWalletAddress: string;
	amount: number,
	revealFee: number;
};

export type CommitKeysI = {
  fromBtcAddress: string;
  reveal: string;
  revealPub: string;
  revealPrv?: string;
  reclaim: string;
  reclaimPub: string;
  reclaimPrv?: string;
  stacksAddress: string;
};

export type AddressDetails = {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  },
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  }
}

export type Message = {
	script: Uint8Array,
	signature?: Uint8Array | string
};
export type UTXO = {
  txid: string;
  vout: number;
  fullout?: {
    scriptpubkey:string;
    scriptpubkey_address:string;
    scriptpubkey_asm:string;
    scriptpubkey_type:string;
    value:number;
  };
  tx: any;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
};

export type payloadType = {
  sbtcWallet:string;
  burnBlockHeight?:number;
  payload:withdrawalPayloadType|depositPayloadType;
}
export type withdrawalPayloadType = {
  opcode: string;
  stacksAddress: string;
  signature: string;
  compression: number,
  amountSats: number;
  dustAmount?: number;
};
export type depositPayloadType = {
  opcode: string;
  prinType: number;
  stacksAddress: string;
  lengthOfCname: number;
  cname?: string;
  lengthOfMemo: number;
  memo?: string;
  revealFee: number;
  amountSats: number;
};
