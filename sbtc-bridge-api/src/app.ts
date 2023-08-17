import { setConfigOnStart, getConfig } from './lib/config.js';
import bodyParser from "body-parser";
import swaggerUi from 'swagger-ui-express';
import express, { Application } from "express";
import morgan from "morgan";
import { sbtcEventJob, peginRequestJob, revealCheckJob } from './controllers/JobScheduler.js';
import cors from "cors";
import { connect, getExchangeRates } from './lib/data/db_models.js'
import { MAGIC_BYTES_TESTNET } from 'sbtc-bridge-lib' 
import { WebSocketServer } from 'ws'
import { configRoutes } from './routes/configRoutes.js'
import { bitcoinRoutes } from './routes/bitcoinRoutes.js'
import { stacksRoutes } from './routes/stacksRoutes.js'
import { createRequire } from 'node:module';
const r = createRequire(import.meta.url);
// - assertions are experimental.. import swaggerDocument from '../public/swagger.json' assert { type: "json" };;
const swaggerDocument = r('./swagger.json');

const app = express();

//const wsServer = new WebSocketServer({ noServer: true });
//wsServer.on('connection', socket => {
//  socket.on('message', message => console.log(message));
//});

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

app.use(configRoutes);
app.use(bitcoinRoutes);
app.use(stacksRoutes);

console.log(`Express is listening at http://localhost:${getConfig().port} \n\nsBTC Wallet: ${getConfig().sbtcContractId}`);
console.log('\n\nStartup Environment: ', process.env.TARGET_ENV);
console.log(`\n\nBitcoin connection at ${getConfig().btcNode} \nBitcoin Wallet Path: ${getConfig().walletPath} ... ${MAGIC_BYTES_TESTNET}`);
console.log(`\n\nMongo connection at ${getConfig().mongoDbUrl}`);
async function connectToMongoCloud() {
  await connect();
  const server = app.listen(getConfig().port, () => {
    return;
  });
  const wss = new WebSocketServer({ server })
  revealCheckJob.start();
  sbtcEventJob.start();
  peginRequestJob.start();
  let rates = await getExchangeRates()
  console.log(`Running on ${getConfig().host}:${getConfig().port}\n\n`);
  //const server = http.createServer(app)
  wss.on('connection', function connection(ws) {
    //console.log('new client connected');
    ws.send(JSON.stringify(rates))
    setInterval(async function () {
      rates = await getExchangeRates()
      ws.send(JSON.stringify(rates))
    }, (60 * 5 * 1000)) // 5 mins.
    ws.on('message', function incoming(message) { 
      //console.log('received %s', message);
      ws.send('Got your new rates : ' + message)
    })
  })
}

connectToMongoCloud();

 