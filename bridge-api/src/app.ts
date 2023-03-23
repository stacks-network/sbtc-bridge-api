import { dumpConfig, sbtcContractId, host, port } from './lib/config.js';
import { swagger } from './lib/swagger.js'
import express, { Application } from "express";
import morgan from "morgan";
import Router from "./routes/index.js";
import { serve, setup } from 'swagger-ui-express';
import { sbtcEventJob } from './controllers/JobScheduler.js';
import cors from "cors";
import https from "https";
import fs from "fs";

const app = express();
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

// app.listen(port, () => {
//   dumpConfig();
//   console.log(`Express is listening at http://localhost:${port} \nwallet: ${sbtcContractId}`);
//   return;
// });

https
.createServer(
    // Provide the private and public key to the server by reading each
    // file's content with the readFileSync() method.
    {
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.pem"),
    },
    app
)

sbtcEventJob.start();
console.log(`Running on ${host}:${port}\n\n`);
