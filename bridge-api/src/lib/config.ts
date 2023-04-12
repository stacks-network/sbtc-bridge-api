import type { IStringToStringDictionary } from '../controllers/ConfigController.js';

const TESTNET_CONFIG = {
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb.sbtc.svc.cluster.local:27017/sbtc-testnet',
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
  publicAppName: 'SBTC Bridge Testnet API',
  publicAppVersion: '1.0.0',
}

const MAINNET_CONFIG = {
  btcNode: 'bitcoind.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb.sbtc.svc.cluster.local:27017/sbtc-mainnet',
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
  publicAppName: 'SBTC Bridge Mainnet API',
  publicAppVersion: '1.0.0',
}

const DEVNET_CONFIG = {
  btcNode: 'bitcoind.testnet.stacks.co',
  btcRpcUser: 'blockstack',
  btcRpcPwd: 'blockstacksystem',
  mongoUrl: 'mongodb://mongodb:27017/sbtc',
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
  publicAppName: 'SBTC Bridge Devnet API',
  publicAppVersion: '1.0.0',
}

export let CONFIG = MAINNET_CONFIG;

export function setConfig(search:string) {
	if (search.indexOf('net=testnet') > -1) CONFIG = TESTNET_CONFIG;
	else if (search.indexOf('net=devnet') > -1) CONFIG = DEVNET_CONFIG;
	else CONFIG = MAINNET_CONFIG
}

export function dumpConfig():IStringToStringDictionary {
  return CONFIG;
}