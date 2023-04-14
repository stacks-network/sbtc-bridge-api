import { setConfigOnStart, setConfig, getConfig } from './lib/config.js';
import { swagger } from './lib/swagger.js'
import express, { Application } from "express";
import morgan from "morgan";
import Router from "./routes/index.js";
import { serve, setup } from 'swagger-ui-express';
import { sbtcEventJobMainnet } from './controllers/JobScheduler.js';
import { sbtcEventJobTestnet } from './controllers/JobScheduler.js';
import { peginRequestJobTestnet } from './controllers/JobScheduler.js';
import { peginRequestJobMainnet } from './controllers/JobScheduler.js';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(cors());
setConfigOnStart();
app.use((req, res, next) => {
  console.log(`req.url: ${req.url}`);
  setConfig(req.url);
  next();
});


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

app.listen(getConfig().port, () => {

  console.log(`Express is listening at http://localhost:${getConfig().port} \n\nsBTC Wallet: ${getConfig().sbtcContractId}`);
  console.log('\n\nStartup Environment: ', process.env.NODE_ENV);
  console.log('\n\nStartup Target: ', process.env.TARGET_ENV);
  console.log(`\n\nBitcoin connection at ${getConfig().btcNode} \nBitcoin Wallet Path: ${getConfig().walletPath}`);
  console.log('\n\nConfig: ', getConfig());

  return;
});

sbtcEventJobMainnet.start();
sbtcEventJobTestnet.start();
peginRequestJobTestnet.start();
peginRequestJobMainnet.start();
console.log(`Running on ${getConfig().host}:${getConfig().port}\n\n`);
