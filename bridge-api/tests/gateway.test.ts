import { fetchUtxoSet } from '../src/lib/bitcoin/psbt_builder'
import util from 'util'

describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    // cant fetch mock here as only first mock is recognised
    //console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
    // cant fetch mock here as only first mock is recognised
  })

  it.concurrent('Check fetchUtxoSet() returns correct info for p2wpkh', async () => {
    const result = await fetchUtxoSet('tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e');
    console.log('fetchUtxoSet1: ', util.inspect(result, false, null, true /* enable colors */));
  })

  it.concurrent('Check fetchUtxoSet() returns correct info for p2sh address', async () => {
    const result = await fetchUtxoSet('2N8fMsws2pTGfNzkFTLWdUYM5RTWEAphieb');
    console.log('fetchUtxoSet2: ', util.inspect(result, false, null, true /* enable colors */));
  })


})
