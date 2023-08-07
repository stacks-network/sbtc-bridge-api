#!/bin/bash -e
#
############################################################

export DEPLOYMENT=$1
#export PORT=22
#export SERVER=popper.brightblock.org
export PORT=7019
export SERVER=chomsky.brightblock.org
export DOCKER_NAME=alpha_api_staging
export TARGET_ENV=linode-staging
if [ "$DEPLOYMENT" == "prod" ]; then
  #SERVER=chomsky.brightblock.org;
  DOCKER_NAME=alpha_api_production
  TARGET_ENV=linode-production
  PORT=7019
fi
export DOCKER_ID_USER='mijoco'
export DOCKER_CMD='docker'

$DOCKER_CMD build -t mijoco/alpha_api sbtc-bridge-api
$DOCKER_CMD tag mijoco/alpha_api mijoco/alpha_api
$DOCKER_CMD push mijoco/alpha_api:latest

printf "\nConnecting to: $SERVER.\n\n"
printf "\nDeploying docker container: $DOCKER_NAME.\n\n"

if [ "$DEPLOYMENT" == "prod" ]; then
  ssh -i ~/.ssh/id_rsa -p $PORT bob@$SERVER "
    cd /home/bob/hubgit/sbtc-bridge-api
    pwd
    cat .env;
    docker login;
    docker pull mijoco/alpha_api;

    docker rm -f ${DOCKER_NAME}
    source /home/bob/.profile;
    docker run -d -t -i --network host --name ${DOCKER_NAME} -p 7020:7020 \
      -e TARGET_ENV=linode-production \
      -e btcSchnorrReveal=${BTC_PROD_SCHNORR_KEY_REVEAL} \
      -e btcSchnorrReclaim=${BTC_PROD_SCHNORR_KEY_RECLAIM} \
      -e btcRpcUser=${BTC_PROD_RPC_USER} \
      -e btcRpcPwd=${BTC_PROD_RPC_PWD} \
      -e btcNode=${BTC_PROD_NODE} \
      -e mongoDbUrl=${MONGO_PROD_SBTC_URL} \
      -e mongoDbName=${MONGO_PROD_SBTC_DBNAME} \
      -e mongoUser=${MONGO_PROD_SBTC_USER} \
      -e mongoPwd=${MONGO_PROD_SBTC_PWD} \
      mijoco/alpha_api
  ";
else 
  ssh -i ~/.ssh/id_rsa -p $PORT bob@$SERVER "
    cd /home/bob/hubgit/sbtc-bridge-api
    pwd
    cat .env;
    docker login;
    docker pull mijoco/alpha_api;

    docker rm -f ${DOCKER_NAME}
    source /home/bob/.profile;
    docker run -d -t -i --network host --name ${DOCKER_NAME} -p 7010:7010 \
      -e TARGET_ENV=linode-staging \
      -e btcSchnorrReveal=${BTC_SCHNORR_KEY_REVEAL} \
      -e btcSchnorrReclaim=${BTC_SCHNORR_KEY_RECLAIM} \
      -e btcRpcUser=${BTC_RPC_USER} \
      -e btcRpcPwd=${BTC_RPC_PWD} \
      -e btcNode=${BTC_NODE} \
      -e mongoDbUrl=${MONGO_SBTC_URL} \
      -e mongoDbName=${MONGO_SBTC_DBNAME} \
      -e mongoUser=${MONGO_SBTC_USER} \
      -e mongoPwd=${MONGO_SBTC_PWD} \
      mijoco/alpha_api
  ";
fi

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;

