import { MongoClient, ServerApiVersion } from 'mongodb';
import type { Collection } from 'mongodb';
import { getConfig } from '../config.js';
import { PeginRequestI } from "$types/pegin_request.js";

let sbtcContractEvent:Collection;
let peginRequest:Collection;
  
export async function connect() {
	const uri = `mongodb+srv://${getConfig().mongoUser}:${getConfig().mongoPwd}@${getConfig().mongoDbUrl}/?retryWrites=true&w=majority`;
	
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

	// Provide the name of the database and collection you want to use.
	// If the database and/or collection do not exist, the driver and Atlas
	// will create them automatically when you first write data.
	const dbName = getConfig().mongoDbName;
	
	// Create references to the database and collection in order to run
	// operations on them.
	const database = client.db(dbName);
	sbtcContractEvent = database.collection('sbtcContractEvent');
	await sbtcContractEvent.createIndex({'bitcoinTxid': 1}, { unique: true })
	peginRequest = database.collection('peginRequest');
	await peginRequest.createIndex({status: 1, amount: 1, fromBtcAddress: 1, stacksAddress: 1, sbtcWalletAddress: 1}, { unique: true })
}

// Compile model from schema
export async function countSbtcEvents () {
	return await sbtcContractEvent.countDocuments();
}

export async function saveNewSbtcEvent (newEvent:any) {
	const result = await sbtcContractEvent.insertOne(newEvent);
	return result;
}

export async function findSbtcEventsByFilter(filter:any|undefined) {
	return await sbtcContractEvent.find(filter);
}

export async function saveNewPeginRequest (newEvent:PeginRequestI) {
	const result = await peginRequest.insertOne(newEvent);
	return result;
}

export async function findPeginRequestsByFilter(filter:any|undefined):Promise<any> {
	const result = await peginRequest.find(filter);
	return result;
}

