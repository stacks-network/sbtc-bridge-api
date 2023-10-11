import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { 
  amountToBigUint64, bigUint64ToAmount,
  buildWithdrawPayload, getPegWalletAddressFromPublicKey, parseWithdrawPayload,
} from '../src/index';
import { hex } from '@scure/base';
import assert from 'assert';
import * as btc from '@scure/btc-signer';
import { schnorr } from '@noble/curves/secp256k1'; // ESM and Common.js
import * as secp from '@noble/secp256k1';


describe('Commit reveal tests', () => {
  beforeAll(async () => {
    ////console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
  })

  it.concurrent('Ensure address', async () => {
    const xOnlyPubKey = hex.decode('03836fbba6f27143d042c040331e1554ea1def354e6e3d58bdedb669f4a2dd68aa').subarray(1);
    let net = btc.TEST_NETWORK;
    const script = btc.p2tr(xOnlyPubKey, undefined, net)
    const addr = btc.Address(net).encode({type: 'tr', pubkey: xOnlyPubKey})
    expect(script.address).equals('tb1psz58gxdxfdyqzur04r2vmgyau7mz5xmg52ns7hg8df7dpu0mlc3sz0wtkj')
  })

  it.concurrent('Ensure can create random schnorr keys', async () => {
    const priv = secp.utils.randomPrivateKey()
    const xOnlySchnorrPubComp = (secp.getPublicKey(priv, true)).subarray(1);
    const xOnlySchnorrPubComp1 = (secp.getPublicKey(hex.decode('0d7b49bc4864057b087108f81a57da7178cfbeb85a09c8957b64b9840e368b42'), true)).subarray(1);
    const oracle = {
      priv: hex.encode(priv),
      ecdsaPub: hex.encode(secp.getPublicKey(priv, true)),
      schnorrPub: hex.encode(xOnlySchnorrPubComp)
    }
    expect(hex.decode(oracle.priv).length).equals(32)
    expect(hex.decode(oracle.ecdsaPub).length).equals(33)
    expect(hex.decode(oracle.schnorrPub).length).equals(32)
  })

  it.concurrent('Check converting numbers to from uint8 arrays works', async () => {
    let s = hex.encode(amountToBigUint64(42, 8))
    assert(s === '000000000000002a')
    let y = bigUint64ToAmount(hex.decode(s))
    assert(y === 42)

    s = hex.encode(amountToBigUint64(942, 8))
    assert((s) === '00000000000003ae')
    y = bigUint64ToAmount(hex.decode(s))
    assert(y === 942)

    s = hex.encode(amountToBigUint64(5000, 8))
    y = bigUint64ToAmount(hex.decode(s))
    assert(y === 5000)

    s = hex.encode(amountToBigUint64(100000000, 8))
    y = bigUint64ToAmount(hex.decode(s))
    assert(y === 100000000)
  })
  
  /**
  */
  it.concurrent('Check parsing and building withdrawal payload 1', async () => {
    const amount = 942;
    let signature = "885b122df0a9a4abb9bc7911dc6d7af5b36a54063fa32476fbfe5ba0a0d039803bb6de6bd3058c4c494d3a6f1c925afd55dc2daa5672d164816457ab8c0ef6e600"
    const data = '54323e00000000000003ae885b122df0a9a4abb9bc7911dc6d7af5b36a54063fa32476fbfe5ba0a0d039803bb6de6bd3058c4c494d3a6f1c925afd55dc2daa5672d164816457ab8c0ef6e600'
    const payload = buildWithdrawPayload('testnet', amount, signature);
    assert(payload === data);
  })

})