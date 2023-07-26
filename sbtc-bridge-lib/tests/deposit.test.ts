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
    const payloadUint8 = buildDepositPayload(btc.TEST_NETWORK, 5000, 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN', true, undefined);
    const payload = hex.encode(payloadUint8)
    expect(payload).equals('3c051aea4549ffff9845cd298947db226d875f0b8ad8cd00000000000000001388')
    
    const parsedPayload = parseDepositPayload(payloadUint8, 8888);
    deepStrictEqual(parsedPayload, {
      amountSats: 8888,
      cname: undefined,
      lengthOfCname: 0,
      lengthOfMemo: 0,
      memo: undefined,
      opcode: '3C',
      prinType: 5,
      revealFee: 5000,
      stacksAddress: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN',
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
})

