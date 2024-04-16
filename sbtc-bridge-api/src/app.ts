import { isDevenv, setConfigOnStart, getConfig, isLocalTestnet, isDev, printConfig } from './lib/config.js';
import bodyParser from "body-parser";
import swaggerUi from 'swagger-ui-express';
import express, { Application } from "express";
import morgan from "morgan";
import { initUiCacheJob, pox4EventsJob } from './routes/schedules/JobScheduler.js';
import cors from "cors";
import { connect, getExchangeRates } from './lib/data/db_models.js'
import { WebSocketServer } from 'ws'
import { configRoutes } from './routes/configRoutes.js'
import { bitcoinRoutes } from './routes/bitcoinRoutes.js'
import { sbtcRoutes } from './routes/sbtcRoutes.js'
import { daoRoutes } from './routes/daoRoutes.js'
import { poxRoutes } from './routes/pox/poxRoutes.js'
import { pox4Routes } from './routes/v4/pox/pox4Routes.js'
import { pox4ContractRoutes } from './routes/v4/pox-contract/pox4ContractRoutes.js'
import { signersContractRoutes } from './routes/v4/signers/signersContractRoutes.js'
import { miningContractRoutes } from './routes/v4/mining/miningContractRoutes.js'
import { pox4EventRoutes } from './routes/v4/pox-events/pox4EventRoutes.js'
import { eventsRoutes } from './routes/eventsRoutes.js'
import { createRequire } from 'node:module';
import { authorised } from './lib/utils_stacks.js';
import { printDaoConfig, setDaoConfig } from './lib/config_dao.js';
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
setDaoConfig(getConfig().network);

app.use(
  bodyParser.urlencoded({
    extended: true, 
  })
);
app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    if (authorised(req.headers.authorization)) {
      console.log('app.use: ok' + req.method)
      next()
    } else {
      console.log('app.use: 401 ' + req.method)
      res.sendStatus(401)
    }
  } else {
    next()
  }
})

app.use('/bridge-api/v1/config', configRoutes);
app.use('/bridge-api/v1/btc', bitcoinRoutes);
app.use('/bridge-api/v1/sbtc', sbtcRoutes);
app.use('/bridge-api/v1/dao', daoRoutes);
app.use('/bridge-api/v1/pox', poxRoutes);
app.use('/bridge-api/v1/events', eventsRoutes);
app.use('/bridge-api/v4/pox', pox4Routes);
app.use('/bridge-api/v4/pox-events', pox4EventRoutes);
app.use('/bridge-api/v4/pox-contract', pox4ContractRoutes);
app.use('/bridge-api/v4/signers', signersContractRoutes);
app.use('/bridge-api/v4/mining', miningContractRoutes);

console.log(`Express is listening at http://localhost:${getConfig().port} \nsBTC Wallet: ${getConfig().sbtcContractId}`);
console.log('Startup Environment: ', process.env.NODE_ENV);
console.log(`Bitcoin connection at ${getConfig().btcNode} \nWallet Path: ${getConfig().walletPath}`);
console.log(`Mongo connection at ${getConfig().mongoDbUrl}`);
console.log(`Mongo connection at ${getConfig().mongoDbName}`);
console.log(`App ${getConfig().publicAppName}`);
console.log(`Stacks connection at ${getConfig().stacksApi}`);
console.log(`Stacks explorer at ${getConfig().stacksExplorerUrl}`);
console.log(`sBTC contract at ${getConfig().sbtcContractId}`);

printConfig()
printDaoConfig()

async function connectToMongoCloud() {
  await connect();
  const server = app.listen(getConfig().port, () => {
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return;
  });
  const wss = new WebSocketServer({ server })
  pox4EventsJob.start();
  initUiCacheJob.start()
  //sbtcEventJob.start();
  let rates = await getExchangeRates()

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

 