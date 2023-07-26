import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { 
  parseDepositPayload, buildDepositPayload,
  amountToBigUint64, bigUint64ToAmount,
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

  it.concurrent('Check parsing and building withdrawal payload 2', async () => {
    const fromAddress = 'tb1qp8r7ln235zx6nd8rsdzkgkrxc238p6eecys2m9'
    const stacksAddress = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5';
    const amount = 942;
    const data = '54323e00000000000003ae885b122df0a9a4abb9bc7911dc6d7af5b36a54063fa32476fbfe5ba0a0d039803bb6de6bd3058c4c494d3a6f1c925afd55dc2daa5672d164816457ab8c0ef6e600'
    let signature = '885b122df0a9a4abb9bc7911dc6d7af5b36a54063fa32476fbfe5ba0a0d039803bb6de6bd3058c4c494d3a6f1c925afd55dc2daa5672d164816457ab8c0ef6e600'
    const payload = buildWithdrawalPayload(btc.TEST_NETWORK, amount, hex.decode(signature), false);
    console.log('payload: ', hex.encode(payload));
    const parsedPayload = parseWithdrawalPayload('testnet', payload, fromAddress, 0);
    console.log('parsedPayload: ', parsedPayload);
    expect(data).equals(hex.encode(payload));
    assert(parsedPayload.amountSats === amount);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.stacksAddress === stacksAddress);
    assert(parsedPayload.signature === signature);
  })

  it.concurrent('Check parsing and building withdrawal payload 3', async () => {
    const fromAddress = 'tb1qp8r7ln235zx6nd8rsdzkgkrxc238p6eecys2m9'
    const stacksAddress = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5';
    const amount = 242;
    const data = '54323e00000000000000f221a7ac825846d024fe29d0db9d9b48b0d520d01398dc4edf0aab15f9b38da27718ddce8a5c6f8bf730858d9619455a68c03338d729b1f623aa1ddb84ee383e6a00'
    let signature = '21a7ac825846d024fe29d0db9d9b48b0d520d01398dc4edf0aab15f9b38da27718ddce8a5c6f8bf730858d9619455a68c03338d729b1f623aa1ddb84ee383e6a00'
    const payload = buildWithdrawalPayload(btc.TEST_NETWORK, amount, hex.decode(signature), false);
    console.log('payload: ', hex.encode(payload));
    const parsedPayload = parseWithdrawalPayload('testnet', hex.decode(data), fromAddress, 0);
    console.log('parsedPayload: ', parsedPayload);
    console.log('data         : ', data);
    expect(data).equals(hex.encode(payload));
    assert(parsedPayload.amountSats === amount);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.stacksAddress === stacksAddress);
    assert(parsedPayload.signature === signature);
  })


  it.concurrent('Check parsing and building withdrawal payload 4', async () => {
    const fromAddress = 'mu5o1rDdfP6g8NKa1RweQDo1zQT58KWjdR'
    const stacksAddress = 'ST2ACZ7DAH6EH20V36ES9SJEERBX7VWGWV0YB91PG';
    const amount = 100;
    const msgHash = 'ccfa2c7c2a3a4d3928729119d27e4959b77772e457f6d256119ee2211504d1ad'
    expect(msgHash).equals(getStacksSimpleHashOfDataToSign('testnet', amount, fromAddress))
    const data = '54323e0000000000000064084a912d26cb8f26652efc53d717a6b6dbdb64042cfbaa06e20b60fef67d144f36643bbba7ed178255497a058774e39fe39493f444f5ca3428d821356a6bfcf501'
    let signature = '084a912d26cb8f26652efc53d717a6b6dbdb64042cfbaa06e20b60fef67d144f36643bbba7ed178255497a058774e39fe39493f444f5ca3428d821356a6bfcf501'
    const payload = buildWithdrawalPayload(btc.TEST_NETWORK, amount, hex.decode(signature), false);
    console.log('payload: ', hex.encode(payload));
    const parsedPayload = parseWithdrawalPayload('testnet', hex.decode(data), fromAddress, 1);
    console.log('parsedPayload: ', parsedPayload);
    console.log('data         : ', data);
    expect(data).equals(hex.encode(payload));
    assert(parsedPayload.amountSats === amount);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.stacksAddress === stacksAddress);
    assert(parsedPayload.signature === signature);
  })

  
})

