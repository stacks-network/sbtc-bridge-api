import { setConfigOnStart, getConfig } from './lib/config.js';
import { swagger } from './lib/swagger.js'
import express, { Application } from "express";
import morgan from "morgan";
import Router from "./routes/index.js";
import { serve, setup } from 'swagger-ui-express';
import { sbtcEventJob, peginRequestJob, revealCheckJob } from './controllers/JobScheduler.js';
import cors from "cors";
import { connect } from './lib/data/db_models.js'
import { MAGIC_BYTES_TESTNET } from 'sbtc-bridge-lib/src/index' 

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(cors());
setConfigOnStart();


app.use(
  "/bridge-api/docs",
  serve,
  setup(undefined, {
    swaggerOptions: {
      spec: swagger
      //url: "/swagger.json",
    },
  })
);

app.use(Router);

console.log(`Express is listening at http://localhost:${getConfig().port} \n\nsBTC Wallet: ${getConfig().sbtcContractId}`);
console.log('\n\nStartup Environment: ', process.env.TARGET_ENV);
console.log(`\n\nBitcoin connection at ${getConfig().btcNode} \nBitcoin Wallet Path: ${getConfig().walletPath} ... ${MAGIC_BYTES_TESTNET}`);
console.log(`\n\nMongo connection at ${getConfig().mongoDbUrl}`);
async function connectToMongoCloud() {
  await connect();
  app.listen(getConfig().port, () => {
  
    return;
  });
  revealCheckJob.start();
  sbtcEventJob.start();
  peginRequestJob.start();
  console.log(`Running on ${getConfig().host}:${getConfig().port}\n\n`);
}

connectToMongoCloud();

