import {config as configDotenv} from 'dotenv'
import {resolve} from 'path'

switch(process.env.NODE_ENV) {
    case "development":
      console.log("Environment is 'development'")
      configDotenv({
        path: resolve(__dirname, "../../.env")
      })
      break
    case "dev-docker":
      console.log("Environment is 'development'")
      configDotenv({
        path: resolve(__dirname, "../../.env")
      })
      break
    case "test":
      console.log("Environment is 'test'")
      configDotenv({
        path: resolve(__dirname, "../../../.env.test")
      })
      break
    case "staging":
      configDotenv({
        path: resolve(__dirname, "../../../.env.staging")
      })
      break
    // Add 'staging' and 'production' cases here as well!
    case "production":
        configDotenv({
          path: resolve(__dirname, "../../../.env.production")
        })
        break
      // Add 'staging' and 'production' cases here as well!  
    default:
      throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled!`)
}

export const host = process.env.VITE_HOST
export const port = process.env.VITE_PORT
export const mongoUrl = process.env.VITE_MONGO_URL
export const network = process.env.VITE_NETWORK
export const sbtcContractId = process.env.VITE_SBTC_CONTRACT_ID
export const stacksApi = process.env.VITE_STACKS_API
export const stacksExplorerUrl = process.env.VITE_STACKS_EXPLORER
export const bitcoinExplorerUrl = process.env.VITE_BITCOIN_EXPLORER
export const mempoolUrl = process.env.VITE_MEMPOOL_EXPLORER
export const blockCypherUrl = process.env.VITE_BLOCKCYPHER_EXPLORER
export const publicAppName = process.env.VITE_PUBLIC_APP_NAME
export const publicAppVersion = process.env.VITE_PUBLIC_APP_VERSION
export const btcRpcUser = process.env.BTC_RPC_USER
export const btcRpcPwd = process.env.BTC_RPC_PWD
export const btcNode = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev-docker') ? 'localhost:18332' : process.env.BTC_NODE

export function dumpConfig() {
  return {
    environment: process.env.NODE_ENV,
    host: host,
    port: port,
    mongoUrl: mongoUrl,
    network: network,
    sbtcContractId: sbtcContractId,
    stacksApi: stacksApi,
    stacksExplorerUrl: stacksExplorerUrl,
    bitcoinExplorerUrl: bitcoinExplorerUrl,
    mempoolUrl: mempoolUrl,
    blockCypherUrl: blockCypherUrl,
    publicAppName: publicAppName,
    publicAppVersion: publicAppVersion,
    btcRpcUser: btcRpcUser,
    btcNode: btcNode,
  }
}