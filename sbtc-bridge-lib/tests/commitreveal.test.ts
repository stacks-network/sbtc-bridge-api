import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { 
  amountToBigUint64, bigUint64ToAmount,
  buildWithdrawalPayload, parseWithdrawalPayload,
} from '../src/index';
import { hex } from '@scure/base';
import assert from 'assert';
import * as btc from '@scure/btc-signer';
import { schnorr } from '@noble/curves/secp256k1'; // ESM and Common.js
import * as secp from '@noble/secp256k1';


describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    ////console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
  })

  it.concurrent('Ensure can create random schnorr keys', async () => {
    const priv = secp.utils.randomPrivateKey()
    const xOnlySchnorrPubComp = (secp.getPublicKey(priv, true)).subarray(1);
    const xOnlySchnorrPubComp1 = (secp.getPublicKey(hex.decode('0d7b49bc4864057b087108f81a57da7178cfbeb85a09c8957b64b9840e368b42'), true)).subarray(1);
    console.log('xOnlySchnorrPubComp1: ', hex.encode(xOnlySchnorrPubComp1));
    const oracle = {
      priv: hex.encode(priv),
      ecdsaPub: hex.encode(secp.getPublicKey(priv, true)),
      schnorrPub: hex.encode(xOnlySchnorrPubComp)
    }
    expect(hex.decode(oracle.priv).length).equals(32)
    expect(hex.decode(oracle.ecdsaPub).length).equals(33)
    expect(hex.decode(oracle.schnorrPub).length).equals(32)
    console.log('oracle: ', oracle);
    console.log('oracle: ', oracle);
  })

  it.concurrent('Check converting numbers to from uint8 arrays works', async () => {
    let s = hex.encode(amountToBigUint64(42, 8))
    console.log((s))
    assert(s === '000000000000002a')
    let y = bigUint64ToAmount(hex.decode(s))
    console.log((y))
    assert(y === 42)

    console.log(bigUint64ToAmount(hex.decode('000000000000022b')))

    // 0000 0000 0000 03ae
    s = hex.encode(amountToBigUint64(942, 8))
    assert((s) === '00000000000003ae')
    console.log('s: ' + (s));           
    y = bigUint64ToAmount(hex.decode(s))
    console.log('y: ' + y);           
    assert(y === 942)

    s = hex.encode(amountToBigUint64(5000, 8))
    console.log('s: ' + (s));           
    y = bigUint64ToAmount(hex.decode(s))
    console.log('y: ' + y);           
    assert(y === 5000)

    //0000 0000 05f5 e100
    s = hex.encode(amountToBigUint64(100000000, 8))
    console.log('s: ' + (s));           
    y = bigUint64ToAmount(hex.decode(s))
    console.log('y: ' + y);           
    assert(y === 100000000)
    //           100000000 00000000
    /**
     */
  })
  
  /**
  */
  it.concurrent('Check parsing and building withdrawal payload 1', async () => {
    const fromAddress = 'tb1qp8r7ln235zx6nd8rsdzkgkrxc238p6eecys2m9'
    const stacksAddress = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5';
    const amount = 942;
    //const amountBuf = '00000000000003ae' // 8 bytes
    //const messageHash = '00000000000003ae001409c7efcd51a08da9b4e38345645866c2a270eb39'
    //const publicKey = "02e30e89dc85db23273fed237c21d4ca495de4fbffbdf8a90d90e902847fb411c7"
    let signature = "885b122df0a9a4abb9bc7911dc6d7af5b36a54063fa32476fbfe5ba0a0d039803bb6de6bd3058c4c494d3a6f1c925afd55dc2daa5672d164816457ab8c0ef6e600"
    //Sats (be, buf=1): 942 amountToBigUint64:00000000000003ae bigUint64ToAmount:942
    //data = concat(magicBuf, opCodeBuf, amountBuf, signature)
    const data = '54323e00000000000003ae885b122df0a9a4abb9bc7911dc6d7af5b36a54063fa32476fbfe5ba0a0d039803bb6de6bd3058c4c494d3a6f1c925afd55dc2daa5672d164816457ab8c0ef6e600'
                 //     00000000000003ae
    //let signature = await secp.signAsync(dataToSignHash, privKey); // sync methods below
    //signature = signature.addRecoveryBit(1);
    //assert(secp.verify(signature, dataToSignHash, pubKey));
    //const payload = buildWithdrawalPayload(btc.TEST_NETWORK, 5000, signature.toCompactRawBytes(), false);
    const payload = buildWithdrawalPayload(btc.TEST_NETWORK, amount, hex.decode(signature), false);
    assert(hex.encode(payload) === data);
    const parsedPayload = parseWithdrawalPayload('testnet', payload, fromAddress, 0);
    console.log('parsedPayload1: ', parsedPayload);
    assert(parsedPayload.amountSats === amount);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.signature === signature);
    assert(parsedPayload.stacksAddress === stacksAddress);
  })

})