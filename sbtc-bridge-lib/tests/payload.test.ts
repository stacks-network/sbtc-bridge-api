import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { parseDepositPayload, buildDepositPayload, amountToUint8, uint8ToAmount } from '../src/index';
import { hex } from '@scure/base';
import { commit1 } from './payload.data';
import { fail, deepStrictEqual } from 'assert';
import assert from 'assert';
import * as btc from '@scure/btc-signer';

describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    //console.log("beforeAll: -----------------------------------------------");
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

  it.concurrent('Check fails for out of date payload', async () => {
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

  it.concurrent('Check build and parse simple payload', async () => {
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

  it.concurrent('Check build and parse with contract payload', async () => {
    const payload = buildDepositPayload(btc.TEST_NETWORK, 5000, 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract', true, undefined);
    console.log('payload 3: ', hex.encode(payload))
    const parsedPayload = parseDepositPayload(payload, 8888);
    console.log('parsedPayload 3: ', parsedPayload)
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

  it.concurrent('Check build and parse with contract and memo payload', async () => {
    const payload = buildDepositPayload(btc.TEST_NETWORK, 5000, 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract', true, 'indefined');
    console.log('payload 3: ', hex.encode(payload))
    const parsedPayload = parseDepositPayload(payload, 8888);
    console.log('parsedPayload 3: ', parsedPayload)
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

