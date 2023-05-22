#!/bin/bash -e
#
############################################################

export DOCKER_ID_USER='mijoco'
export DOCKER_CMD='docker'

$DOCKER_CMD build -t mijoco/bridge_api sbtc-bridge-api
$DOCKER_CMD tag mijoco/bridge_api mijoco/bridge_api
#$DOCKER_CMD push mijoco/bridge_api:latest

printf "\nConnecting to $SERVER.\n\n"

docker login;
#docker pull mijoco/bridge_api;

docker rm -f bridge_api
#source ~/.profile;
docker run -d -t -i --name bridge_api -p 3010:3010 \
  -e TARGET_ENV='development' \
  -e btcRpcUser=${BTC_RPC_USER} \
  -e btcRpcPwd=${BTC_RPC_PWD} \
  -e btcNode=${BTC_NODE} \
  -e mongoDbUrl=${MONGO_SBTC_URL} \
  -e mongoDbName=${MONGO_SBTC_DBNAME} \
  -e mongoUser=${MONGO_SBTC_USER} \
  -e mongoPwd=${MONGO_SBTC_PWD} \
  mijoco/bridge_api

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;

# docker run  -t -i --name bridge_api -p 3010:3010   -e TARGET_ENV='development'   -e btcRpcUser=${BTC_RPC_USER}   -e btcRpcPwd=${BTC_RPC_PWD}   -e btcNode=${BTC_NODE}   -e mongoDbUrl=${MONGO_SBTC_URL}   -e mongoDbName=${MONGO_SBTC_DBNAME}   -e mongoUser=${MONGO_SBTC_USER}   -e mongoPwd=${MONGO_SBTC_PWD}   mijoco/bridge_api