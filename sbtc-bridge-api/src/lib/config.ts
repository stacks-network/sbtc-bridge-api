import { ConfigI } from "../types/message";

let CONFIG= {} as ConfigI;

const LOCAL_REGTEST_CONFIG = {
  // api running n develop mode on localhost against local regetest
  mongoDbUrl: 'cluster0.kepjbx0.mongodb.net',
  mongoDbName: 'sbtc-bridge-simnet-db',
  mongoUser: 'dockerdev1',
  mongoPwd: 'FbKWBThNLIjqExG1',
  btcNode: '127.0.0.1:18332',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '',
  network: 'devnet',
  stacksApi: 'http://localhost:3999',
  stacksExplorerUrl: 'http://127.0.0.1:3020',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  electrumUrl: 'http://45.79.130.153:3002',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'UASU Staging API',
  publicAppVersion: '1.0.0',
}
const LOCAL_TESTNET_CONFIG = {
  // api running n develop mode on localhost against local testnet
  mongoDbUrl: 'cluster0.kepjbx0.mongodb.net',
  mongoDbName: 'sbtc-bridge-simnet-db',
  mongoUser: 'dockerdev1',
  mongoPwd: 'FbKWBThNLIjqExG1',
  btcNode: '127.0.0.1:18332',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/descwallet',
  network: 'testnet',
  //stacksApi: 'https://leibniz.brightblock.org',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.so/',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  electrumUrl: '',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'UASU Staging API',
  publicAppVersion: '1.0.0'
}

const LOCAL_NAKAMOTO_CONFIG = {
  // api running n develop mode on localhost against local testnet
  mongoDbUrl: 'cluster0.kepjbx0.mongodb.net',
  mongoDbName: 'sbtc-bridge-simnet-db',
  mongoUser: 'dockerdev1',
  mongoPwd: 'FbKWBThNLIjqExG1',
  btcNode: '127.0.0.1:18332',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/descwallet',
  network: 'testnet',
  //stacksApi: 'https://leibniz.brightblock.org',
  stacksApi: 'https://api.nakamoto.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.so/',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  electrumUrl: '',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'Nakamoto DAO API',
  publicAppVersion: '1.0.0'
}

const LOCAL_MAINNET_CONFIG = {
  // api running n develop mode on localhost against local testnet
  mongoDbUrl: 'cluster0.kepjbx0.mongodb.net',
  mongoDbName: 'sbtc-bridge-simnet-db',
  mongoUser: 'dockerdev1',
  mongoPwd: 'FbKWBThNLIjqExG1',
  btcNode: '127.0.0.1:18332',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/descwallet',
  network: 'mainnet',
  //stacksApi: 'https://leibniz.brightblock.org',
  stacksApi: 'https://api.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.so/',
  bitcoinExplorerUrl: 'https://mempool.space/==/api',
  mempoolUrl: 'https://mempool.space/api',
  electrumUrl: '',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc',
  publicAppName: 'UASU Staging API',
  publicAppVersion: '1.0.0'
}

const LOCAL_DEVENV_CONFIG = {
  mongoDbUrl: 'cluster0.kepjbx0.mongodb.net',
  mongoDbName: 'sbtc-bridge-simnet-db',
  mongoUser: 'dockerdev1',
  mongoPwd: 'FbKWBThNLIjqExG1',
  btcNode: '127.0.0.1:18332',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '',
  network: 'testnet',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'http://127.0.0.1:3020',
  bitcoinExplorerUrl: 'http://45.79.130.153:8083',
  mempoolUrl: 'http://45.79.130.153:8083/api',
  electrumUrl: 'http://45.79.130.153:3002',
  blockCypherUrl: 'http://45.79.130.153:8083/api',
  publicAppName: 'UASU Devenv API',
  publicAppVersion: '1.0.0',
} as ConfigI

export function setConfigOnStart() {
	if (isLocalTestnet()) CONFIG = LOCAL_TESTNET_CONFIG;
	else if (isLocalNakamoto()) CONFIG = LOCAL_NAKAMOTO_CONFIG;
	else if (isLocalMainnet()) CONFIG = LOCAL_MAINNET_CONFIG;
	else if (isLocalRegtest()) CONFIG = LOCAL_REGTEST_CONFIG;
	else if (isLocalDevenv()) CONFIG = LOCAL_DEVENV_CONFIG;
  setOverrides();
}

