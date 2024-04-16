export type BurnBlock = {
    burn_block_time: number,
    burn_block_time_iso: string,
    burn_block_hash: string,
    burn_block_height: number,
    stacks_blocks: Array<string>
}
export type VoutRpc = {
    value: number,
    n: string,
    scriptPubKeyRpc: ScriptPubKeyRpc
}

export type Layer1TxPayload = {
    magic: string;
    opcode: string;
    opchar: string;
    payload: any;
}

export type ScriptPubKeyRpc = {
    asm: number,
    desc: string,
    hex: string,
    address: number,
    type: Array<string>
}

export type L1Output = {
    amountSats: number;
    address: string;
    type: string;
    change:boolean;
}

export type L1Input= {
    txId: string;
    vout: number;
    amountSats: number;
    address: string;
}

export type Layer1StacksTx = {
    name: string;
    blockHash: string;
    blockHeight: number;
    txId: string;
    outputs: Array<L1Output>;
    inputs: Array<L1Input>;
    payload:Layer1TxPayload;
    apiMissingBlock:boolean;
}

export type LeaderBlockCommit = {
    block_hash:string;
    new_seed:string;
    parent_block:string;
    parent_txoff:string;
    key_block:string;
    key_txoff:string;
    burn_parent_modulus:string;
}

export type LeaderVRFKeyRegistration = {
    consensus_hash:string;
    proving_public_key:string;
    memo:string;
}

export type MinerSignatureValidation = {
    consensus_hash:string;
    proving_public_key:string;
    miner_pk:string;
    memo:string;
}

export type UserSupportBurn = {
    consensus_hash:string;
    proving_public_key:string;
    block_hash_160:string;
    key_blk:string;
    key_vtxindex:string;
}
