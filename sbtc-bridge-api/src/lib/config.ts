import { ConfigI } from "../types/config";

let CONFIG= {} as ConfigI;

const LOCAL_DEVENV_CONFIG = {
  mongoDbUrl: 'cluster0.ovgne2s.mongodb.net',
  mongoDbName: 'uasu-db-dev',
  mongoUser: 'devuasu1',
  mongoPwd: 'FTNM7QpjqMHph4k7',
  btcNode: '96.126.107.204:18433',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  btcSchnorrReveal: 'd796ea3dd9d6cc91dac7ae254b111099acc7b640ce98b74c83975d26b7f49804',
  btcSchnorrReclaim: 'f32a129e799bacde2d451569e56598cdc56f83e0e8708303cc72d5852990b7d8',
  btcSchnorrOracle: 'f0e8dfde982fb06e26739502d92cdf433cc40036e120df45259fe590a3f043e3',
  host: 'http://localhost',
  port: 5010,
  walletPath: '',
  network: 'testnet',
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset',
  stacksApi: 'http://96.126.107.204:3999',
  stacksExplorerUrl: 'http://127.0.0.1:3020',
  bitcoinExplorerUrl: 'http://96.126.107.204:8083',
  mempoolUrl: 'http://96.126.107.204:8083/api',
  blockCypherUrl: 'http://96.126.107.204:8083/api',
  publicAppName: 'UASU Devenv API',
  publicAppVersion: '1.0.0',
} as ConfigI

const DEVENV_CONFIG = {
  environment: 'devenv',
  mongoDbUrl: 'cluster0.ovgne2s.mongodb.net',
  mongoDbName: 'uasu-db-dev',
  mongoUser: 'devuasu1',
  mongoPwd: 'FTNM7QpjqMHph4k7',
  btcNode: '96.126.107.204:18433',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet', 
  host: 'http://localhost',
  port: 3010,
  walletPath: '',
  network: 'devnet',
  stacksApi: 'http://96.126.107.204:3999',
  stacksExplorerUrl: 'http://96.126.107.204:3020',
  bitcoinExplorerUrl: 'http://96.126.107.204:8083',
  mempoolUrl: 'http://96.126.107.204:8083/api',
  blockCypherUrl: 'http://96.126.107.204:8083/api',
  publicAppName: 'UASU Devenv API',
  publicAppVersion: '1.0.0',
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset',
}

/**
const REGNET_CONFIG = {
  environment: 'devnet',
  mongoDbUrl: 'mongodb',
  mongoDbName: 'devnet',
  mongoUser: 'devnet',
  mongoPwd: 'devnet',
  btcNode: 'localhost:18443',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet',
  host: 'http://localhost', 
  port: PORT,
  network: 'devnet',
  walletPath: '',
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset',
  stacksApi: 'http://localhost:3999',
  stacksExplorerUrl: 'http://localhost:3020',
  bitcoinExplorerUrl: 'http://localhost:3002',
  mempoolUrl: 'http://localhost:8083/api',
  blockCypherUrl: 'http://localhost:8083/api',
  publicAppName: 'sBTC Bridge Simnet API',
  publicAppVersion: '1.0.0',
}
 */

const DEVNET_CONFIG = {
  environment: 'devnet',
  mongoDbUrl: '',
  mongoDbName: '',
  mongoUser: '',
  mongoPwd: '',
  btcNode: 'bitcoin',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet', 
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/descwallet',
  network: 'devnet',
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset',
  stacksApi: 'http://stacks-api:3999',
  stacksExplorerUrl: 'http://stacks-explorer:3020',
  bitcoinExplorerUrl: 'http://mempool-web:8083',
  mempoolUrl: 'http://mempool-web:8083/api',
  blockCypherUrl: 'http://mempool-web:8083/api',
  publicAppName: 'sBTC Bridge Devnet',
  publicAppVersion: '1.0.0',
}

const LINODE_TESTNET_CONFIG = {
  environment: 'staging',
  mongoDbUrl: '',
  mongoDbName: '',
  mongoUser: '',
  mongoPwd: '',
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/SBTC-0003',
  network: 'testnet',
  sbtcContractId: 'ST3ACFZ2XKFPKAFD9YY92ZP0Y4QN6MTX3H20C27NY.asset',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Staging API',
  publicAppVersion: '1.0.0',
}

