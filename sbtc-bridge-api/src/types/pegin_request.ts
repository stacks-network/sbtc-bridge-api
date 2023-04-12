export type PeginRequestI = {
  status: number;
	updated?: number;
  btcTxid?: string;
  fromBtcAddress: string;
  stacksAddress: string;
  sbtcWalletAddress: string;
  timeBasedPegin: PeginScriptI
  vout?: VoutI
}
export type PeginScriptI = {
    paymentType: string;
    address: string;
    script: string;
    redeemScript: string;
    witnessScript: string;
}
export type VoutI = {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}