
export type StackerDbConfig = {
    chunkSize: number,
    hintReplicas: Array<any>,
    maxNeighbors: number,
    maxWrites: number,
    writeFreq: number,
}

export type CycleSignerSet = {
    signers: Array<CycleSignerSetElement>,
}

export type CycleSignerSetElement = {
    signer: string, 
    weight: number,
}

export type VerifySignerKey = {
    authId: number,
    amount: number,
    maxAmount: number,
    rewardCycle: number,
    period: number,
    topic: string;
    rewardAddress: string;
    signerSignature: string;
    signerKey: string;
}                                        
