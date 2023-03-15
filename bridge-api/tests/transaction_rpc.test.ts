import { getOutput2ScriptPubKey } from '../src/lib/bitcoin/rpc_transaction'
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

  it.concurrent('getOutput2ScriptPubKey() extracts the stacks address used to sign', async () => {
    const stxAddress = 'ST2PP8PHV7QWHK1ZXQ85685P4SQZCTS8JWKDVDK9';
    const amount = 3638800;
    const btcAddress = 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8'
    const sig = Buffer.from('31a65f088d04859714a7850d7ba678eca1fcf154237ac31f5a22590cb179dbb24e336b4f1829cee4e2f0e46d6989e1f5aa250be672eef73655874654ee0a2cdb01', 'hex')
    const result = await getOutput2ScriptPubKey(amount, btcAddress, sig);
    console.log(result)
    expect(result).equals(stxAddress);
  })

  it.concurrent('getOutput2ScriptPubKey() verifies the signature', async () => {
    const msg = 'f4010000000000000051204faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710'; // data = Buffer.concat([amtBuf, scriptBuf]);
    const stxAddress = 'ST2PP8PHV7QWHK1ZXQ85685P4SQZCTS8JWKDVDK9';
    const amount = 3638800;
    const btcAddress = 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8'
    const sig = Buffer.from('31a65f088d04859714a7850d7ba678eca1fcf154237ac31f5a22590cb179dbb24e336b4f1829cee4e2f0e46d6989e1f5aa250be672eef73655874654ee0a2cdb01', 'hex')
    const result = await getOutput2ScriptPubKey(amount, btcAddress, sig);
    console.log(result)
    expect(result).equals(stxAddress);
  })


})
