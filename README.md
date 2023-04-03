# SBTC Bridge Service

Indexes and caches contract data to make the api client application faster
and more flexible.

API documentation (swagger docs) is available at /docs.

## Development

To run the server in watch mode (nodemon) for rapid development;

```bash
cd sbtc-bridge-api
npm install
npm run dev
```

Note: the dev script concurrently builds the [swagger docs](http://localhost:3010/docs) for
the application.

### Docker

To run the docker containers locally;

```bash
./build.sh
```

Note the build.sh tags and pushes the containers to mijoco docker hub. This will change for mainnet
deployment.

Alternatively, no docker hub, use docker compose directly..

```bash
docker-compose build
docker-compose up -d
```

## Swagger API Docs

See https://testnet.stx.eco/bridge-api/docs/#/

## Deployment

Deployment builds, tags and pushes the images and then uses ssh to log on to remote server
and then pulls the images from docker hub;

```bash
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d
```

This is automated using the deploy script;

```bash
./deploy.sh // for testnet
./deploy.sh prod // for mainnet
```

Note: requires docker hub access and ssh key registered on server. This will change when deployment
moves to Google Cloud.

## SBTC Wallet

The SBTC Wallet is a taproot wallet with addresses (most recent first);

- tb1pmmkznvm0pq5unp6geuwryu2f0m8xr6d229yzg2erx78nnk0ms48sk9s6q7
- tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8

## Production Deployment
Note: `docker-compose.yml` is used for production deployment.

Deployment 1: uninet
- Local build and push of docker images
  - Local: Build and push the image
  ```
  DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build
  docker-compose push
  ```
- Remote (TODO, needs to setup cloudbuild.yaml or Docker/docker-compose): Push to the branch to trigger Google Cloud Build
    
- Build and install the helm chart
  `manual-ingress.yaml` is only non-generated yaml file.
    ```
    kompose convert --chart --out sbtc-bridge-api-chart
    helm upgrade sbtc-bridge-api sbtc-bridge-api-chart --install --namespace sbtc
    ```
- Inspect the Ingresses
    ```
    kubectl get ingress -n sbtc
    ```

- Runtime network selection by Mike - anynet
TODO

Deployment 2: anynet (Igor)
- Combine the two services for mainnet and testnet into one

# Issues: Google Cloud Build is not auto-updating the image with the latest tag for API (is it Web)
# TODO: there seems to be a tsc error in GCP k8s pod
