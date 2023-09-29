import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { 
  parseDepositPayload, buildDepositPayloadOpDrop, buildDepositPayload, PayloadType
} from '../src/index';
import { base58, hex } from '@scure/base';
import { commit1 } from './payload.data';
import { fail, deepStrictEqual } from 'assert';
import * as btc from '@scure/btc-signer';
import { parsePayloadFromTransaction } from '../src/payload_utils';

describe('Deposit tests', () => {
  beforeAll(async () => {
  })

  beforeEach(async () => {
  })

  it.concurrent('Convert wif to private key', async () => {
    const wif = 'cRGhcDVSoLrPLhweao82kNwZHc4BB3QhXxH6JyJrpJkFmUhr7QRn';
    const decWif = base58.decode(wif)
    let pk;
    pk = decWif.subarray(0, decWif.length - 4) // last 4 bytes are checksum
    pk = pk.subarray(1)
    expect(pk.length).equals(33)
    expect(hex.encode(pk)).equals('6e16df46e3ca6e21dfcb69cb50836766d378f9eef4fba0ec85022f5f880f463901')
  })

  it.concurrent('Check parsing deposit payload fails for out of date payload', async () => {
    const script = hex.decode(commit1.commitTxScript?.leaves[0].script);
    // first byte is length
    try {
      const parsedPayload = parseDepositPayload(script.subarray(1));
      deepStrictEqual(parsedPayload, {
        amountSats: 0,
        cname: undefined,
        lengthOfCname: 0,
        lengthOfMemo: 0,
        memo: undefined,
        opcode: '3C',
        prinType: 0,
        revealFee: 0,
        stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
      })

      fail('if entres here')
    } catch (err:any) {
      expect(err.message.indexOf('Invalid version'));
    }
  })

  it.concurrent('Check parsing and building deposit simple payload', async () => {
    const payloadUint8 = buildDepositPayloadOpDrop('testnet', 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN', 5000);
    const payload = payloadUint8
    expect(payload).equals('3c051aea4549ffff9845cd298947db226d875f0b8ad8cd000000000000001388')
    
    const parsedPayload = parseDepositPayload(hex.decode(payloadUint8));
    deepStrictEqual(parsedPayload, {
      amountSats: 0,
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

  it.concurrent('Check parsing and building deposit with stacks principal', async () => {
    const payload = hex.decode(buildDepositPayloadOpDrop('testnet', 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5', 123456675456));
    console.log('Check parsing and building deposit with contract payload: ', hex.encode(payload))
    const parsedPayload = parseDepositPayload(payload);
    deepStrictEqual(parsedPayload, {
      amountSats: 0,
      cname: undefined,
      lengthOfCname: 0,
      lengthOfMemo: 0,
      memo: undefined,
      opcode: '3C',
      prinType: 5,
      revealFee: 123456675456,
      stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    })
  })

  it.concurrent('Check parse and build op_drop', async () => {
    const payload = hex.decode(buildDepositPayloadOpDrop('testnet', 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract-alpha', 5000));
    console.log('Check parsing and building deposit with contract payload: ', hex.encode(payload))
    const parsedPayload = parseDepositPayload(payload);
    deepStrictEqual(parsedPayload, {
      amountSats: 0,
      cname: 'contract-alpha',
      lengthOfCname: 14,
      lengthOfMemo: 0,
      memo: undefined,
      opcode: '3C',
      prinType: 6,
      revealFee: 5000,
      stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    })
  })

  it.concurrent('Check parse and build op_return', async () => {
    const payload = hex.decode(buildDepositPayload('testnet', 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract-alpha'));
    console.log('Check parsing and building deposit with contract payload: ', hex.encode(payload))
    const parsedPayload = parseDepositPayload(payload);
    deepStrictEqual(parsedPayload, {
      amountSats: 0,
      cname: 'contract-alpha',
      lengthOfCname: 14,
      lengthOfMemo: 0,
      memo: undefined,
      opcode: '3C',
      prinType: 6,
      revealFee: 0,
      stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
    })
  })

  it.concurrent('Check parsing and building deposit with contract and memo payload', async () => {
    const payload = hex.decode(buildDepositPayloadOpDrop('testnet', 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.contract', 5000));
    const parsedPayload = parseDepositPayload(payload);
    deepStrictEqual(parsedPayload, {
      amountSats: 0,
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

  it.concurrent('Parse deposit op_return', async () => {
    const txHex = '020000000001011c00ea110c259be6cb25d2862e99fd2227081d9007969789fc57ca938f435f1b0300000000ffffffff0300000000000000001b6a1958323c1a7010183fd1a76976e7b2bb67acdf57cdfe704882006400000000000000225120d1f244f7d308f1940aa66ca802ee12268a6442e2c5984d571b76509173de629d355d05000000000016001409c7efcd51a08da9b4e38345645866c2a270eb390247304402201ed151e47f842d211467016fd12e8310e12631540050a0d141885c516bdbb9820220494b426466600ce0903b455a095c0ab779bc003d59c1a4d7a283de40e3ab2dd5012103665ca3afcd61141e97aa9706d180514e28ef8fa29e0425e82a78e5e3b25f2b3600000000';
    
    const payload:PayloadType = parsePayloadFromTransaction('testnet', txHex);
    console.log('Parse deposit op_return:', payload)
    expect(payload.stacksAddress).equals('ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5')
    expect(payload.amountSats).equals(100)
    expect(payload.opcode).equals('3C')
    expect(payload.sbtcWallet).equals('tb1p68eyfa7nprcegz4xdj5q9msjy69xgshzckvy64cmwegfzu77v2wslah8ww')
    expect(payload.prinType).equals(0)
  })

})

