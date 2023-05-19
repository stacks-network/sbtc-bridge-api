import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { 
  parseDepositPayload, buildDepositPayload,
  amountToUint8, uint8ToAmount,
  buildWithdrawalPayload, parseWithdrawalPayload,
  getStacksSimpleHashOfDataToSign, getStacksAddressFromSignature
} from '../src/index';
import { sbtcWallets } from '../src/index';
import { hex } from '@scure/base';
import { commit1 } from './payload.data';
import { fail, deepStrictEqual } from 'assert';
import assert from 'assert';
import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';

describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    ////console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
  })

  it.concurrent('Check converting numbers to from uint8 arrays works', async () => {
    // first byte is length
    let s = amountToUint8(100, 20)
    let y = uint8ToAmount(s)
    assert(y === 100)
    s = amountToUint8(5000, 8)
    y = uint8ToAmount(s)
    assert(y === 5000)
    y = uint8ToAmount(hex.decode('0000138800000000'))
    assert(y === 5000)
    y = uint8ToAmount(hex.decode('00001388'))
    assert(y === 5000)
  })

  it.concurrent('Check parsing deposit payload fails for out of date payload', async () => {
    const script = hex.decode(commit1.commitTxScript?.leaves[0].script);
    // first byte is length
    try {
      const parsedPayload = parseDepositPayload(script.subarray(1), commit1.amount);
      deepStrictEqual(parsedPayload, {
        amountSats: 1000,
        cname: undefined,
        lengthOfCname: 0,
        lengthOfMemo: 0,
        memo: undefined,
        opcode: '3C',
        prinType: 5,
        revealFee: 15000,
        stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
      })
      fail('if entres here')
    } catch (err:any) {
      expect(err.message.indexOf('Invalid version')).greaterThan(-1);
    }
  })

  it.concurrent('Check parsing and building deposit simple payload', async () => {
    const payload = buildDepositPayload(btc.TEST_NETWORK, 5000, 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5', true, undefined);
    const parsedPayload = parseDepositPayload(payload, 8888);
    deepStrictEqual(parsedPayload, {
      amountSats: 8888,
      cname: undefined,
      lengthOfCname: 0,
      lengthOfMemo: 0,
      memo: undefined,
      opcode: '3C',
      prinType: 5,
      revealFee: 5000,
      stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    })
  })

  it.concurrent('Check parsing and building deposit with contract payload', async () => {
    const payload = buildDepositPayload(btc.TEST_NETWORK, 5000, 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract', true, undefined);
    const parsedPayload = parseDepositPayload(payload, 8888);
    deepStrictEqual(parsedPayload, {
      amountSats: 8888,
      cname: 'contract',
      lengthOfCname: 8,
      lengthOfMemo: 0,
      memo: undefined,
      opcode: '3C',
      prinType: 6,
      revealFee: 5000,
      stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    })
  })

  it.concurrent('Check parsing and building deposit with contract and memo payload', async () => {
    const payload = buildDepositPayload(btc.TEST_NETWORK, 5000, 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract', true, 'indefined');
    const parsedPayload = parseDepositPayload(payload, 8888);
    deepStrictEqual(parsedPayload, {
      amountSats: 8888,
      cname: 'contract',
      lengthOfCname: 8,
      lengthOfMemo: 9,
      memo: 'indefined',
      opcode: '3C',
      prinType: 6,
      revealFee: 5000,
      stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    })
  })



  it.concurrent('Check parsing and building withdrawal payload', async () => {
    const privKey = secp.utils.randomPrivateKey(); // Secure random private key
    // sha256 of 'hello world'
    //const msgHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
    
    const dataToSignHash = getStacksSimpleHashOfDataToSign('testnet', 5000, sbtcWallets[0].sbtcAddress);
  
    const pubKey = secp.getPublicKey(privKey);
    let signature = await secp.signAsync(dataToSignHash, privKey); // sync methods below
    signature = signature.addRecoveryBit(1);
    assert(secp.verify(signature, dataToSignHash, pubKey));

    //const alicesPubkey = secp.getPublicKey(secp.utils.randomPrivateKey());
    //secp.getSharedSecret(privKey, alicesPubkey); // Elliptic curve diffie-hellman
    //signature.recoverPublicKey(msgHash); // Public key recovery

    //console.log('Check dataToSignHash: ' + dataToSignHash);
    //console.log('Check signature: ', signature.toCompactHex());

    const payload = buildWithdrawalPayload(btc.TEST_NETWORK, 5000, signature.toCompactRawBytes(), true);

    //console.log('buildWithdrawalPayload 3: ', hex.encode(payload));

    const parsedPayload = parseWithdrawalPayload('testnet', payload, sbtcWallets[0].sbtcAddress, 0);
    //console.log('buildWithdrawalPayload 3: ', parsedPayload)
    assert(parsedPayload.amountSats === 5000);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.signature === signature.toCompactHex());

    // unable to parse stacks address from sig create with scure atm. This works with
    // the sig created by the Hiro wallet - see next test.
    //deepStrictEqual(parsedPayload, {
    //  amountSats: 5000,
    //  opcode: '3E',
    //  signature: signature.toCompactHex(),
    //  compression: 0,
    //  stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    //})
  })

  it.concurrent('Check withdrawal data against hiro web wallet', async () => {

    const network = 'testnet';
    const amount = 5554
    const stacksSignAddress = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5';

    const dataToSig = '000015b2000000000051204faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710'
    const hiroDisplayHash = '988f202b48bd80ac64b63cb8f07cd21272b149ac574327e4b35c6318625f1ca7'
    const hiroPublicKey = '035c4ea02f85cb4a9ef617662f5888e3bbefcbe3b2b0b76c9352f2629ea94d7176'

    const publicKey = "02e30e89dc85db23273fed237c21d4ca495de4fbffbdf8a90d90e902847fb411c7"
    const signature = "05a1aff80cfd2277b633aacffdb4b3a54544f71647a32aa60da6854143296c1534fe93ea575c54b003434888a3ea6b2ff1bd6e50aefeae2f405407256a09e75f01"

    const dataToSignHash = getStacksSimpleHashOfDataToSign('testnet', amount, sbtcWallets[0].sbtcAddress);
  
    //console.log('Check hiroDisplayHash: ', hiroDisplayHash);
    //console.log('Check dataToSignHash: ', dataToSignHash);

    assert(dataToSignHash === hiroDisplayHash)

    const addr = getStacksAddressFromSignature(hex.decode(dataToSignHash), signature, 0);
    assert(addr.tp2pkh === stacksSignAddress)
  })
  
})