const LINODE_MAINNET_CONFIG = {
  environment: 'production',
  mongoDbUrl: '',
  mongoDbName: '',
  mongoUser: '',
  mongoPwd: '',
  btcNode: '',
  btcRpcUser: '',
  btcRpcPwd: '',
  host: 'http://localhost',
  port: 3020,
  network: 'mainnet',
  walletPath: '/wallet/SBTC-0003',
  sbtcContractId: 'ST3ACFZ2XKFPKAFD9YY92ZP0Y4QN6MTX3H20C27NY.asset',
  stacksApi: 'https://api.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.co',
  bitcoinExplorerUrl: 'https://mempool.space/api',
  mempoolUrl: 'https://mempool.space/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/main',
  publicAppName: 'sBTC Bridge Mainnet API',
  publicAppVersion: '1.0.0',
}

export function setConfigOnStart() {
	if (isDev()) CONFIG = DEVNET_CONFIG;
  else if (isLocalTestnet()) CONFIG = LINODE_TESTNET_CONFIG;
	else if (isDevenv()) CONFIG = DEVENV_CONFIG;
	else if (isLinodeTestnet()) CONFIG = LINODE_TESTNET_CONFIG;
	else if (isLinodeMainnet()) CONFIG = LINODE_MAINNET_CONFIG;
	else CONFIG = LINODE_TESTNET_CONFIG;
  setOverrides();
}

function setOverrides() {
  console.log('================================================ >> ' + process.env.NODE_ENV)
  if (isDevenv()) {
    // localhost params not provided by docker environment
    CONFIG.mongoDbUrl = 'cluster0.kepjbx0.mongodb.net'
    CONFIG.mongoDbName = 'sbtc-bridge-simnet-db'
    CONFIG.mongoUser = 'dockerdev1'
    CONFIG.mongoPwd = 'FbKWBThNLIjqExG1'
    CONFIG.btcRpcUser = 'devnet'
    CONFIG.btcRpcPwd = 'devnet'
    // private keys for testing ability to sign PSBTs..
  } else if (isLocalTestnet()) {
    // localhost params not provided by docker environment
    CONFIG.mongoDbUrl = 'cluster0.kepjbx0.mongodb.net'
    CONFIG.mongoDbName = 'sbtc-bridge-simnet-db'
    CONFIG.mongoUser = 'dockerdev1'
    CONFIG.mongoPwd = 'FbKWBThNLIjqExG1'
    CONFIG.btcNode = 'http://localhost:18443' // ie not via docker network
    CONFIG.btcRpcUser = 'devnet'
    CONFIG.btcRpcPwd = 'devnet'
    // private keys for testing ability to sign PSBTs..
  } else if (isDev() || isLinodeTestnet() || isLinodeMainnet()) {
    // Params provided by local machne
    CONFIG.mongoDbUrl = process.env.mongoDbUrl || '';
    CONFIG.mongoDbName = process.env.mongoDbName || '';
    CONFIG.mongoUser = process.env.mongoUser || ''
    CONFIG.mongoPwd = process.env.mongoPwd || '';

    CONFIG.btcNode = process.env.btcNode || '';
    CONFIG.btcRpcUser = process.env.btcRpcUser || '';
    CONFIG.btcRpcPwd = process.env.btcRpcPwd || '';
    
    CONFIG.sbtcContractId = process.env.sbtcContractId || '';
    CONFIG.network = process.env.network || '';
    CONFIG.stacksApi = process.env.stacksApi || '';
    CONFIG.stacksExplorerUrl =  process.env.stacksExplorerUrl || '';
    CONFIG.bitcoinExplorerUrl = process.env.bitcoinExplorerUrl|| '';
    CONFIG.mempoolUrl = process.env.mempoolUrl || '';
    CONFIG.blockCypherUrl = process.env.blockCypherUrl || '';

    CONFIG.publicAppName = process.env.publicAppName || '';
    CONFIG.publicAppVersion = process.env.publicAppVersion || '';
    CONFIG.host = process.env.host || '';
    CONFIG.port = Number(process.env.port) || 3010;
    CONFIG.walletPath = process.env.walletPath || '';

  }
  if (isLocalTestnet()) {
    CONFIG.btcNode = 'localhost:18332' // ie not via docker network
  }
}

export function isDevenv() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'devenv')
}

export function isLocalTestnet() {
  const environ = process.env.NODE_ENV;
  return (environ && environ === 'local-testnet')
}

export function isDev() {
  const environ = process.env.NODE_ENV;
  return (!environ || environ === 'test' || environ === 'development' || environ === 'dev')
}

function isLinodeTestnet() {
  const environ = process.env.NODE_ENV;
  return (environ && environ.indexOf('linode-staging') > -1)
}

function isLinodeMainnet() {
  const environ = process.env.NODE_ENV;
  return (environ && environ.indexOf('linode-production') > -1)
}

export function getConfig() {
  if (!CONFIG) setConfigOnStart();
	return CONFIG;
}
