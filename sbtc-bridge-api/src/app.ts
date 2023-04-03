import { dumpConfig, sbtcContractId, host, port, network } from './lib/config.js';
import { swagger } from './lib/swagger.js'
import express, { Application } from "express";
import morgan from "morgan";
import Router from "./routes/index.js";
import { serve, setup } from 'swagger-ui-express';
import { sbtcEventJob } from './controllers/JobScheduler.js';
import cors from "cors";

const app = express();
app.use((req, res, next) => {
    // console.log(`req.url: ${req.url}`);
    const prefix = `/v1/${network}`;
    if (req.url.startsWith(prefix)) {
        const new_url = req.url.slice(prefix.length);
        req.url = new_url.startsWith('/') ? new_url : `/${new_url}`;
        // console.log(`next req.url: ${req.url}`);
        next();
    } else if (req.url == '/') {
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(cors());

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

app.listen(port, '0.0.0.0', () => {
  console.log('config', dumpConfig());
  console.log(`Express is listening at http://0.0.0.0:${port} \nwallet: ${sbtcContractId}`);
  return;
});

sbtcEventJob.start();
console.log(`Running on ${host}:${port}\n\n`);