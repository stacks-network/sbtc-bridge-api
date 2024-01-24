# sBTC Bridge Service

Indexes and caches contract data to make the api client application faster
and more flexible.

API [documentation](https://mainnet.bridge.sbtc.tech/bridge-api/docs/).

## Development

To run the server in watch mode (nodemon) for rapid development;

```bash
cd sbtc-bridge-api
node -v
v19.7.0
npm install
npm run dev
```

Note: the dev script concurrently builds the [swagger docs](http://localhost:3010/docs) for
the application.

### Docker

To run the docker containers locally;

```bash
build -t mijoco/bridge_api sbtc-bridge-api
```

Note the build.sh tags and pushes the containers to mijoco docker hub. This will change for mainnet
deployment.

Alternatively, no docker hub, use docker compose directly..

### Bridge API

```bash
# stag
docker rm -f bridge_api_production
docker run -d -t -i --network host --name bridge_api_production -p 3010:3010 -e NODE_ENV='linode-production' -e mongoDbUrl=${SBTC_MONGO_URL} -e mongoDbName=${SBTC_MONGO_DBNAME} -e mongoUser=${SBTC_MONGO_USER} -e mongoPwd=${SBTC_MONGO_PWD} -e btcRpcUser=${SBTC_BTC_RPC_USER} -e btcRpcPwd=${SBTC_BTC_RPC_PWD}  -e btcNode=${SBTC_BTC_NODE} -e btcSchnorrReveal=${SBTC_BTC_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${SBTC_BTC_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${SBTC_BTC_SCHNORR_KEY_ORACLE} -e sbtcContractId=${SBTC_CONTRACT_ID} -e network=${SBTC_NETWORK} -e stacksApi=${SBTC_STACKS_API} -e stacksExplorerUrl=${SBTC_STACKS_EXPLORER_URL} -e bitcoinExplorerUrl=${SBTC_BITCOIN_EXPLORER_URL} -e mempoolUrl=${SBTC_BITCOIN_MEMPOOL_URL} -e blockCypherUrl=${SBTC_BITCOIN_BLOCKCYPHER_URL} -e publicAppVersion=${SBTC_PUBLIC_APP_VERSION} -e host=${SBTC_HOST} -e port=${SBTC_PORT} -e walletPath=${SBTC_WALLET_PATH} -e daoProposals=${SBTC_DOA_PROPOSALS} -e daoProposal=${SBTC_DOA_PROPOSAL} mijoco/bridge_api
```

```bash
# stag
docker rm -f bridge_api_staging
docker run -d -t -i --network host --name bridge_api_staging -p 3010:3010 -e NODE_ENV='linode-staging' -e mongoDbUrl=${SBTC_MONGO_URL} -e mongoDbName=${SBTC_MONGO_DBNAME} -e mongoUser=${SBTC_MONGO_USER} -e mongoPwd=${SBTC_MONGO_PWD} -e btcRpcUser=${SBTC_BTC_RPC_USER} -e btcRpcPwd=${SBTC_BTC_RPC_PWD}  -e btcNode=${SBTC_BTC_NODE} -e btcSchnorrReveal=${SBTC_BTC_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${SBTC_BTC_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${SBTC_BTC_SCHNORR_KEY_ORACLE} -e sbtcContractId=${SBTC_CONTRACT_ID} -e network=${SBTC_NETWORK} -e stacksApi=${SBTC_STACKS_API} -e stacksExplorerUrl=${SBTC_STACKS_EXPLORER_URL} -e bitcoinExplorerUrl=${SBTC_BITCOIN_EXPLORER_URL} -e mempoolUrl=${SBTC_BITCOIN_MEMPOOL_URL} -e blockCypherUrl=${SBTC_BITCOIN_BLOCKCYPHER_URL} -e publicAppVersion=${SBTC_PUBLIC_APP_VERSION} -e host=${SBTC_HOST} -e port=${SBTC_PORT} -e walletPath=${SBTC_WALLET_PATH} -e daoProposals=${SBTC_DOA_PROPOSALS} -e daoProposal=${SBTC_DOA_PROPOSAL} mijoco/bridge_api
```

## Swagger API Docs

See https://mainnet.bridge.sbtc.tech/bridge-api/docs/#/

## Deployment

Deployment builds, tags and pushes the images and then uses ssh to log on to remote server
and then pulls the images from docker hub;

This is automated using the deploy script;

```bash
./deploy-linode.sh
```

Note: requires docker hub access and ssh key registered on server. This will change when deployment
moves to Google Cloud.

## sBTC Wallet

The sBTC Wallet is a taproot wallet with addresses (most recent first);

- tb1pmmkznvm0pq5unp6geuwryu2f0m8xr6d229yzg2erx78nnk0ms48sk9s6q7
- tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8

## Production Deployment

Note: `docker-compose.yml` is used for production deployment.

- Local build and push of docker images
  - Local: Build and push the image
  ```
  DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build
  docker-compose push
  ```
- Build and install the helm chart
  `manual-ingress.yaml` is only non-generated yaml file.
  ```
  kompose convert --chart --out sbtc-bridge-api-chart
  helm upgrade sbtc-bridge-api sbtc-bridge-api-chart --install --namespace sbtc
  ```
- Inspect the Ingresses
  ```
  kubectl get ingress -n sbtc
  ```
  