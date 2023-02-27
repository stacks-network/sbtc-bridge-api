import { listReceivedByAddress, getWalletInfo, estimateSmartFee, getAddressInfo, importAddress, listUnspent } from '../src/lib/bitcoin/rpc_wallet'
import { startScantxoutset } from '../src/lib/bitcoin/rpc_blockchain'
import util from 'util'

describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    // cant fetch mock here as only first mock is recognised
    //console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
    // cant fetch mock here as only first mock is recognised
  })

  it.concurrent('Check estimateSmartFee() returns correct info', async () => {
    const result = await estimateSmartFee();
    expect(result.feeInfo.low_fee_per_kb).equals(result.feeInfo.medium_fee_per_kb / 2);
    expect(result.feeInfo.high_fee_per_kb).equals(result.feeInfo.medium_fee_per_kb * 2);
    //console.log('estimateSmartFee: ', util.inspect(result, false, null, true /* enable colors */));
  })

  /** 
   * shuts wallet down whle the scan takes place - see also import address.
  it.concurrent('Check startScantxoutset() returns correct info', async () => {
    const result = await startScantxoutset('tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e');
    const result1 = await getWalletInfo('tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e');
    console.log('startScantxoutset: ', util.inspect(result1, false, null, true));
    expect(typeof result1.scanning === 'object');
  })
  it.concurrent('Check importAddress() returns correct info', async () => {
    const result = await importAddress();
    console.log('importAddress: ', util.inspect(result, false, null, true));
  })
  */

  it.concurrent('Check getAddressInfo() returns correct info', async () => {
    const result = await getAddressInfo('tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e');
    console.log('getAddressInfo: ', util.inspect(result, false, null, true /* enable colors */));
    expect(result.iswitness).equals(true);
  })

  it.concurrent('Check listUnspent() returns correct info', async () => {
    const result = await listUnspent('tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e');
    expect(result.length).equals(0);
  })

  it.concurrent('Check getWalletInfo() returns correct info', async () => {
    const result = await getWalletInfo('tb1q6ue638m4t5knwxl4kwhwyuffttlp0ffee3zn3e');
    expect(result.walletname).equals('watcher-22');
  })

  it.concurrent('Check listReceivedByAddress() returns correct info', async () => {
    const result = await listReceivedByAddress();
    expect(result.length).equals(1);
    expect(result[0].txids.length).equals(6);
  })

})
