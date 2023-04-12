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
export DOCKER_COMPOSE_CMD='docker compose'
export DOCKER_CMD='docker'

docker-compose -f docker-compose-local.yml build
$DOCKER_CMD tag mijoco/bridge_api mijoco/bridge_api
$DOCKER_CMD push mijoco/bridge_api:latest

printf "\nConnecting to $SERVER.\n\n"

ssh -i ~/.ssh/id_rsa -p $PORT bob@$SERVER "
  cd /home/bob/hubgit/sbtc-bridge-api
  pwd
  #git pull
  # cp .env.production .env
  cat .env
  docker login
  . ~/.profile
  docker compose -f docker-compose-images.yml down
  docker compose -f docker-compose-images.yml pull
  docker compose -f docker-compose-images.yml up -d
";

printf "Finished....\n"
printf "\n-----------------------------------------------------------------------------------------------------\n";

exit 0;
