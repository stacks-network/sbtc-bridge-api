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
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use(Router);

function runAsyncWrapper(callback:any) {
  return function (req:any, res:any, next:any) {
    callback(req, res, next).catch((err:any) => {
      console.log("error: " + err);
      if (err && typeof err === "object" && err !== null) {
        if (err.response) {
          console.log(err.response.data);
          res.sendStatus(500).send(err.response.data);
        } else {
          console.log(err);
          res.sendStatus(500).send(err);
        }
      } else {
        console.log("error not object: " + err);
        res.sendStatus(500).send(err);
      }
    });
  };
}

function handleDbErr(err:any, res:any, msg:string) {
  console.log('log db: ', err);
  res.sendStatus(500).send({ error: msg });
  return;
}

app.listen(port, () => {
  dumpConfig();
  console.log(`Express is listening at http://localhost:${port} \nwallet: ${sbtcContractId}`);
  return;
});

app.get("/bridge-api/v1/config/:param", (req, res) => {
  res.send(process.env[req.params.param]);
});

app.get("/bridge-api/v1/config", (req, res) => {
  dumpConfig();
  res.send('process.env written to console.');
});

app.get("/bridge-api/v1/thread/:thread_id", async (req, res) => {
  /**
  try {
    const threads = await findThreadById(req.params.thread_id);
    console.log('/bridge-api/v1/thread/:thread_id - 1');    
    console.log('/bridge-api/v1/thread/:thread_id - 2');
    res.send(threads);
  } catch (err) {
    handleDbErr(err, res, '/bridge-api/v1/thread/:thread_id')
  }
   */
  res.send('tbd');
});

app.get('*', function(req, res) {
  res.sendStatus(404);
});

console.log(`Running on ${host}:${port}\n\n`);
