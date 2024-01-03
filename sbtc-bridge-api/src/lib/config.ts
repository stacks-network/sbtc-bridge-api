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
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset-3',
  stacksApi: 'http://localhost:3999',
  stacksExplorerUrl: 'http://127.0.0.1:3020',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  electrumUrl: 'http://45.79.130.153:3002',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  btcSchnorrReveal: 'd796ea3dd9d6cc91dac7ae254b111099acc7b640ce98b74c83975d26b7f49804',
  btcSchnorrReclaim: 'f32a129e799bacde2d451569e56598cdc56f83e0e8708303cc72d5852990b7d8',
  btcSchnorrOracle: 'f0e8dfde982fb06e26739502d92cdf433cc40036e120df45259fe590a3f043e3',
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
  btcSchnorrReveal: '8854e0f3b4979edc55330722626ce4e12f67ef89f0ac00032d18e6da3a2dc60b',
  btcSchnorrReclaim: '1eba17807c82b0aa676b85839ea84663ceb6fbbfb3e0a23a2bdae9cd3df096cb',
  btcSchnorrOracle: '8181ea91f5f8e9273dc333e04abefa06ac942d85a4081684ccf3534884a66f8c',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/descwallet',
  network: 'testnet',
  sbtcContractId: 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.asset-3',
  //stacksApi: 'http://45.79.131.55:3999',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.so/',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  electrumUrl: '',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
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
  btcSchnorrReveal: 'd796ea3dd9d6cc91dac7ae254b111099acc7b640ce98b74c83975d26b7f49804',
  btcSchnorrReclaim: 'f32a129e799bacde2d451569e56598cdc56f83e0e8708303cc72d5852990b7d8',
  btcSchnorrOracle: 'f0e8dfde982fb06e26739502d92cdf433cc40036e120df45259fe590a3f043e3',
  host: 'http://localhost',
  port: 3010,
  walletPath: '',
  network: 'testnet',
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset',
  //stacksApi: 'http://45.79.130.153:3999',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'http://127.0.0.1:3020',
  bitcoinExplorerUrl: 'http://45.79.130.153:8083',
  mempoolUrl: 'http://45.79.130.153:8083/api',
  electrumUrl: 'http://45.79.130.153:3002',
  blockCypherUrl: 'http://45.79.130.153:8083/api',
  publicAppName: 'UASU Devenv API',
  publicAppVersion: '1.0.0',
} as ConfigI

/**
const DEVENV_CONFIG = {
  environment: 'devenv',
  mongoDbUrl: 'cluster0.ovgne2s.mongodb.net',
  mongoDbName: 'uasu-db-dev',
  mongoUser: 'devuasu1',
  mongoPwd: 'FTNM7QpjqMHph4k7',
  btcNode: '45.79.130.153:18433',
  btcRpcUser: 'devnet',
  btcRpcPwd: 'devnet', 
  host: 'http://localhost',
  port: 3010,
  walletPath: '',
  network: 'devnet',
  sbtcContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.asset',
  stacksApi: 'http://45.79.130.153:3999',
  stacksExplorerUrl: 'http://45.79.130.153:3020',
  bitcoinExplorerUrl: 'http://45.79.130.153:8083',
  mempoolUrl: 'http://45.79.130.153:8083/api',
  blockCypherUrl: 'http://45.79.130.153:8083/api',
  publicAppName: 'UASU Devenv API',
  publicAppVersion: '1.0.0',
}

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
 */


export function setConfigOnStart() {
	if (isLocalTestnet()) CONFIG = LOCAL_TESTNET_CONFIG;
	else if (isLocalRegtest()) CONFIG = LOCAL_REGTEST_CONFIG;
	else if (isLocalDevenv()) CONFIG = LOCAL_DEVENV_CONFIG;
  setOverrides();
}

function setOverrides() {
  console.log('================================================ >> ' + process.env.NODE_ENV)
  if (isLocalDevenv() || isLocalRegtest()) {
    // outside docker : config is provided by the application
    CONFIG.publicAppVersion = '1.0.0';
  } else if (isLocalTestnet()) {
    //CONFIG.btcNode = 'localhost:18332'
    CONFIG.btcNode = 'localhost:18332'
  } else {
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
  console.log('CONFIG.mongoDbName = ' + CONFIG.mongoDbName)
  console.log('CONFIG.mongoUser = ' + CONFIG.mongoUser)
  console.log('CONFIG.mongoPwd = ' + CONFIG.mongoPwd.substring(0,2))
  console.log('CONFIG.btcNode = ' + CONFIG.btcNode)
  console.log('CONFIG.btcRpcUser = ' + CONFIG.btcRpcUser)
  console.log('CONFIG.host = ' + CONFIG.host)
  console.log('CONFIG.port = ' + CONFIG.port)
  console.log('CONFIG.walletPath = ' + CONFIG.walletPath)
  console.log('CONFIG.sbtcContractId = ' + CONFIG.sbtcContractId)
  console.log('CONFIG.stacksApi = ' + CONFIG.stacksApi)
  console.log('CONFIG.bitcoinExplorerUrl = ' + CONFIG.bitcoinExplorerUrl)
  console.log('CONFIG.mempoolUrl = ' + CONFIG.mempoolUrl)
  console.log('CONFIG.blockCypherUrl = ' + CONFIG.blockCypherUrl)
  console.log('CONFIG.publicAppName = ' + CONFIG.publicAppName)
  console.log('CONFIG.publicAppVersion = ' + CONFIG.publicAppVersion)
}
