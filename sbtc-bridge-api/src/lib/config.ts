import { env } from "process";

const PORT = parseInt(env.PORT || '3010');

const TESTNET_CONFIG = {
  environment: 'staging',
  mongoDbUrl: '',
  mongoDbName: '',
  mongoUser: '',
  mongoPwd: '',
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  host: 'http://localhost',
  port: PORT,
  network: 'testnet',
  walletPath: '/wallet/SBTC-0003',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Testnet API',
  publicAppVersion: '1.0.0',
}

const MAINNET_CONFIG = {
  environment: 'production',
  mongoDbUrl: '',
  mongoDbName: '',
  mongoUser: '',
  mongoPwd: '',
  btcNode: 'bitcoind.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  host: 'http://localhost',
  port: PORT,
  network: 'mainnet',
  walletPath: '',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://api.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.co',
  bitcoinExplorerUrl: 'https://mempool.space/api',
  mempoolUrl: 'https://mempool.space/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/main',
  publicAppName: 'sBTC Bridge Mainnet API',
  publicAppVersion: '1.0.0',
}

const DEVNET_CONFIG = {
  environment: 'devnet',
  mongoDbUrl: '',
  mongoDbName: '',
  mongoUser: '',
  mongoPwd: '',
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem', 
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/descwallet',
  network: 'testnet',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Devnet API',
  publicAppVersion: '1.0.0',
}

const LINODE_CONFIG = {
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
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.hiro.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Staging API',
  publicAppVersion: '1.0.0',
}

let CONFIG: { mongoDbUrl: string; mongoUser: string; mongoPwd: string; mongoDbName: string; btcNode: string; btcRpcUser: string; btcRpcPwd: string; host: string; port: number; walletPath: string; network: string; sbtcContractId: string; stacksApi: string; stacksExplorerUrl: string; bitcoinExplorerUrl: string; mempoolUrl: string; blockCypherUrl: string; publicAppName: string; publicAppVersion: string; };

export function setConfigOnStart() {
	if (isDev()) CONFIG = DEVNET_CONFIG;
	else if (isLinode()) CONFIG = LINODE_CONFIG;
	else if (isTMTestnet()) CONFIG = TESTNET_CONFIG;
	else CONFIG = MAINNET_CONFIG;
  setOverrides();
}

function setOverrides() {
  if (isDev() || isLinode()) {
    // Not Trust Machines Kit - so override the btc connection params with platform values;
    if (process.env.mongoDbUrl) CONFIG.mongoDbUrl = process.env.mongoDbUrl;
    if (process.env.mongoDbName) CONFIG.mongoDbName = process.env.mongoDbName;
    if (process.env.mongoUser) CONFIG.mongoUser = process.env.mongoUser;
    if (process.env.mongoPwd) CONFIG.mongoPwd = process.env.mongoPwd;
    if (process.env.btcNode) CONFIG.btcNode = process.env.btcNode;
    if (process.env.btcRpcUser) CONFIG.btcRpcUser = process.env.btcRpcUser;
    if (process.env.btcRpcPwd) CONFIG.btcRpcPwd = process.env.btcRpcPwd;
  }
  if (isDev()) {
    //CONFIG.mongoUser = '';
    //CONFIG.mongoPwd = '';
    //CONFIG.mongoDbUrl = '';
    //CONFIG.mongoDbName = '';
    //CONFIG.btcNode = '';
    //CONFIG.btcRpcUser = '';
    //CONFIG.btcRpcPwd = '';
  }
}

function isDev() {
  const environ = process.env.TARGET_ENV;
  return (!environ || environ === 'test' || environ === 'development' || environ === 'dev')
}

function isLinode() {
  const environ = process.env.TARGET_ENV;
  return (environ && environ.indexOf('linode') > -1)
}

function isTMMainnet() {
  const environ = process.env.NODE_ENV;
  return ((!isLinode() || isDev()) && (environ === 'production' || environ === 'prod'))
}

function isTMTestnet() {
  const environ = process.env.NODE_ENV;
  return ((!isLinode() || isDev()) && (environ === 'staging' || environ === 'stag'))
}

/**
export function setConfig(search:string) {
	if (!search) setConfigOnStart();
	else if (search.indexOf('net=testnet') > -1) {

    if (isDev()) CONFIG = DEVNET_CONFIG;
    else if (isLinode()) CONFIG = LINODE_CONFIG;
    else CONFIG = TESTNET_CONFIG;
  }
	else if (search.indexOf('net=devnet') > -1) CONFIG = DEVNET_CONFIG;
	else CONFIG = MAINNET_CONFIG
  setOverrides();
}
 */

export function getConfig() {
  if (!CONFIG) setConfigOnStart();
	return CONFIG;
}