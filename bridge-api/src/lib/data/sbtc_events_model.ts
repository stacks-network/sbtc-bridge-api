import mongoose from "mongoose";
import { mongoUrl } from '../config';
/** */
mongoose.set('strictQuery', true);

try {
	mongoose.connect(mongoUrl!);
	const db = mongoose.connection;
	console.log(`Running db ${db}\n`);	
	// Bind connection to error event (to get notification of connection errors)
	db.on("error", console.error.bind(console, "MongoDB connection error:"));
} catch(err) {
	console.log('unable to connect to mongoose on: ' + mongoUrl);
}

// Get the default connection
// Define a schema
const Schema = mongoose.Schema;
const SbtcEventSchema = new Schema({
	eventIndex: { type : Number , required : true },
	contractId: String,
	txid: { type : String , unique : true, required : true },
	bitcoinTxid: { type : String , unique : true, required : true },
	pegData: {
		pegType: String,
		opType: String,
		stxAddress: String,
		amountSats: Number,
		signature: String,
		dustAmount: Number,
		burnBlockHeight: { type : Number , required : true },
		sbtcWallet: { type : String , required : true },
	}
});

// Compile model from schema
export const SbtcEventModel = mongoose.model("SbtcEvent", SbtcEventSchema);

export async function findAll(event: any) {
	console.log('findSbtcEventById:SbtcEventId:');
	const filter = {};
	const all = await SbtcEventModel.find(filter);
	return all;
}

