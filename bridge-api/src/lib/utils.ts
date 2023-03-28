import { network } from './config.js';
import * as  btc from '@scure/btc-signer';

const btcPrecision = 100000000

export function getNet() {
  return  (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
}

export function satsToBitcoin(amountSats:number) {
  return  Math.round(amountSats) / btcPrecision
}

export function bitcoinToSats(amountBtc:number) {
  return  Math.round(amountBtc * btcPrecision)
}

