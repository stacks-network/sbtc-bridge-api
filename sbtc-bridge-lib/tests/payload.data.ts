import type { BridgeTransactionType } from '../src/index';

export const commit1:BridgeTransactionType = {
  _id: ("6463863acdc2ba2dc1c6786d"),
  network: 'testnet',
  created: new Date().getTime(),
  updated: new Date().getTime(),
  uiPayload: {
    amountSats: 1000,
    principal: 'ST29N24XJPW2WRVF6S2JWBC3TJBGBA5EXPSC03Y0G',
    bitcoinAddress: 'tb1qxj5tpfsz836fyh5c3gfu2t9spjpzf924etnrsp',
    reclaimPublicKey: 'tb1qxj5tpfsz836fyh5c3gfu2t9spjpzf924etnrsp',
    paymentPublicKey: 'tb1qxj5tpfsz836fyh5c3gfu2t9spjpzf924etnrsp',
    sbtcWalletPublicKey: 'tb1p4m8lyp5m3tjfwq2288429rk7sxnp5xjqslxkvatkujtsr8kkxlgqu9r4cd',
  },
  status: 2,
  tries: 1,
  mode: 'op_drop',
  requestType: 'wrap',
  wallet: "p2tr(TAPROOT_UNSPENDABLE_KEY, [{ script: Script.encode([data, 'DROP', revealPubK, 'CHECKSIG']) }, { script: Script.encode([reclaimPubKey, 'CHECKSIG']) }], this.net, true)",
  originator: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
  stacksAddress: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5',
  sbtcWalletAddress: 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8',
  commitTxScript: {
    address: 'tb1psg523kqaf2x3thrg383hgvt2vpnezawk0dkefvums9h3pzy5vqgs5q6m96',
    script: '51208228a8d81d4a8d15dc6889e374316a60679175d67b6d94b39b816f1088946011',
    paymentType: 'tr',
    leaves: [
      {
        type: 'leaf',
        script: '203c1a7010183fd1a76976e7b2bb67acdf57cdfe704882000000001388000000007520264bd0d3bd80ea2da383b0a2a29f53d258e05904d2279f5f223053b987a3fd56ac',
        hash: 'e9dc05a0809c780e1b1a39a1b60cc5fbec3ac879a2e3f3c8aba4124a6f20201d',
        path: [
          'dd4f7547157ead8971b1bbecb08d1a523a458bf794fc5a3e788ad18bfb7a09f9'
        ],
        controlBlock: 'c050929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0dd4f7547157ead8971b1bbecb08d1a523a458bf794fc5a3e788ad18bfb7a09f9'
      },
      {
        type: 'leaf',
        script: '20836fbba6f27143d042c040331e1554ea1def354e6e3d58bdedb669f4a2dd68aaac',
        hash: 'dd4f7547157ead8971b1bbecb08d1a523a458bf794fc5a3e788ad18bfb7a09f9',
        path: [
          'e9dc05a0809c780e1b1a39a1b60cc5fbec3ac879a2e3f3c8aba4124a6f20201d'
        ],
        controlBlock: 'c050929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0e9dc05a0809c780e1b1a39a1b60cc5fbec3ac879a2e3f3c8aba4124a6f20201d'
      }
    ],
    tapInternalKey: '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
    tapLeafScript: [
      [
        {
          version: 192,
          internalKey: '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
          merklePath: [
            'dd4f7547157ead8971b1bbecb08d1a523a458bf794fc5a3e788ad18bfb7a09f9'
          ]
        },
        '203c1a7010183fd1a76976e7b2bb67acdf57cdfe704882000000001388000000007520264bd0d3bd80ea2da383b0a2a29f53d258e05904d2279f5f223053b987a3fd56acc0'
      ],
      [
        {
          version: 192,
          internalKey: '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
          merklePath: [
            'e9dc05a0809c780e1b1a39a1b60cc5fbec3ac879a2e3f3c8aba4124a6f20201d'
          ]
        },
        '20836fbba6f27143d042c040331e1554ea1def354e6e3d58bdedb669f4a2dd68aaacc0'
      ]
    ],
    tapMerkleRoot: '2943476902121eb80d5edc5dd36fbb7357817fc3f750112157b54e92ba2da905',
    tweakedPubkey: '8228a8d81d4a8d15dc6889e374316a60679175d67b6d94b39b816f1088946011'
  },
  updated: 1684244026379,
  btcTxid: 'bd38134b03a8b2072fba68ad013e2065df67b10f99fbbf3dea8c366b1c43b123',
  vout: {
    scriptpubkey: '51208228a8d81d4a8d15dc6889e374316a60679175d67b6d94b39b816f1088946011',
    scriptpubkey_asm: 'OP_PUSHNUM_1 OP_PUSHBYTES_32 8228a8d81d4a8d15dc6889e374316a60679175d67b6d94b39b816f1088946011',
    scriptpubkey_type: 'v1_p2tr',
    scriptpubkey_address: 'tb1psg523kqaf2x3thrg383hgvt2vpnezawk0dkefvums9h3pzy5vqgs5q6m96',
    value: 6555
  },
  revealPub: '',
  reclaimPub: ''
}