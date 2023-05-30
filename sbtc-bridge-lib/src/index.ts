import {
    MAGIC_BYTES_TESTNET,
    MAGIC_BYTES_MAINNET,
    PEGIN_OPCODE,
    PEGOUT_OPCODE,
    parseDepositPayload,
    buildDepositPayload,
    buildWithdrawalPayload,
    parseWithdrawalPayload,
    amountToUint8,
    uint8ToAmount,
    getDataToSign,
    getStacksSimpleHashOfDataToSign,
    getStacksAddressFromSignature,
    parseSbtcWalletAddress,
    parseOutputs,
    readDepositValue,
    fromStorable,
    toStorable
} from './payload_utils.js'
export {
    MAGIC_BYTES_TESTNET,
    MAGIC_BYTES_MAINNET,
    PEGIN_OPCODE,
    PEGOUT_OPCODE,
    parseDepositPayload,
    buildDepositPayload,
    buildWithdrawalPayload,
    parseWithdrawalPayload,
    amountToUint8,
    uint8ToAmount,
    getDataToSign,
    getStacksSimpleHashOfDataToSign,
    getStacksAddressFromSignature,
    parseSbtcWalletAddress,
    parseOutputs,
    readDepositValue,
    fromStorable,
    toStorable
} 

import {
    approxTxFees,
} from './transaction_utils.js'
export {
    approxTxFees,
}

import {
    sbtcWallets, 
    getTestAddresses,
    addressFromPubkey,
} from './wallet_utils.js'
export {
    sbtcWallets, 
    getTestAddresses,
    addressFromPubkey,
}

import type {
    PeginRequestI, 
    PeginScriptI,
    VoutI,
    PegInData,
    CommitKeysI,
    AddressDetails,
    Message,
    SigData,
    SbtcContractDataI,
    AddressValidationI,
    SbtcBalance,
    UTXO,
    payloadType,
    withdrawalPayloadType,
    depositPayloadType,
    KeySet,
    WrappedPSBT
} from './types/sbtc_types.js'
export type {
    PeginRequestI, 
    PeginScriptI,
    VoutI,
    PegInData,
    CommitKeysI,
    AddressDetails,
    Message,
    SigData,
    SbtcContractDataI,
    AddressValidationI,
    SbtcBalance,
    UTXO,
    payloadType,
    withdrawalPayloadType,
    depositPayloadType,
    KeySet,
    WrappedPSBT
}
