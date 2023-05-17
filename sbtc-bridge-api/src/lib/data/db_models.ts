import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { getConfig } from '../config.js';
import { PeginRequestI } from "$types/pegin_request.js";

let sbtcContractEvent:Collection;
let peginRequest:Collection;
  
export async function connect() {
	const uri = `mongodb+srv://${getConfig().mongoUser}:${getConfig().mongoPwd}@${getConfig().mongoDbUrl}/?retryWrites=true&w=majority`;
	console.log("Mongo: " + uri);

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
	return await sbtcContractEvent.find(filter).sort({'pegData.burnBlockHeight': -1}).toArray();
}

export async function saveNewPeginRequest (pegin:any) {
	const result = await peginRequest.insertOne(pegin);
	return result;
}

export async function updatePeginRequest (pegger:any, changes: any) {
	const result = await peginRequest.updateOne({
		_id: pegger._id
	}, 
    { $set: changes});
	console.log('updatePeginRequest: ', result)
	return result;
}

export async function findPeginRequestsByFilter(filter:any|undefined):Promise<any> {
	const result = await peginRequest.find(filter).sort({'updated': -1}).toArray();
	return result;
}

export async function findPeginRequestById(_id:string):Promise<any> {
	let o_id = new ObjectId(_id);   // id as a string is passed
	const result = await peginRequest.findOne({"_id":o_id});
	return result;
}

