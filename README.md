# SBTC Bridge Service

Indexes and caches contract data to make the api client application faster
and more flexible.

API documentation (swagger docs) is available at /docs.

## Development

To run the server in watch mode (nodemon) for rapid development;

```bash
cd bridge-api
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

## Deployment

Deployment builds, tags and pushes the images and then uses ssh to log on to remote server
and then pulls the images from docker hub;

```bash
docker-compose -f docker-compose-images.yml pull
docker-compose -f docker-compose-images.yml up -d
```

This is automated using the deploy script;

```bash
./deploy.sh // for testnet
./deploy.sh prod // for mainnet
```

Note: requires docker hub access and ssh key registered on server. This will change when deployment
moves to Google Cloud.
