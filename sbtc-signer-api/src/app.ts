import bodyParser from "body-parser";
import swaggerUi from 'swagger-ui-express';
import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import { configRoutes } from './routes/config.js'
import { signerRoutes } from './routes/signers.js'
import { alphaEventRoutes } from './routes/alphaEvents.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { setConfigOnStart, getConfig } from './lib/config.js';
import { updateEventLogJob } from './routes/controllers/JobScheduler.js';
import { connect } from './lib/database/db_models.js'
import { WebSocketServer } from 'ws'
import { AlphaEventsController } from "./routes/controllers/AlphaEventsController.js"

import { createRequire } from 'node:module';
const r = createRequire(import.meta.url);
// - assertions are experimental.. import swaggerDocument from '../public/swagger.json' assert { type: "json" };;
const swaggerDocument = r('./swagger.json');

const app = express();

app.use('/api-docs', swaggerUi.serve);
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(cors());
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
setConfigOnStart();


app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(signerRoutes);
app.use(configRoutes);
app.use(dashboardRoutes);
app.use(alphaEventRoutes);

const PORT = getConfig().port;
//app.listen(PORT);

console.log(`Express is listening at http://localhost:${getConfig().port} \n\nsBTC Wallet: ${getConfig().sbtcContractId}`);
console.log('\n\nStartup Environment: ', process.env.TARGET_ENV);
console.log(`\n\nBitcoin connection at ${getConfig().btcNode} \nBitcoin Wallet Path: ${getConfig().walletPath}`);
console.log(`\n\nMongo connection at ${getConfig().mongoDbUrl}`);

async function connectToMongoCloud() {
  await connect();
  const server = app.listen(PORT, () => {
    return;
  });
  const wss = new WebSocketServer({ server })
  updateEventLogJob.start();
  const controller = new AlphaEventsController();
  console.log(`Running on ${getConfig().host}:${PORT}\n\n`);
  //const server = http.createServer(app)
  wss.on('connection', function connection(ws) {
    //console.log('new client connected');
    ws.send(JSON.stringify(controller.findAlphaEvents(0)))
    setInterval(async function () {
      ws.send(JSON.stringify(controller.findAlphaEvents(0)))
    }, (60 * 5 * 1000)) // 5 mins.
    ws.on('message', function incoming(message) {
      //console.log('received %s', message);
      ws.send('Got your new rates : ' + message)
    })
  })
}

connectToMongoCloud();
