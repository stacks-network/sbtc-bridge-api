#!/bin/bash -e
#
############################################################

export SERVER1=spinoza.brightblock.org;
export DOCKER_NAME1=bridge_api_production
export TARGET_ENV1=linode-production
export PORT1=22

export SERVER2=chomsky.brightblock.org
export PORT2=7019
export DOCKER_NAME2=bridge_api_staging
export TARGET_ENV2=linode-staging

export DOCKER_ID_USER='mijoco'
export DOCKER_CMD='docker'

$DOCKER_CMD build -t mijoco/bridge_api sbtc-bridge-api
$DOCKER_CMD tag mijoco/bridge_api mijoco/bridge_api
$DOCKER_CMD push mijoco/bridge_api:latest

printf "\n\n===================================================="
printf "\nConnecting to: $SERVER1:$PORT1"
printf "\nDeploying docker container: $DOCKER_NAME1"

  ssh -i ~/.ssh/id_rsa -p $PORT1 bob@$SERVER1 "
    cd /home/bob/hubgit/sbtc-bridge-api
    pwd
    source ~/.profile;
    docker login;
    docker pull mijoco/bridge_api;

    docker rm -f ${DOCKER_NAME1}
    source /home/bob/.profile;
    docker run -d -t -i --network host --name ${DOCKER_NAME1} -p 3010:3010 \
      -e TARGET_ENV=${TARGET_ENV1} \
      -e NODE_ENV='linode-production' -e mongoDbUrl=${SBTC_MONGO_URL} \
      -e mongoDbName=${SBTC_MONGO_DBNAME} -e mongoUser=${SBTC_MONGO_USER} \
      -e mongoPwd=${SBTC_MONGO_PWD} -e btcRpcUser=${SBTC_BTC_RPC_USER} \
      -e btcRpcPwd=${SBTC_BTC_RPC_PWD}  -e btcNode=${SBTC_BTC_NODE} \
      -e btcSchnorrReveal=${SBTC_BTC_SCHNORR_KEY_REVEAL} \
      -e btcSchnorrReclaim=${SBTC_BTC_SCHNORR_KEY_RECLAIM} \
      -e btcSchnorrOracle=${SBTC_BTC_SCHNORR_KEY_ORACLE} \
      -e sbtcContractId=${SBTC_CONTRACT_ID} -e network=${SBTC_NETWORK} \
      -e stacksApi=${SBTC_STACKS_API} -e stacksExplorerUrl=${SBTC_STACKS_EXPLORER_URL} \
      -e bitcoinExplorerUrl=${SBTC_BITCOIN_EXPLORER_URL} \
      -e mempoolUrl=${SBTC_BITCOIN_MEMPOOL_URL} \
      -e blockCypherUrl=${SBTC_BITCOIN_BLOCKCYPHER_URL} \
      -e publicAppVersion=${SBTC_PUBLIC_APP_VERSION} \
      -e host=${SBTC_HOST} -e port=${SBTC_PORT} \
      -e walletPath=${SBTC_WALLET_PATH} -e daoProposals=${SBTC_DOA_PROPOSALS} \
      -e daoProposal=${SBTC_DOA_PROPOSAL} \
      mijoco/bridge_api
  ";

  printf "\n\n\n===================================================="
  printf "\nConnecting to: $SERVER2:$PORT2."
  printf "\nDeploying docker container: $DOCKER_NAME2"

  ssh -i ~/.ssh/id_rsa -p $PORT2 bob@$SERVER2 "
    cd /home/bob/hubgit/sbtc-bridge-api
    pwd
    source ~/.profile;
    docker login;
    docker pull mijoco/bridge_api;

    docker rm -f ${DOCKER_NAME2}
    source /home/bob/.profile;
    docker run -d -t -i --network host --name ${DOCKER_NAME2} -p 3010:3010 \
      -e TARGET_ENV=${TARGET_ENV2} \
      -e NODE_ENV='linode-production' -e mongoDbUrl=${SBTC_MONGO_URL} \
      -e mongoDbName=${SBTC_MONGO_DBNAME} -e mongoUser=${SBTC_MONGO_USER} \
      -e mongoPwd=${SBTC_MONGO_PWD} -e btcRpcUser=${SBTC_BTC_RPC_USER} \
      -e btcRpcPwd=${SBTC_BTC_RPC_PWD}  -e btcNode=${SBTC_BTC_NODE} \
      -e btcSchnorrReveal=${SBTC_BTC_SCHNORR_KEY_REVEAL} \
      -e btcSchnorrReclaim=${SBTC_BTC_SCHNORR_KEY_RECLAIM} \
      -e btcSchnorrOracle=${SBTC_BTC_SCHNORR_KEY_ORACLE} \
      -e sbtcContractId=${SBTC_CONTRACT_ID} -e network=${SBTC_NETWORK} \
      -e stacksApi=${SBTC_STACKS_API} -e stacksExplorerUrl=${SBTC_STACKS_EXPLORER_URL} \
      -e bitcoinExplorerUrl=${SBTC_BITCOIN_EXPLORER_URL} \
      -e mempoolUrl=${SBTC_BITCOIN_MEMPOOL_URL} \
      -e blockCypherUrl=${SBTC_BITCOIN_BLOCKCYPHER_URL} \
      -e publicAppVersion=${SBTC_PUBLIC_APP_VERSION} \
      -e host=${SBTC_HOST} -e port=${SBTC_PORT} \
      -e walletPath=${SBTC_WALLET_PATH} -e daoProposals=${SBTC_DOA_PROPOSALS} \
      -e daoProposal=${SBTC_DOA_PROPOSAL} \
      mijoco/bridge_api
  ";

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;

