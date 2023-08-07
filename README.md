# sBTC Bridge Service

Indexes and caches contract data to make the api client application faster
and more flexible.

API documentation (swagger docs) is available at /docs.

## Development

To run the server in watch mode (nodemon) for rapid development;

```bash
cd sbtc-bridge-api
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
# prod
docker rm -f bridge_api_production
docker run -d -t -i --network host --name bridge_api_production -p 3020:3020 -e TARGET_ENV='linode-production' -e btcSchnorrReveal=${BTC_PROD_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${BTC_PROD_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${BTC_PROD_SCHNORR_KEY_ORACLE} -e btcRpcUser=${BTC_PROD_RPC_USER} -e btcRpcPwd=${BTC_PROD_RPC_PWD} -e btcNode=${BTC_PROD_NODE} -e mongoDbUrl=${MONGO_PROD_SBTC_URL} -e mongoDbName=${MONGO_PROD_SBTC_DBNAME} -e mongoUser=${MONGO_PROD_SBTC_USER} -e mongoPwd=${MONGO_PROD_SBTC_PWD} mijoco/bridge_api
```

```bash
# stag
docker rm -f bridge_api_staging
docker run -d -t -i --network host --name bridge_api_staging -p 3010:3010 -e TARGET_ENV='linode-staging' -e btcSchnorrReveal=${BTC_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${BTC_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${BTC_SCHNORR_KEY_ORACLE} -e btcRpcUser=${BTC_RPC_USER} -e btcRpcPwd=${BTC_RPC_PWD} -e btcNode=${BTC_NODE} -e mongoDbUrl=${MONGO_SBTC_URL} -e mongoDbName=${MONGO_SBTC_DBNAME} -e mongoUser=${MONGO_SBTC_USER} -e mongoPwd=${MONGO_SBTC_PWD} mijoco/bridge_api
```

### Signer API

```bash
# prod
docker rm -f signer_api_production
docker run -d -t -i --network host --name signer_api_production -p 3020:3020 -e TARGET_ENV='linode-production' -e btcSchnorrReveal=${SIG_BTC_PROD_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${SIG_BTC_PROD_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${SIG_BTC_PROD_SCHNORR_KEY_ORACLE} -e btcRpcUser=${SIG_BTC_PROD_RPC_USER} -e btcRpcPwd=${SIG_BTC_PROD_RPC_PWD} -e btcNode=${SIG_BTC_PROD_NODE} -e mongoDbUrl=${SIG_MONGO_PROD_SBTC_URL} -e mongoDbName=${SIG_MONGO_PROD_SBTC_DBNAME} -e mongoUser=${SIG_MONGO_PROD_SBTC_USER} -e mongoPwd=${SIG_MONGO_PROD_SBTC_PWD} mijoco/signer_api
```

```bash
# stag
docker rm -f signer_api_staging
docker run -d -t -i --network host --name signer_api_staging -p 4010:4010 -e TARGET_ENV='linode-staging' -e btcSchnorrReveal=${SIG_BTC_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${SIG_BTC_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${SIG_BTC_SCHNORR_KEY_ORACLE} -e btcRpcUser=${SIG_BTC_RPC_USER} -e btcRpcPwd=${SIG_BTC_RPC_PWD} -e btcNode=${SIG_BTC_NODE} -e mongoDbUrl=${SIG_MONGO_SBTC_URL} -e mongoDbName=${SIG_MONGO_SBTC_DBNAME} -e mongoUser=${SIG_MONGO_SBTC_USER} -e mongoPwd=${SIG_MONGO_SBTC_PWD} mijoco/signer_api
```

## Swagger API Docs

See https://bridge.stx.eco/bridge-api/docs/#/

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