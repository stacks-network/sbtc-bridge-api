import { beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { 
  amountToBigUint64, bigUint64ToAmount,
  buildWithdrawPayload, parseWithdrawPayload,
  PayloadType, parsePayloadFromTransaction
} from '../src/index';
import { hex } from '@scure/base';
import assert from 'assert';
import * as btc from '@scure/btc-signer';
import { getStacksAddressFromPubkey, getStacksAddressFromSignature, getStacksAddressFromSignatureRsv } from '../src/payload_utils';

describe('Withdraw tests', () => {
  beforeAll(async () => {
    ////console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
  })

  it.concurrent('Check converting numbers to from uint8 arrays works', async () => {
    let s = hex.encode(amountToBigUint64(42, 8))
    //console.log((s))
    assert(s === '000000000000002a')
    let y = bigUint64ToAmount(hex.decode(s))
    //console.log((y))
    assert(y === 42)

    //console.log(bigUint64ToAmount(hex.decode('000000000000022b')))

    // 0000 0000 0000 03ae
    s = hex.encode(amountToBigUint64(942, 8))
    assert((s) === '00000000000003ae')
    //console.log('s: ' + (s));           
    y = bigUint64ToAmount(hex.decode(s))
    //console.log('y: ' + y);           
    assert(y === 942)

    s = hex.encode(amountToBigUint64(5000, 8))
    //console.log('s: ' + (s));           
    y = bigUint64ToAmount(hex.decode(s))
    //console.log('y: ' + y);           
    assert(y === 5000)

    //0000 0000 05f5 e100
    s = hex.encode(amountToBigUint64(100000000, 8))
    //console.log('s: ' + (s));           
    y = bigUint64ToAmount(hex.decode(s))
    //console.log('y: ' + y);           
    assert(y === 100000000)
    //           100000000 00000000
    /**
     */
  })

  it.concurrent('Check parsing and building withdrawal payload 1', async () => {
    const sig = {
      publicKey: "032dea00ee2172e11fc18fc3c3ab2712038bf95d7b89330d0195624cc20764e414",
      signature: "00b9710b4fda0bcf7a066d49f29ed76032c28862e5c496c5c9803501baa6130eb915e992eef765daaebf06acba5efa49ae8e0a438c5f22b03088c9d94dd061ca30"
    }
    const getDataToSign = '3600000000000003200014764ad6983a6455cca54cd6a4f7b0da71ba6a0bab';
    const message = '3600000000000003200014764ad6983a6455cca54cd6a4f7b0da71ba6a0bab'
    const messageHash = 'b37a0c9bf56598e9d39da2eaf6762c99fd403c61605148a34c505c62271880cc'

    getStacksAddressFromPubkey(hex.decode(sig.publicKey))

    const fromAddress = 'tb1qwe9ddxp6v32uef2v66j00vx6wxax5zat223tms'
    const stacksAddress = 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT';
    const amount = 800;

    const payload = buildWithdrawPayload('testnet', amount, sig.signature);

    //assert(hex.encode(payload) === data);

    //const tx = new btc.Transaction({ allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
    //tx.addOutputAddress(fromAddress, BigInt(dust), btc.TEST_NETWORK);
  
    const parsedPayload = parseWithdrawPayload('testnet', payload, fromAddress, 'vrs');
    //console.log('parsedPayload1: ', parsedPayload);
    assert(parsedPayload.amountSats === amount);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.signature === sig.signature);
    expect(parsedPayload.stacksAddress).equals(stacksAddress);
  })

  it.concurrent('Check parsing and building withdrawal payload 2', async () => {
    const fromAddress = 'tb1qp8r7ln235zx6nd8rsdzkgkrxc238p6eecys2m9'
    const stacksAddress = 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT';
    const amount = 942;
    const sig = {
      publicKey: "02e30e89dc85db23273fed237c21d4ca495de4fbffbdf8a90d90e902847fb411c7",
      signature: "00251c10f7e9a650409416fd70a4c9f3467723f3bdbcc6a534c1d11776c6da76df57dfddfb524c01776af0443da6fd7be5e189ec4d42290ee80db2a1e7f08dda5e"
    }
    const getDataToSign = '360000000000000258001409c7efcd51a08da9b4e38345645866c2a270eb39';
    const message = '3600000000000003200014764ad6983a6455cca54cd6a4f7b0da71ba6a0bab'
    const messageHash = 'b37a0c9bf56598e9d39da2eaf6762c99fd403c61605148a34c505c62271880cc'

    const addresses = getStacksAddressFromSignature(hex.decode(messageHash), sig.signature)
    console.log('Check parsing and building withdrawal payload 2:addresses: ', addresses);
    console.log('parsedPayload0: ', addresses);

    const payload = buildWithdrawPayload('testnet', amount, sig.signature);
    const parsedPayload = parseWithdrawPayload('testnet', payload, fromAddress, 'vrs');
    console.log('Check parsing and building withdrawal payload 2:parsedPayload: ', parsedPayload);
    assert(parsedPayload.amountSats === amount);
    assert(parsedPayload.opcode === '3E');
    assert(parsedPayload.signature === sig.signature);
    //TODO: fix this !!! expect(parsedPayload.stacksAddress).equals(stacksAddress);
  })
  
  it.concurrent('Parse deposit op_return', async () => {
    const txHex = '02000000000101b45477dbbb0529da2113432a3a4956de86225db8cbe7d5542e7789cd6a440f6c0100000000ffffffff0300000000000000004f6a4c4c54323e0000000000000315019d9f202861ef9e2d8ec332aac3f60d922ba7d1a98adf46f9416756e6f750639f4a949af7ff0c7b30dc24c0db2bdd7ea70cf3e9096108eb4023b2eca79d35a494f40100000000000016001409c7efcd51a08da9b4e38345645866c2a270eb39d14305000000000016001409c7efcd51a08da9b4e38345645866c2a270eb3902483045022100de9e244dd9bd6f307e979547e088736f54fde25d250e435fe867ddf4948f4d0202207762316984993ef5a8cefad1723eee8f07200437b87f3c141a39c3b150cffd27012103665ca3afcd61141e97aa9706d180514e28ef8fa29e0425e82a78e5e3b25f2b3600000000';
    
    const payload:PayloadType = parsePayloadFromTransaction('testnet', txHex);
    expect(payload.stacksAddress).equals('ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5')
    expect(payload.amountSats).equals(789)
    expect(payload.opcode).equals('3E')
    expect(payload.sbtcWallet).equals('tb1qp8r7ln235zx6nd8rsdzkgkrxc238p6eecys2m9')
  })

})