function setOverrides() {
  console.log('================================================ >> ' + process.env.NODE_ENV)
  CONFIG.poxContractId = 'ST000000000000000000002AMW42H.pox-3'
  CONFIG.pox4ContractId = 'ST000000000000000000002AMW42H.pox-4'
  CONFIG.signerVotingContractId = 'ST000000000000000000002AMW42H.signers-voting'
  CONFIG.signersContractId = 'ST000000000000000000002AMW42H.signers'
  CONFIG.sbtcContractId = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.asset-3'
  if (isLocalMainnet() || CONFIG.network === 'mainnet') {
    CONFIG.poxContractId = 'SP000000000000000000002Q6VF78.pox-3'
    CONFIG.pox4ContractId = 'SP000000000000000000002Q6VF78.pox-4'
    CONFIG.signerVotingContractId = 'SP000000000000000000002Q6VF78.signers-voting'
    CONFIG.signersContractId = 'SP000000000000000000002Q6VF78.signers'
    CONFIG.sbtcContractId = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.asset-3'
  }

  if (isLocalDevenv() || isLocalRegtest()) {
    // outside docker : config is provided by the application
    CONFIG.publicAppVersion = '1.0.0';
  } else if (isLocalTestnet() || isLocalMainnet() || isLocalNakamoto()) {
    //CONFIG.btcNode = 'localhost:18332'
    //CONFIG.poxContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox-3'
    //CONFIG.stacksApi = 'https://api.hiro.so'
  } else {
    // Params provided by local machne
    CONFIG.mongoDbUrl = process.env.mongoDbUrl || '';
    CONFIG.mongoDbName = process.env.mongoDbName || '';
    CONFIG.mongoUser = process.env.mongoUser || ''
    CONFIG.mongoPwd = process.env.mongoPwd || '';

    CONFIG.btcNode = process.env.btcNode || '';
    CONFIG.btcRpcUser = process.env.btcRpcUser || '';
    CONFIG.btcRpcPwd = process.env.btcRpcPwd || '';
    
    CONFIG.network = process.env.network || '';
    CONFIG.stacksApi = process.env.stacksApi || '';
    CONFIG.stacksExplorerUrl =  process.env.stacksExplorerUrl || '';
    CONFIG.bitcoinExplorerUrl = process.env.bitcoinExplorerUrl|| '';
    CONFIG.mempoolUrl = process.env.mempoolUrl || '';
    CONFIG.electrumUrl = process.env.electrumUrl || '';
    CONFIG.blockCypherUrl = process.env.blockCypherUrl || '';

    CONFIG.publicAppName = process.env.publicAppName || '';
    CONFIG.publicAppVersion = process.env.publicAppVersion || '';
    CONFIG.host = process.env.host || '';
    CONFIG.port = Number(process.env.port) || 3010;
    CONFIG.walletPath = process.env.walletPath || '';
  }


}

export function isDevenv() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'devenv')
}

export function isLocalDevenv() {
  const environ = process.env.NODE_ENV;
  return (environ === 'local-devenv')
}

export function isLocalRegtest() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'local-regtest')
}

export function isLocalTestnet() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'local-testnet')
}

export function isLocalNakamoto() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'local-nakamoto')
}

export function isLocalMainnet() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'local-mainnet')
}

export function isDev() {
  const environ = process.env.NODE_ENV;
  return (!environ || environ === 'test' || environ === 'development' || environ === 'dev')
}

export function getConfig() {
  if (!CONFIG || !CONFIG.btcNode) setConfigOnStart();
	return CONFIG;
}

export function printConfig() {
  console.log('== ' + process.env.NODE_ENV + ' ==========================================================')
  console.log('CONFIG.mongoDbUrl = ' + CONFIG.mongoDbUrl)
  console.log('CONFIG.mongoDbName = ' + CONFIG.mongoDbName)
  console.log('CONFIG.mongoUser = ' + CONFIG.mongoUser)
  console.log('CONFIG.mongoPwd = ' + CONFIG.mongoPwd.substring(0,2))
  console.log('CONFIG.btcNode = ' + CONFIG.btcNode)
  console.log('CONFIG.btcRpcUser = ' + CONFIG.btcRpcUser)
  console.log('CONFIG.host = ' + CONFIG.host)
  console.log('CONFIG.port = ' + CONFIG.port)
  console.log('CONFIG.walletPath = ' + CONFIG.walletPath)
  console.log('CONFIG.sbtcContractId = ' + CONFIG.sbtcContractId)
  console.log('CONFIG.pox4ContractId = ' + CONFIG.pox4ContractId)
  console.log('CONFIG.signersContractId = ' + CONFIG.signersContractId)
  console.log('CONFIG.signerVotingContractId = ' + CONFIG.signerVotingContractId)
  console.log('CONFIG.poxContractId = ' + CONFIG.poxContractId)
  console.log('CONFIG.stacksApi = ' + CONFIG.stacksApi)
  console.log('CONFIG.stacksApi = ' + CONFIG.stacksApi)
  console.log('CONFIG.bitcoinExplorerUrl = ' + CONFIG.bitcoinExplorerUrl)
  console.log('CONFIG.mempoolUrl = ' + CONFIG.mempoolUrl)
  console.log('CONFIG.blockCypherUrl = ' + CONFIG.blockCypherUrl)
  console.log('CONFIG.publicAppName = ' + CONFIG.publicAppName)
  console.log('CONFIG.publicAppVersion = ' + CONFIG.publicAppVersion)
}
