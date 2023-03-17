import { getDataToSign } from '../src/lib/structured-data'
import { parseOutputs, fromASM } from '../src/lib/bitcoin/rpc_transaction'
import util from 'util'
import * as  btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { network } from '../src/lib/config';

describe('bitcoin rpc suite - requires bitcoin core running on testnet', () => {
  beforeAll(async () => {
    // cant fetch mock here as only first mock is recognised
    //console.log("beforeAll: -----------------------------------------------");
  })

  beforeEach(async () => {
    // cant fetch mock here as only first mock is recognised
  })

  /**
  it.concurrent('getDataToSign() extracts the stacks address used to sign', async () => {
    const stxAddress = 'ST2PP8PHV7QWHK1ZXQ85685P4SQZCTS8JWKDVDK9';
    const amount = 3638800;
    const btcAddress = 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8'
    const sig = Buffer.from('31a65f088d04859714a7850d7ba678eca1fcf154237ac31f5a22590cb179dbb24e336b4f1829cee4e2f0e46d6989e1f5aa250be672eef73655874654ee0a2cdb01', 'hex')
    const result = await getDataToSign(amount, btcAddress, sig);
    console.log(result)
    expect(result).equals(stxAddress);
  })

  it.concurrent('getDataToSign() verifies the signature', async () => {
    const msg = 'f4010000000000000051204faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710'; // data = Buffer.concat([amtBuf, scriptBuf]);
    const stxAddress = 'ST2PP8PHV7QWHK1ZXQ85685P4SQZCTS8JWKDVDK9';
    const amount = 3638800;
    const btcAddress = 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8'
    const sig = Buffer.from('31a65f088d04859714a7850d7ba678eca1fcf154237ac31f5a22590cb179dbb24e336b4f1829cee4e2f0e46d6989e1f5aa250be672eef73655874654ee0a2cdb01', 'hex')
    const result = await getDataToSign(amount, btcAddress, sig);
    console.log(result)
    expect(result).equals(stxAddress);
  })
 */

  it.concurrent('parseOutputs() verifies the signature', async () => {
    //const result = parseOutputs(ouptutsOpDrop);
    const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
    const p2pkh = ouptutsOpDrop[1].scriptPubKey.asm.split(' ');//.slice(2);
    console.log('encscript:p2pkh ', p2pkh)
    const encscript = btc.Script.encode(fromASM(p2pkh.join(' ')));
    const script = btc.OutScript.decode(encscript)
    console.log('encscript:p2pkh ', p2pkh)
    console.log('encscript:p2pkh ', encscript)
    console.log('encscript:p2pkh ', script.type)
    //const parsedScript = btc.OutScript.decode(script)
  })
})



const ouptutsOpDrop = [
    {
      value: 0.000005,
      n: 0,
      scriptPubKey: {
        asm: 'dc050000000000000038396333356330326363653335313163663437383137356165343134383638636530363162323062376237313739626361373936386563663332663232666432353634646435356665663230393539396334353631616564613532393839333339346533653165633730643435613634363136653731333864353833383065373031 OP_DROP OP_DUP OP_HASH160 74623170663734787230783537346661726a35357434686866767630767063396d70676572617361776d66357a6b3973756175636b756771647070716538 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '4c8bdc0500000000000000383963333563303263636533353131636634373831373561653431343836386365303631623230623762373137396263613739363865636633326632326664323536346464353566656632303935393963343536316165646135323938393333393465336531656337306434356136343631366537313338643538333830653730317576a93e74623170663734787230783537346661726a35357434686866767630767063396d70676572617361776d66357a6b3973756175636b75677164707071653888ac',
        type: 'nonstandard'
      }
    },
    {
      value: 0.036394,
      n: 1,
      scriptPubKey: {
        asm: '0 21b3817e5faa3d5a849ae47c37e203502a81fefe',
        hex: '001421b3817e5faa3d5a849ae47c37e203502a81fefe',
        address: 'tb1qyxeczljl4g744py6u37r0csr2q4grlh7yhp9km',
        type: 'witness_v0_keyhash'
      }
    }
]

const outputOpRet = [
{
  value: 0,
  n: 0,
  scriptPubKey: {
    asm: 'OP_RETURN c40900000000000000000061626264626332363035393535393931643638356566633530653034376634643532323134366137633462333638656135633762613837643939393439663365343463383362373331333836393134316264303464316263313636376262323066333830386636303061326438363633366166663439316561613430336435613030',
    hex: '6a4c8dc40900000000000000000061626264626332363035393535393931643638356566633530653034376634643532323134366137633462333638656135633762613837643939393439663365343463383362373331333836393134316264303464316263313636376262323066333830386636303061326438363633366166663439316561613430336435613030',
    type: 'nulldata'
  }
},
{
  value: 0.000005,
  n: 1,
  scriptPubKey: {
    asm: '1 4faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710',
    hex: '51204faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710',
    address: 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8',
    type: 'witness_v1_taproot'
  }
},
{
  value: 0.089972,
  n: 2,
  scriptPubKey: {
    asm: '1 4faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710',
    hex: '51204faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710',
    address: 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8',
    type: 'witness_v1_taproot'
  }
}]