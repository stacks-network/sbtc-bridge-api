#!/bin/bash -e

export SERVICE=$1

printf "\n-----------------------------------------------------------------------------------------------------\n";
printf "Running script: $0 \n";
printf "Running argument: $1 \n";
printf "\n-----------------------------------------------------------------------------------------------------\n";

pwd
cp .env.local .env

if [ -z "${SERVICE}" ]; then
  docker-compose -f docker-compose-local.yml down
  #docker rm $SERVICE
  #docker-compose -f docker-compose-local.yml rm -sf stxeco_api stxeco_express stxeco_mongodb
  docker-compose -f docker-compose-local.yml build
  docker-compose -f docker-compose-local.yml up -d --remove-orphans
else
  docker-compose -f docker-compose-local.yml up --detach --build $SERVICE
fi

exit 0;
