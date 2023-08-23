import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { getConfig } from '../config.js';

let exchangeRates:Collection;
let sbtcAlphaEvents:Collection;
  
export async function connect() {
	const uri = `mongodb+srv://${getConfig().mongoUser}:${getConfig().mongoPwd}@${getConfig().mongoDbUrl}/?retryWrites=true&w=majority`;
	console.log("Mongo: " + uri);
	console.log("Mongo db: " + getConfig().mongoDbName);

	// The MongoClient is the object that references the connection to our
	// datastore (Atlas, for example)
	const client = new MongoClient(uri, {
		serverApi: {
		  version: ServerApiVersion.v1,
		  strict: true,
		  deprecationErrors: true,
		}
	});
	
	// The connect() method does not attempt a connection; instead it instructs
	// the driver to connect using the settings provided when a connection
	// is required.
	await client.connect();
	await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
	
	// Create references to the database and collection in order to run
	// operations on them.
	const database = client.db(getConfig().mongoDbName);
	sbtcAlphaEvents = database.collection('sbtcAlphaEvents');
	await sbtcAlphaEvents.createIndex({'bitcoinTxid': 1}, { unique: true })
	sbtcAlphaEvents = database.collection('sbtcAlphaEvents');
	await sbtcAlphaEvents.createIndex({'bitcoinTxid': 1}, { unique: true })
	exchangeRates = database.collection('exchangeRates');
}

// Exchange Rates 
export async function delExchangeRates () {
	await exchangeRates.deleteMany();
	return;
}
export async function setExchangeRates (ratesObj:any) {
	return await exchangeRates.insertMany(ratesObj);
}
export async function getExchangeRates () {
	const result = await exchangeRates.find({}).sort({'symbol': -1}).toArray();
	return result;
}

// Compile model from schema 
export function getAlphaCollection () {
	return sbtcAlphaEvents;
}

export async function countAlphaEvents () {
	return await sbtcAlphaEvents.countDocuments();
}

export async function saveNewAlphaEvent (newEvent:any) {
	const result = await sbtcAlphaEvents.insertOne(newEvent);
	return result;
}

export async function findAlphaEventsByFilter(filter:any|undefined) {
	return await sbtcAlphaEvents.find(filter).sort({'pegData.burnBlockHeight': -1}).toArray();
}

