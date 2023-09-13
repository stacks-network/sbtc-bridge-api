export type SbtcMiniContractsI = {
  [key: string]: string
}

export type SbtcMiniWalletI = {
  cycle:number, version: string, hashbytes: string, address: string, pubkey: string
}

export type SbtcMiniContractDataI = {
  coordinator?: {
      addr: {
          value: string;
      };
      key: string;
  };
  currentPegWallet: SbtcMiniWalletI;
  nextPegWallet: SbtcMiniWalletI;
  protocolOwner: { stacksAddress: string, value: boolean }
  contractOwner: string;
  currentWindow?: number;
  currentCyclePool?: any;
  tokenUri?: string;
  threshold?: number;
  totalSupply?: number;
  decimals?: number;
  name?: string;
  symbol?: string;
  burnHeight?: number;
};

export type SbtcContractDataType = {
  coordinator?: { addr: { value: string }, key:string };
  contractOwner: string;
  sbtcWalletAddress: string;
  sbtcWalletPublicKey: string;
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
  witness_version: number;
  witness_program: string;
}
export type SbtcBalanceType = {
	cardinal?: string;
	ordinal?: string;
  address:string;
  balance:number;
};
export type BridgeTransactionType = {
  _id?:string;
  originator: string;
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
  reveal?: RevealOrReclaim;
  reclaim?: RevealOrReclaim;
  revealPub?: string;
  reclaimPub?: string;
  stacksAddress: string;
  sbtcWalletAddress: string;
  commitTxScript?: CommitmentScriptDataType;
  vout0?: VoutI;
  vout?: VoutI;
}
export type RevealOrReclaim = {
  btcTxid?: string;
  signedPsbtHex?: string;
}
export type CommitmentScriptDataType = {
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
	requestData?: BridgeTransactionType;
	confirmations?: number;
	burnHeight?: number;
	stacksAddress?: string;
	sbtcWalletAddress: string;
	amount: number,
	revealFee: number;
};

export type CommitKeysI = {
  fromBtcAddress: string;
  sbtcWalletAddress: string;
  revealPub: string;
  reclaimPub: string;
  stacksAddress: string;
};

export type AddressObject = {
  stxAddress: string;
  cardinal: string;
  ordinal: string;
  sBTCBalance: number;
  stxBalance: number;
  stacksTokenInfo?: AddressHiroObject;
  cardinalInfo?: AddressMempoolObject;
  ordinalInfo?: AddressMempoolObject;
  btcPubkeySegwit0?: string;
  btcPubkeySegwit1?: string;
};

export type AddressMempoolObject = {
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

export type AddressHiroObject = {
    stx: {
      balance: number;
      total_sent: number;
      total_received: number;
      lock_tx_id: string;
      locked:number;
      lock_height: number;
      burnchain_lock_height: number;
      burnchain_unlock_height: number;
    },
    fungible_tokens: any,
    non_fungible_tokens: any
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

export type SbtcAlphaEvent = {
  contractId: string;
  eventIndex: string;
  txid: string;
  bitcoinTxid: string;
  payloadData:PayloadType;
}

export type PayloadType = {
  sbtcWallet:string;
  burnBlockHeight?:number;
  payload?:WithdrawalPayloadType|DepositPayloadType;
}
export type WithdrawalPayloadType = {
  opcode: string;
  stacksAddress: string;
  signature: string;
  amountSats: number;
  dustAmount?: number;
};
export type DepositPayloadType = {
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
export type KeySet = {
  deposits: {
    revealPubKey: string;
    reclaimPubKey: string;
    oraclePubKey: string;
  }
}
export type StxSignature = {
  signature: string;
  publicKey: string;
  message: string;
};
export type WrappedPSBT = {
  depositId: string;
  txtype: string;
  broadcastResult?: any;
  signedTransaction?: string;
  signedPsbt?: string;
  stxSignature?: StxSignature;
}
export type ExchangeRate = {
    _id: string;
    currency: string;
    fifteen: number;
    last: number;
    buy: number;
    sell: number;
    symbol: string;
    name: string;
}