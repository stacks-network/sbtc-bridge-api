import { getConfig } from '../src/lib/config'
import util from 'util'
import { fetchMocker } from './setup';

// https://mempool.space/testnet/api/tx/72d1cebc1bb22757f549063926006f680fd5cb9e3388a214244735d8dd124533
const tx1= '020000000001013a50804b685642ec46fcf0e39f9cc0786b184865f3de11851c324126822f7c250000000000ffffffff0224150300000000002200209d242d797166ee6bbd5caa4b76accfc791ea6a727193be45f97059fa073e923c140106000000000016001434a8b0a6023c74925e988a13c52cb00c8224955502483045022100fc43ef9648e55d002572bdd6c5c4000811ddce0b9c96cf95a036fa56217372be022011fab386fb5e55640a637db30f9427e0552388dee82b8e2b3fd156c5b5f9572c012102125793e27e6f0811d4f73f0dc4b31daf9e0b1ecacdc681070308500b433e7b9400000000';
const output0 = {
  "value": 0.0020202,
  "n": 0,
  "scriptPubKey": {
    "asm": "0 9d242d797166ee6bbd5caa4b76accfc791ea6a727193be45f97059fa073e923c",
    "hex": "00209d242d797166ee6bbd5caa4b76accfc791ea6a727193be45f97059fa073e923c",
    "address": "tb1qn5jz67t3vmhxh02u4f9hdtx0c7g756njwxfmu30ewpvl5pe7jg7qruyq38",
    "type": "witness_v0_scripthash"
  }
}
const script = {
  address: 'tb1qn5jz67t3vmhxh02u4f9hdtx0c7g756njwxfmu30ewpvl5pe7jg7qruyq38',
  script: '00209d242d797166ee6bbd5caa4b76accfc791ea6a727193be45f97059fa073e923c',
  witnessScript: '1854323c1a935113b2b705cc6de6c8a5c5b07a92e0b515ddb6752251201b13a556a9ec7ba01e48c80e18e8268ae8f8d33eb61e3c80a693450ceb77f672'
}

describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    //console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
    // cant fetch mock here as only first mock is recognised
    fetchMocker.mockIf(/^https?:\/\/example.com.*$/, (req) => {
      if (req.url.endsWith('/path1')) {
        return 'some response body';
      } else if (req.url.endsWith('/path2')) {
        return {
          body: 'another response body',
          headers: {
            'X-Some-Response-Header': 'Some header value',
          },
        };
      } else {
        return {
          status: 404,
          body: 'Not Found',
        };
      }
    });
  })

  it.concurrent('Check deconstructPegin() returns correct fees', async () => {
    
    //const data = parseOutputs(output0, output0.scriptPubKey.address, Number(output0.value));
    //console.log(data);
  })

})
