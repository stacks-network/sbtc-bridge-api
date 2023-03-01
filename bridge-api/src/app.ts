import { dumpConfig, sbtcContractId, host, port } from './lib/config';
import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import { findThreadById } from './lib/db_helper';
import Router from "./routes";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(cors());

app.use(
  "/bridge-api/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use(Router);

app.listen(port, () => {
  dumpConfig();
  console.log(`Express is listening at http://localhost:${port} \nwallet: ${sbtcContractId}`);
  return;
});

console.log(`Running on ${host}:${port}\n\n`);
