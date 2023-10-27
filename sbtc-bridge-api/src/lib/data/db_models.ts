import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { getConfig, isDev } from '../config.js';

let exchangeRates:Collection;
let sbtcContractEvents:Collection;
let commitments:Collection;
  
export async function connect() {
	let uriPrefix:string = 'mongodb+srv'
	if (isDev()) {
	  // SRV URIs have the additional security requirements on hostnames.
	  // A FQDN is not required for development.
	  uriPrefix = 'mongodb'
	}
	const uri = `${uriPrefix}://${getConfig().mongoUser}:${getConfig().mongoPwd}@${getConfig().mongoDbUrl}/?retryWrites=true&w=majority`;
	// console.log("Mongo: " + uri);

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
	sbtcContractEvents = database.collection('sbtcContractEvents');
	await sbtcContractEvents.createIndex({'contractId': 1, 'txid': 1}, { unique: true })
	commitments = database.collection('commitments');
	await commitments.createIndex({btcTxid: 1}, { unique: true })
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
export async function countContractEvents () {
	return await sbtcContractEvents.countDocuments();
}

export async function saveNewContractEvent(newEvent:any) {
	const result = await sbtcContractEvents.insertOne(newEvent);
	return result;
}

export async function findContractEventsByFilter(filter:any|undefined) {
	return await sbtcContractEvents.find(filter).sort({'payloadData.burnBlockHeight': 1}).toArray();
}

export async function findContractEventBySbtcWalletAddress(sbtcWallet:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "payloadData.sbtcWallet": sbtcWallet }).sort({'payloadData.burnBlockHeight': 1}).toArray();
	return result;
}

export async function findContractEventByStacksAddress(stacksAddress:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "payloadData.stacksAddress": stacksAddress }).sort({'payloadData.burnBlockHeight': 1}).toArray();
	return result;
}

export async function findContractEventByBitcoinAddress(bitcoinAddress:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "payloadData.spendingAddress": bitcoinAddress }).sort({'payloadData.burnBlockHeight': 1}).toArray();
	return result;
}

export async function findContractEventByBitcoinTxId(bitcoinTxid:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "bitcoinTxid.payload.value": '0x' + bitcoinTxid }).sort({'payloadData.burnBlockHeight': 1}).toArray();
	return result;
}

export async function findContractEventById(_id:string):Promise<any> {
	let o_id = new ObjectId(_id);
	const result = await sbtcContractEvents.findOne({"_id":o_id});
	return result;
}

export async function saveNewBridgeTransaction (pegin:any) {
	const result = await commitments.insertOne(pegin);
	return result;
}

export async function updateBridgeTransaction (pegger:any, changes: any) {
	const result = await commitments.updateOne({
		_id: pegger._id
	},
    { $set: changes});
	return result;
}

export async function findBridgeTransactionsByFilter(filter:any|undefined):Promise<any> {
	const result = await commitments.find(filter).sort({'updated': 1}).toArray();
	return result;
}

export async function findBridgeTransactionById(_id:string):Promise<any> {
	let o_id = new ObjectId(_id);   // id as a string is passed
	const result = await commitments.findOne({"_id":o_id});
	return result;
}

