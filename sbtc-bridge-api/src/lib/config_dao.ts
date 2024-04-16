const DAO_CONFIG_DEVNET = {
    VITE_DOA: 'bitcoin-dao',
    VITE_DOA_DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    VITE_DOA_PROPOSAL: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bdp000-bootstrap',
    VITE_DOA_PROPOSALS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bdp000-bootstrap',
    VITE_DOA_SNAPSHOT_VOTING_EXTENSION: 'bde007-snapshot-proposal-voting',
    VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'bde007-snapshot-proposal-voting',
    VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'bde008-flexible-funded-submission',
    VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'bde004-emergency-execute',
    VITE_DOA_POX: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox-3',
}

const DAO_CONFIG_TESTNET = {
    VITE_DOA: 'bitcoin-dao',
    VITE_DOA_DEPLOYER: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY',
    VITE_DOA_PROPOSAL: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY.bdp000-bootstrap',
    VITE_DOA_PROPOSALS: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY.bdp000-bootstrap',
    VITE_DOA_SNAPSHOT_VOTING_EXTENSION: 'bde007-snapshot-proposal-voting',
    VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'bde007-snapshot-proposal-voting',
    VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'bde008-flexible-funded-submission',
    VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'bde004-emergency-execute',
    VITE_DOA_POX: 'ST000000000000000000002AMW42H.pox-3',
}

const DAO_CONFIG_MAINNET = {
    VITE_DOA_DEPLOYER: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z',
    VITE_DOA: 'bitcoin-dao',
    VITE_DOA_PROPOSALS: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.bdp000-bootstrap',
    VITE_DOA_PROPOSAL: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.bdp000-bootstrap',
    VITE_DOA_SNAPSHOT_VOTING_EXTENSION: 'bde007-snapshot-proposal-voting',
    VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'bde007-snapshot-proposal-voting',
    VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'bde008-flexible-funded-submission',
    VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'bde004-emergency-execute',
    VITE_DOA_POX: 'SP000000000000000000002Q6VF78.pox-3',
}
 
export let DAO_CONFIG = DAO_CONFIG_TESTNET;

export function setDaoConfig(network:string) {
	if (isLocalTestnet()) {
        DAO_CONFIG = DAO_CONFIG_MAINNET;
        return
    } else if (isLocalMainnet()) {
        DAO_CONFIG = DAO_CONFIG_MAINNET;
        return
    }
  
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
    if (process.env.daoProposal) {
        DAO_CONFIG.VITE_DOA_PROPOSAL = process.env.daoProposal
    }
    if (process.env.daoProposals) {
        DAO_CONFIG.VITE_DOA_PROPOSALS = process.env.daoProposals
    }
}

export function getDaoConfig() {
    return DAO_CONFIG;
}
  
export function printDaoConfig() {
    console.log('== ' + process.env.NODE_ENV + ' ==========================================================')
    console.log('DOA_PROPOSAL = ' + DAO_CONFIG.VITE_DOA_PROPOSAL);
    console.log('DOA_PROPOSALS = ' + DAO_CONFIG.VITE_DOA_PROPOSALS);
    console.log('DOA_DEPLOYER = ' + DAO_CONFIG.VITE_DOA_DEPLOYER);
    console.log('DOA_SNAPSHOT_VOTING_EXTENSION = ' + DAO_CONFIG.VITE_DOA_SNAPSHOT_VOTING_EXTENSION);
    console.log('DOA_PROPOSAL_VOTING_EXTENSION = ' + DAO_CONFIG.VITE_DOA_PROPOSAL_VOTING_EXTENSION);
    console.log('DOA_FUNDED_SUBMISSION_EXTENSION = ' + DAO_CONFIG.VITE_DOA_FUNDED_SUBMISSION_EXTENSION);
    console.log('DOA_POX = ' + DAO_CONFIG.VITE_DOA_POX);
  }
  
  export function isLocalMainnet() {
    const environ = process.env.NODE_ENV;
    return (environ && environ === 'local-mainnet')
  }
  export function isLocalTestnet() {
    const environ = process.env.NODE_ENV;
    return (environ && environ === 'local-testnet')
  }
  
  