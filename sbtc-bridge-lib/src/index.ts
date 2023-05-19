export {
    MAGIC_BYTES_TESTNET,
    parseDepositPayload,
    buildDepositPayload,
    buildWithdrawalPayload,
    amountToUint8,
    uint8ToAmount,
    parseSbtcWalletAddress,
    parseOutputs,
    readDepositValue
} from './payload_utils'

export {
    approxTxFees,
} from './transaction_utils'

export {
    sbtcWallets, 
    getTestAddresses,
    addressFromPubkey,
} from './wallet_utils'

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
    depositPayloadType
} from './types/sbtc_types'
