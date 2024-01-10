# SBTC SDK Documentation

Decentralised protocol for depositing and withdrawing bitcoin on the Stacks blockchain.

This library is intended to be used by app developers to build sBTC applications.

For more information on the sBTC project see;

- [sBTC.tech](https://sbtc.tech)
- [sBTC bridge web app](https://bridge.sbtc.tech?chain=testnet)
- [npm registry](https://www.npmjs.com/package/sbtc-bridge-lib)

## The sBTC Library Install

The sbtc-bridge-lib can be installed via npm registry;

```bash
npm install sbtc-bridge-lib
```

### Build & Publish

```bash
npm install sbtc-bridge-lib
npm install
npx tsc
npm publish
```

### The sBTC Library Modules

- deposit_utils.ts
- payload_utils.ts
- wallet_utils.ts
- withdraw_utils.ts

#### deposit_utils.ts

##### buildDepositTransaction

Builds the PSBT the user signs to initiate deposit via op_return

- @param network (testnet|mainnet)
- @param uiPayload:DepositPayloadUIType
- @param btcFeeRates current rates
- @param utxos the utxos to spend from - usually correspond to the utxo set from the web wallet payment address
- @param stacksAddress the stacks address to materialise sBTC
- @returns Transaction from @scure/btc-signer

##### buildDepositTransactionOpDrop

Builds the PSBT the user signs to initiate deposit via op_drop

- @param network
- @param uiPayload:DepositPayloadUIType
- @param btcFeeRates
- @param utxos the utxos to spend from - usually correspond to the utxo set from the web wallet payment address
- @param commitTxAddress - the commitment or funding address for the commit / reveal (op_drop) transactions
- @returns Transaction from @scure/btc-signer

#### withdraw_utils.ts

##### buildWithdrawTransaction

Builds the PSBT the user signs to initiate withdrawal via op_return

- @param network
- @param uiPayload:WithdrawPayloadUIType
- @param utxos the utxos to spend from - usually correspond to the utxo set from the web wallet payment address
- @param btcFeeRates
- @returns Transaction from @scure/btc-signer

##### buildWithdrawTransactionOpDrop

Builds the PSBT the user signs to initiate withdrawal via op_drop

- @param network (testnet|mainnet)
- @param uiPayload (WithdrawPayloadUIType)
- @param utxos the utxos to spend from - usually correspond to the utxo set from the web wallet payment address
- @param btcFeeRates
- @param originator - the originating users stacks address
- @returns Transaction from @scure/btc-signer

#### payload_utils.ts

##### buildDepositPayload

Builds the data to be transmitted in a deposit request

- @param network (testnet|mainnet)
- @param stacksAddress (address or contract principal)
- @returns string (hex encoded data)

##### buildDepositPayloadOpDrop

Builds the data to be transmitted in a deposit request via op_drop mechanism

- @param network (testnet|mainnet)
- @param stacksAddress (address or contract principal)
- @param revealFee (fee for the reveal transaction)
- @returns string (hex encoded data)

##### buildWithdrawPayload

Builds the data to be transmitted in a withdraw request

- @param network (testnet|mainnet)
- @param amount
- @param signature
- @returns Uint8Array

##### buildWithdrawPayloadOpDrop

Builds the data to be transmitted in a commit/reveal withdraw request

- @param network (testnet|mainnet)
- @param amount
- @param signature
- @returns string

##### parsePayloadFromTransaction

Takes raw transaction hex extracts the sBTC data and returns it in a PayloadType

- @param network
- @param txHex
- @returns PayloadType

##### getDataToSign

The data the user needs to sign to issue a withdrawal request

- @param network
- @param amount
- @param bitcoinAddress
- @returns Uint8Array

##### getStacksAddressFromSignature

- @param messageHash
- @param signature
- @returns string

##### toStorable

Converts taproot script and leaf data structure to hex for easy storage.

- @param script
- @returns CommitmentScriptDataType

##### fromStorable

Creates a deep clone of the taproot script path data.

- @param script
- @returns CommitmentScriptDataType

#### wallet_utils.ts

##### getAddressFromOutScript

getAddressFromOutScript converts a script to an address

- @param network:string
- @param script: Uint8Array
- @returns address as string

##### toXOnly

converts compressed public key to x-only form for schnorr compatibility

- @param pubkey
- @returns pubkey as string

##### getPegWalletAddressFromPublicKey

Converts the sBTC peg wallet public key to a taproot segwit v2 address.

- @param network
- @param sbtcWalletPublicKey
- @returns address as string

#### merkle_utils.ts

Adapted from [Medium article](https://medium.com/coinmonks/merkle-tree-a-simple-explanation-and-implementation-48903442bc08#:~:text=The%20use%20of%20Merkle%20Tree,block%20or%20the%20whole%20blockchain.)

##### getParametersForProof

- @param txIdNormal
- @param txHex
- @param block
- @returns TxMinedParameters

generateMerkleRoot calculates the merkle root of the passed in txid hashes

- @param {Array<string>} hashes
- @returns TxMinedParameters

generateMerkleTree calculates the merkle root of the passed in txid hashes

- @param {Array<string>} hashes
- @returns TxMinedParameters

generateMerkleProof calculates the merkle proof of the passed in txid and hashes

- @param {Array<string>} hash
- @param {Array<string>} hashes
- @returns TxMinedParameters
