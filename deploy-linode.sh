#!/bin/bash -e
#
############################################################

export SERVICE=$1
export DEPLOYMENT=$2
export PORT=22
export SERVER=popper.brightblock.org
if [ "$DEPLOYMENT" == "prod" ]; then
  SERVER=chomsky.brightblock.org;
  PORT=7019
fi
export DOCKER_ID_USER='mijoco'
export DOCKER_CMD='docker'

$DOCKER_CMD build -t mijoco/bridge_api sbtc-bridge-api
$DOCKER_CMD tag mijoco/bridge_api mijoco/bridge_api
$DOCKER_CMD push mijoco/bridge_api:latest

printf "\nConnecting to $SERVER.\n\n"

ssh -i ~/.ssh/id_rsa -p $PORT bob@$SERVER "
  cd /home/bob/hubgit/sbtc-bridge-api
  pwd
  #git pull
  # cp .env.production .env
  cat .env;
  docker login;
  docker pull mijoco/bridge_api;

  docker rm -f bridge_api_staging
  source /home/bob/.profile;
  docker run -d -t -i --name bridge_api_staging -p 3010:3010 \
  -e TARGET_ENV='linode-staging' \
  -e btcRpcUser=${BTC_RPC_USER} \
  -e btcRpcPwd=${BTC_RPC_PWD} \
  -e btcNode=${BTC_NODE} \
  -e mongoDbUrl=${MONGO_SBTC_URL} \
  -e mongoDbName=${MONGO_SBTC_DBNAME} \
  -e mongoUser=${MONGO_SBTC_USER} \
  -e mongoPwd=${MONGO_SBTC_PWD} \
  mijoco/bridge_api

  docker rm -f bridge_api_production
  source /home/bob/.profile;
  docker run -d -t -i --name bridge_api_production -p 3020:3010 \
  -e TARGET_ENV='production' \
  -e btcRpcUser=${BTC_RPC_USER} \
  -e btcRpcPwd=${BTC_RPC_PWD} \
  -e btcNode=${BTC_NODE} \
  -e mongoDbUrl=${MONGO_PROD_SBTC_URL} \
  -e mongoDbName=${MONGO_PROD_SBTC_DBNAME} \
  -e mongoUser=${MONGO_PROD_SBTC_USER} \
  -e mongoPwd=${MONGO_PROD_SBTC_PWD} \
  mijoco/bridge_api
";

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;
