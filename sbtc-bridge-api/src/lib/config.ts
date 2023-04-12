import { env } from "process";

const TESTNET_CONFIG = {
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb.sbtc.svc.cluster.local:27017',
  dbNameTestnet: '/sbtc-testnet',
  dbNameMainnet: '/sbtc-mainnet',
  host: 'http://localhost',
  port: 3010,
  network: 'testnet',
  walletPath: '/wallet/SBTC-0003',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://api.testnet.hiro.so',
  stacksExplorerUrl: 'https://explorer.stacks.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Testnet API',
  publicAppVersion: '1.0.0',
}

const MAINNET_CONFIG = {
  btcNode: 'bitcoind.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb.sbtc.svc.cluster.local:27017',
  dbNameTestnet: '/sbtc-testnet',
  dbNameMainnet: '/sbtc-mainnet',
  host: 'http://localhost',
  port: 3010,
  network: 'mainnet',
  walletPath: '',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://api.hiro.so',
  stacksExplorerUrl: 'https://explorer.stacks.co',
  bitcoinExplorerUrl: 'https://mempool.space/api',
  mempoolUrl: 'https://mempool.space/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/main',
  publicAppName: 'sBTC Bridge Mainnet API',
  publicAppVersion: '1.0.0',
}

const DEVNET_CONFIG = {
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb:27017',
  dbNameTestnet: '/sbtc',
  dbNameMainnet: '/sbtc-mainnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/watcher-22',
  network: 'testnet',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://stacks-node-api.testnet.stacks.co',
  stacksExplorerUrl: 'https://explorer.stacks.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Devnet API',
  publicAppVersion: '1.0.0',
}

const LINODE_CONFIG = {
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb:27017',
  dbNameTestnet: '/sbtc',
  dbNameMainnet: '/sbtc-mainnet',
  host: 'http://localhost',
  port: 3010,
  walletPath: '/wallet/SBTC-0003',
  network: 'testnet',
  sbtcContractId: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant',
  stacksApi: 'https://stacks-node-api.testnet.stacks.co',
  stacksExplorerUrl: 'https://explorer.stacks.co',
  bitcoinExplorerUrl: 'https://mempool.space/testnet/api',
  mempoolUrl: 'https://mempool.space/testnet/api',
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/test3',
  publicAppName: 'sBTC Bridge Staging API',
  publicAppVersion: '1.0.0',
}

let CONFIG: { btcNode: string; btcRpcUser: string; btcRpcPwd: string; mongoUrl: string; dbNameTestnet: string; dbNameMainnet: string; host: string; port: number; walletPath: string; network: string; sbtcContractId: string; stacksApi: string; stacksExplorerUrl: string; bitcoinExplorerUrl: string; mempoolUrl: string; blockCypherUrl: string; publicAppName: string; publicAppVersion: string; };

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
    if (process.env.btcNode) CONFIG.btcNode = process.env.btcNode;
    if (process.env.btcRpcUser) CONFIG.btcRpcUser = process.env.btcRpcUser;
    if (process.env.btcRpcPwd) CONFIG.btcRpcPwd = process.env.btcRpcPwd;
  }
}

function isDev() {
  const environ = process.env.NODE_ENV;
  return (!environ || environ === 'test' || environ === 'development' || environ === 'dev')
}

function isLinode() {
  const environ = process.env.NODE_ENV;
  return (environ && environ.indexOf('linode') > -1)
}

function isTMMainnet() {
  const environ = process.env.NODE_ENV;
  return (environ === 'production' || environ === 'prod')
}

function isTMTestnet() {
  const environ = process.env.NODE_ENV;
  return (environ === 'staging' || environ === 'stag')
}

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

export function getConfig() {
  if (!CONFIG) setConfigOnStart();
	return CONFIG;
}