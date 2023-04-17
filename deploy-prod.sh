#!/bin/bash -e

# Push the docker image
docker-compose push

# Upgrade the helm release
helm upgrade sbtc-bridge-api sbtc-bridge-api-chart --install --namespace sbtc

# Restart the deployment
kubectl rollout restart deployment sbtc-bridge-api --namespace sbtc

# Monitor the deployment rollout
kubectl rollout status deployment sbtc-bridge-api --namespace sbtc --watch

# Show the logs
kubectl logs -f deployment/sbtc-bridge-api --namespace sbtc
