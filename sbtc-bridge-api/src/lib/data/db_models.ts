import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { getConfig } from '../config.js';
import { ExchangeRate } from 'sbtc-bridge-lib';

let exchangeRates:Collection;
let sbtcAlphaEvents:Collection;
let peginRequest:Collection;
let commitments:Collection;
  
export async function connect() {
	const uri = `mongodb+srv://${getConfig().mongoUser}:${getConfig().mongoPwd}@${getConfig().mongoDbUrl}/?retryWrites=true&w=majority`;
	//console.log("Mongo: " + uri);

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
	peginRequest = database.collection('peginRequest');
	await peginRequest.createIndex({status: 1, amount: 1, fromBtcAddress: 1, stacksAddress: 1, sbtcWalletAddress: 1}, { unique: true })
	commitments = database.collection('commitments');
	await commitments.createIndex({status: 1, amount: 1, fromBtcAddress: 1, originator: 1, sbtcWalletAddress: 1}, { unique: true })
	exchangeRates = database.collection('exchangeRates');
	await exchangeRates.createIndex({currency: 1}, { unique: true })
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
	const result = await exchangeRates.find({}).sort({'currency': -1}).toArray();
	return result;
}
export async function findExchangeRateByCurrency(currency:string):Promise<any> {
	const result = await exchangeRates.findOne({currency});
	return result;
}
export async function saveNewExchangeRate (exchangeRate:any) {
	const result = await exchangeRates.insertOne(exchangeRate);
	return result;
}
export async function updateExchangeRate (exchangeRate:any, changes: any) {
	const result = await exchangeRates.updateOne({
		_id: exchangeRate._id
	}, 
    { $set: changes});
	return result;
}



// Compile model from schema 
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

export async function saveNewPeginRequest (pegin:any) {
	const result = await commitments.insertOne(pegin);
	return result;
}

export async function updatePeginRequest (pegger:any, changes: any) {
	const result = await commitments.updateOne({
		_id: pegger._id
	}, 
    { $set: changes});
	return result;
}

export async function findPeginRequestsByFilter(filter:any|undefined):Promise<any> {
	const result = await commitments.find(filter).sort({'updated': -1}).toArray();
	return result;
}

export async function findPeginRequestById(_id:string):Promise<any> {
	let o_id = new ObjectId(_id);   // id as a string is passed
	const result = await commitments.findOne({"_id":o_id});
	return result;
}

