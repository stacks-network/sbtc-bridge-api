#!/bin/bash -e

# Build the docker image
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build

# Build the helm chart
kompose convert --chart --out sbtc-bridge-api-chart
