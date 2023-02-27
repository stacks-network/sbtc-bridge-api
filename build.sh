#!/bin/bash -e

export SERVICE=$1

printf "\n-----------------------------------------------------------------------------------------------------\n";
printf "Running script: $0 \n";
printf "Running argument: $1 \n";
printf "\n-----------------------------------------------------------------------------------------------------\n";

pwd
cp .env.local .env

if [ -z "${SERVICE}" ]; then
  docker-compose down
  #docker rm $SERVICE
  #docker-compose rm -sf stxeco_api stxeco_express stxeco_mongodb
  docker-compose build
  docker-compose up -d --remove-orphans
else
  docker-compose up --detach --build $SERVICE
fi

exit 0;
