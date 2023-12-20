const DAO_CONFIG_DEVNET = {
    VITE_DOA: 'executor-dao',
    VITE_DOA_DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    VITE_DOA_PROPOSAL: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edp016-enable-flexible-voting',
    VITE_DOA_PROPOSALS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.edp017-testnet-stacks-update',
    VITE_DOA_ACTIVE_VOTING_EXTENSIONS: 'ede007-snapshot-proposal-voting-v2,ede007-snapshot-proposal-voting-v5',
    VITE_DOA_SNAPSHOT_VOTING_EXTENSION: 'ede007-snapshot-proposal-voting-v5',
    VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'ede001-proposal-voting',
    VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'ede008-flexible-funded-submission',
    VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'ede004-emergency-execute',
    VITE_DOA_POX: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox-3',
}

const DAO_CONFIG_TESTNET = {
    VITE_DOA: 'executor-dao',
    VITE_DOA_DEPLOYER: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY',
    VITE_DOA_PROPOSAL: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.edp017-testnet-stacks-update',
    VITE_DOA_PROPOSALS: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.edp017-testnet-stacks-update',
    VITE_DOA_ACTIVE_VOTING_EXTENSIONS: 'ede007-snapshot-proposal-voting-v2,ede007-snapshot-proposal-voting-v5',
    VITE_DOA_SNAPSHOT_VOTING_EXTENSION: 'ede007-snapshot-proposal-voting-v5',
    VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'ede001-proposal-voting',
    VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'ede008-flexible-funded-submission',
    VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'ede004-emergency-execute',
    VITE_DOA_POX: 'ST000000000000000000002AMW42H.pox-3',
}

const DAO_CONFIG_MAINNET = {
    VITE_DOA_DEPLOYER: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z',
    VITE_DOA: 'executor-dao',
    VITE_DOA_PROPOSALS: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.edp017-testnet-stacks-update',
    VITE_DOA_PROPOSAL: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.edp017-testnet-stacks-update',
    VITE_DOA_ACTIVE_VOTING_EXTENSIONS: 'ede007-snapshot-proposal-voting-v2,ede007-snapshot-proposal-voting-v5',
    VITE_DOA_SNAPSHOT_VOTING_EXTENSION: 'ede007-snapshot-proposal-voting-v5',
    VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'ede001-proposal-voting',
    VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'ede008-flexible-funded-submission',
    VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'ede004-emergency-execute',
    VITE_DOA_POX: 'SP000000000000000000002Q6VF78.pox-3',
}
 
export let DAO_CONFIG = DAO_CONFIG_TESTNET;

export function setDaoConfig(network:string) {
    if (network.indexOf('mainnet') > -1) {
        network = 'mainnet'
        DAO_CONFIG = DAO_CONFIG_MAINNET;
    } else if (network.indexOf('devnet') > -1 || network.indexOf('devenv') > -1) {
        network = 'devnet'
        DAO_CONFIG = DAO_CONFIG_DEVNET;
    } else {
        network = 'testnet'
        DAO_CONFIG = DAO_CONFIG_TESTNET;
    } 
    if (process.env.daoProposals) {
        DAO_CONFIG.VITE_DOA_PROPOSALS = process.env.daoProposals
    }
    if (process.env.daoVotings) {
        DAO_CONFIG.VITE_DOA_ACTIVE_VOTING_EXTENSIONS = process.env.daoVotings
    }

}

export function getDaoConfig() {
    return DAO_CONFIG;
}
  
  