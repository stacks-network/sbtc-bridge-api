#!/bin/bash -e
#
############################################################

export DOCKER_ID_USER='mijoco'
export DOCKER_CMD='docker'

$DOCKER_CMD build -t mijoco/signer_api sbtc-signer-api
$DOCKER_CMD tag mijoco/signer_api mijoco/signer_api
#$DOCKER_CMD push mijoco/signer_api:latest

printf "\nConnecting to $SERVER.\n\n"

docker login;
#docker pull mijoco/signer_api;

docker rm -f signer_api
#source ~/.profile;
docker run -d -t -i --name signer_api -p 4030:4030 \
  -e TARGET_ENV='development' \
  -e btcSchnorrReveal=${SIG_BTC_SCHNORR_KEY_REVEAL} \
  -e btcSchnorrReclaim=${SIG_BTC_SCHNORR_KEY_RECLAIM} \
  -e btcSchnorrOracle=${SIG_BTC_SCHNORR_KEY_ORACLE} \
  -e btcRpcUser=${SIG_BTC_RPC_USER} \
  -e btcRpcUser=${SIG_BTC_RPC_USER} \
  -e btcRpcPwd=${SIG_BTC_RPC_PWD} \
  -e btcNode=${SIG_BTC_NODE} \
  -e mongoDbUrl=${SIG_MONGO_SBTC_URL} \
  -e mongoDbName=${SIG_MONGO_SBTC_DBNAME} \
  -e mongoUser=${SIG_MONGO_SBTC_USER} \
  -e mongoPwd=${SIG_MONGO_SBTC_PWD} \
  mijoco/signer_api

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;

# docker rm -f signer_api
# docker run  -t -i --name signer_api -p 4030:4030   -e TARGET_ENV='development'   -e btcRpcUser=${SIG_BTC_RPC_USER}   -e btcRpcPwd=${SIG_BTC_RPC_PWD}   -e btcNode=${SIG_BTC_NODE}   -e mongoDbUrl=${SIG_MONGO_SBTC_URL}   -e mongoDbName=${SIG_MONGO_SBTC_DBNAME}   -e mongoUser=${SIG_MONGO_SBTC_USER}   -e mongoPwd=${SIG_MONGO_SBTC_PWD}   mijoco/signer_api