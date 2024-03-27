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
docker run -d -t -i --network host --name bridge_api_production -p 3010:3010 -e NODE_ENV='linode-production' -e mongoDbUrl=${SBTC_MONGO_URL} -e mongoDbName=${SBTC_MONGO_DBNAME} -e mongoUser=${SBTC_MONGO_USER} -e mongoPwd=${SBTC_MONGO_PWD} -e btcRpcUser=${SBTC_BTC_RPC_USER} -e btcRpcPwd=${SBTC_BTC_RPC_PWD}  -e btcNode=${SBTC_BTC_NODE} -e btcSchnorrReveal=${SBTC_BTC_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${SBTC_BTC_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${SBTC_BTC_SCHNORR_KEY_ORACLE} -e sbtcContractId=${SBTC_CONTRACT_ID} -e poxContractId=${POX_CONTRACT_ID} -e network=${SBTC_NETWORK} -e stacksApi=${SBTC_STACKS_API} -e stacksExplorerUrl=${SBTC_STACKS_EXPLORER_URL} -e bitcoinExplorerUrl=${SBTC_BITCOIN_EXPLORER_URL} -e mempoolUrl=${SBTC_BITCOIN_MEMPOOL_URL} -e blockCypherUrl=${SBTC_BITCOIN_BLOCKCYPHER_URL} -e publicAppVersion=${SBTC_PUBLIC_APP_VERSION} -e host=${SBTC_HOST} -e port=${SBTC_PORT} -e walletPath=${SBTC_WALLET_PATH} -e daoProposals=${SBTC_DOA_PROPOSALS} -e daoProposal=${SBTC_DOA_PROPOSAL} mijoco/bridge_api
```

```bash
# stag
docker rm -f bridge_api_staging
docker run -d -t -i --network host --name bridge_api_staging -p 3010:3010 -e NODE_ENV='linode-staging' -e mongoDbUrl=${SBTC_MONGO_URL} -e mongoDbName=${SBTC_MONGO_DBNAME} -e mongoUser=${SBTC_MONGO_USER} -e mongoPwd=${SBTC_MONGO_PWD} -e btcRpcUser=${SBTC_BTC_RPC_USER} -e btcRpcPwd=${SBTC_BTC_RPC_PWD}  -e btcNode=${SBTC_BTC_NODE} -e btcSchnorrReveal=${SBTC_BTC_SCHNORR_KEY_REVEAL} -e btcSchnorrReclaim=${SBTC_BTC_SCHNORR_KEY_RECLAIM} -e btcSchnorrOracle=${SBTC_BTC_SCHNORR_KEY_ORACLE} -e sbtcContractId=${SBTC_CONTRACT_ID} -e poxContractId=${POX_CONTRACT_ID} -e network=${SBTC_NETWORK} -e stacksApi=${SBTC_STACKS_API} -e stacksExplorerUrl=${SBTC_STACKS_EXPLORER_URL} -e bitcoinExplorerUrl=${SBTC_BITCOIN_EXPLORER_URL} -e mempoolUrl=${SBTC_BITCOIN_MEMPOOL_URL} -e blockCypherUrl=${SBTC_BITCOIN_BLOCKCYPHER_URL} -e publicAppVersion=${SBTC_PUBLIC_APP_VERSION} -e host=${SBTC_HOST} -e port=${SBTC_PORT} -e walletPath=${SBTC_WALLET_PATH} -e daoProposals=${SBTC_DOA_PROPOSALS} -e daoProposal=${SBTC_DOA_PROPOSAL} mijoco/bridge_api
```

## Swagger API Docs

See [bridge-api](https://mainnet.bridge.sbtc.tech/bridge-api/docs/#/)

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

docker run -d --rm --name postgres --net=stacks-blockchain -e POSTGRES_PASSWORD=postgres -v /mnt/bitcoin-testnet/stacks-testnet/postgres/postgresql/15/main:/var/lib/postgresql/data -p 5432:5432 postgres:alpine

docker run -d --rm --name stacks-blockchain-api --net=stacks-blockchain --env-file $(pwd)/.env -v $(pwd)/bns:/bns-data -p 3700:3700 -p 3999:3999 blockstack/stacks-blockchain-api

docker run -d --rm --name stacks-blockchain --net=stacks-blockchain -v /mnt/bitcoin-testnet/stacks-testnet:/root/stacks-node/data -v $(pwd)/config:/src/stacks-node -p 20443:20443 -p 20444:20444 blockstack/stacks-blockchain /bin/stacks-node start --config /src/stacks-node/Config.toml

docker run -d --rm --name stacks-blockchain-api --net=stacks-blockchain --env-file $(pwd)/.env -v $(pwd)/bns:/bns-data -p 5432:5432 -p 20443:20443 -p 20444:20444 -p 3700:3700 -p 3999:3999 blockstack/stacks-blockchain-api

## Comments on running full api node from restore

https://docs.hiro.so/hiro-archive

The section on restoring the API needs a link to the correct method to run the api. 

Don't rely on the v2/info end point. Also check a well known contract for [deployment](https://api.testnet.hiro.so/extended/v1/contract/ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.asset-3).

```bash
pg_restore --username=postgres --verbose --jobs=4 -d stacks_blockchain_api  /stacks-blockchain-api-pg-15-latest.dump
pg_restore: connecting to database for restore
Password:
pg_restore: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL:  database "stacks_blockchain_api" does not exist
```

Database command to create the db (note that the dump then tries and fails to create the db)?

```bash
CREATE DATABASE stacks_blockchain_api WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
```

Not clear what the database name should be when starting the api node in docker?

node ./lib/index.js import-events --file /mnt/bitcoin-testnet/stacks-testnet/archives/testnet-stacks-blockchain-api-7.8.2-20240322.tsv  --wipe-db --force
Error: UNDEFINED_VALUE: Undefined values are not allowed

PGDMP
|stacks_blockchain_api15.615.6N0ENCODINENCODINGSET client_encoding = 'UTF8';
false00
STDSTRINGS
STDSTRINGS(SET standard_conforming_strings = 'on';
false00
SEARCHPATH
SEARCHPATH8SELECT pg_catalog.set_config('search_path', '', false);
false126216384stacks_blockchain_apDATABASE�CREATE DATABASE stacks_blockchain_api WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
%DROP DATABASE stacks_blockchain_api;
postgresfalse00DATABASE stacks_blockchain_apiACLHREVOKE CONNECT,TEMPORARY ON DATABASE stacks_blockchain_api FROM PUBLIC;
postgresfalse384400stacks_blockchain_apiDATABASE PROPERTIESALTER DATABASE stacks_blockchain_api SET default_transaction_read_only TO 'off';
ALTER DATABASE stacks_blockchain_api SET search_path TO 'stacks_blockchain_api', 'public';
ALTER ROLE postgres IN DATABASE stacks_blockchain_api SET search_path TO 'stacks_blockchain_api', 'public';
postgresfalse00
pg_database_ownerfalse5261516389stacks_blockchain_apiSCHEMA%CREATE SCHEMA stacks_blockchain_api;
#DROP SCHEMA stacks_blockchain_api;

PGDM|stacks_blockchain_api15.215.6N�0ENCODINENCODINGSET client_encoding = 'UTF8';
false�00
STDSTRINGS
STDSTRINGS(SET standard_conforming_strings = 'on';
false�00
SEARCHPATH
SEARCHPATH8SELECT pg_catalog.set_config('search_path', '', false);
false�126216384stacks_blockchain_apDATABASE�CREATE DATABASE stacks_blockchain_api WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
%DROP DATABASE stacks_blockchain_api;
postgresfalse�00DATABASE stacks_blockchain_apiACLHREVOKE CONNECT,TEMPORARY ON DATABASE stacks_blockchain_api FROM PUBLIC;
postgresfalse3822�00stacks_blockchain_apiDATABASE PROPERTIESALTER DATABASE stacks_blockchain_api SET default_transaction_read_only TO 'off';
ALTER DATABASE stacks_blockchain_api SET search_path TO 'stacks_blockchain_api', 'public';
ALTER ROLE postgres IN DATABASE stacks_blockchain_api SET search_path TO 'stacks_blockchain_api', 'public';
postgresfalse�00
pg_database_ownerfalse5261516385stacks_blockchain_apiSCHEMA%CREATE SCHEMA stacks_blockchain_api;
#DROP SCHEMA stacks_blockchain_api;
postgresfalse�125916386blocksTABLE	CREATE TABLE stacks_blockchain_api.blocks (