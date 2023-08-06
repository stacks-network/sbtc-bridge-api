#!/bin/bash -e
#
############################################################

export DEPLOYMENT=$1
#export PORT=22
#export SERVER=popper.brightblock.org
export PORT=7019
export SERVER=chomsky.brightblock.org
export DOCKER_NAME=signer_api_staging
export TARGET_ENV=linode-staging
if [ "$DEPLOYMENT" == "prod" ]; then
  #SERVER=chomsky.brightblock.org;
  DOCKER_NAME=signer_api_production
  TARGET_ENV=linode-production
  PORT=7019
fi
export DOCKER_ID_USER='mijoco'
export DOCKER_CMD='docker'

$DOCKER_CMD build -t mijoco/signer_api sbtc-signer-api
$DOCKER_CMD tag mijoco/signer_api mijoco/signer_api
$DOCKER_CMD push mijoco/signer_api:latest

printf "\nConnecting to: $SERVER.\n\n"
printf "\nDeploying docker container: $DOCKER_NAME.\n\n"

if [ "$DEPLOYMENT" == "prod" ]; then
  ssh -i ~/.ssh/id_rsa -p $PORT bob@$SERVER "
    cd /home/bob/hubgit/sbtc-signer-api
    pwd
    cat .env;
    docker login;
    docker pull mijoco/signer_api;

    docker rm -f ${DOCKER_NAME}
    source /home/bob/.profile;
    docker run -d -t -i --name ${DOCKER_NAME} -p 4020:4020 \
      -e TARGET_ENV=linode-production \
      -e btcSchnorrReveal=${SIG_BTC_PROD_SCHNORR_KEY_REVEAL} \
      -e btcSchnorrReclaim=${SIG_BTC_PROD_SCHNORR_KEY_RECLAIM} \
      -e btcRpcUser=${SIG_BTC_PROD_RPC_USER} \
      -e btcRpcPwd=${SIG_BTC_PROD_RPC_PWD} \
      -e btcNode=${SIG_BTC_PROD_NODE} \
      -e mongoDbUrl=${SIG_MONGO_PROD_SBTC_URL} \
      -e mongoDbName=${SIG_MONGO_PROD_SBTC_DBNAME} \
      -e mongoUser=${SIG_MONGO_PROD_SBTC_USER} \
      -e mongoPwd=${SIG_MONGO_PROD_SBTC_PWD} \
      mijoco/signer_api
  ";
else 
  ssh -i ~/.ssh/id_rsa -p $PORT bob@$SERVER "
    cd /home/bob/hubgit/sbtc-signer-api
    pwd
    cat .env;
    docker login;
    docker pull mijoco/signer_api;

    docker rm -f ${DOCKER_NAME}
    source /home/bob/.profile;
    docker run -d -t -i --name ${DOCKER_NAME} -p 4010:4010 \
      -e TARGET_ENV=linode-staging \
      -e btcSchnorrReveal=${SIG_BTC_SCHNORR_KEY_REVEAL} \
      -e btcSchnorrReclaim=${SIG_BTC_SCHNORR_KEY_RECLAIM} \
      -e btcRpcUser=${SIG_BTC_RPC_USER} \
      -e btcRpcPwd=${SIG_BTC_RPC_PWD} \
      -e btcNode=${SIG_BTC_NODE} \
      -e mongoDbUrl=${SIG_MONGO_SBTC_URL} \
      -e mongoDbName=${SIG_MONGO_SBTC_DBNAME} \
      -e mongoUser=${SIG_MONGO_SBTC_USER} \
      -e mongoPwd=${SIG_MONGO_SBTC_PWD} \
      mijoco/signer_api
  ";
fi

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;

