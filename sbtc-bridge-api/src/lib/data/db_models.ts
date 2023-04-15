import mongoose from "mongoose";
import { getConfig } from '../config.js';
import { PeginRequestI } from "$types/pegin_request.js";
/** */
mongoose.set('strictQuery', true);

const mongMainnet = mongoose.createConnection(getConfig().mongoUrl + getConfig().dbNameMainnet);
const mongTestnet = mongoose.createConnection(getConfig().mongoUrl + getConfig().dbNameTestnet);
console.log('Running mainnet db: ', mongMainnet.config);
console.log('Running testnet db: ', mongTestnet.config);

try {
	mongMainnet.on("error", console.error.bind(console, "MongoDBMainnet connection error:"));
} catch(err) {
	console.log('unable to connect to mongoose mainnet on: ' + getConfig().mongoUrl);
}

try {
	mongTestnet.on("error", console.error.bind(console, "MongoDBTestnet connection error:"));
} catch(err) {
	console.log('unable to connect to mongoose testnet on: ' + getConfig().mongoUrl);
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
		compression: Number,
		burnBlockHeight: { type : Number , required : true },
		sbtcWallet: { type : String , required : true },
	}
});
const PeginRequestSchema = new Schema({
	btcTxid: String,
	updated: Number,
	status: Number,
	amount: Number,
	mode: String,
	requestType: String,
	tries: Number,
	fromBtcAddress: String,
	stacksAddress: String,
	sbtcWalletAddress: String,
	timeBasedPegin: {
		paymentType: String,
		address: String,
		script:  { type : String , unique : true, required : true },
		redeemScript: String,
		witnessScript: String,
	},
	vout: {
		scriptpubkey: String,
		scriptpubkey_asm: String,
		scriptpubkey_type: String,
		scriptpubkey_address: String,
		value: Number,
	}
});
PeginRequestSchema.index({ amount: 1, fromBtcAddress: 1, stacksAddress: 1, sbtcWalletAddress: 1}, { unique: true });

// Compile model from schema
export const SbtcEventTM = mongTestnet.model("SbtcEventTM", SbtcEventSchema);
export const SbtcEventMM = mongMainnet.model("SbtcEventMM", SbtcEventSchema);
export const PeginRequestTM = mongTestnet.model("PeginRequestTM", PeginRequestSchema);
export const PeginRequestMM = mongMainnet.model("PeginRequestMM", PeginRequestSchema);

export async function countSbtcEvents (net:string) {
	if (net === 'testnet') {
		return await SbtcEventTM.countDocuments()
	} else {
		return await SbtcEventMM.countDocuments();
	}
}

export async function saveNewSbtcEvent (net:string, newEvent:any) {
	const model = (net === 'testnet') ? new SbtcEventTM(newEvent) : new SbtcEventMM(newEvent);
	const result = await model.save();
	return result;
}

export async function findSbtcEventsByFilter(filter:any|undefined) {
	if (getConfig().network === 'testnet') {
		return await SbtcEventTM.find(filter);
	} else {
		return await SbtcEventMM.find(filter);
	}
}

export async function saveNewPeginRequest (newEvent:any) {
	const model = (getConfig().network === 'testnet') ? new PeginRequestTM(newEvent) : new PeginRequestMM(newEvent);
	const result = await model.save();
	return result;
}

export async function findPeginRequestsByFilter(network: string, filter:any|undefined):Promise<Array<PeginRequestI>> {
	if (network === 'testnet') {
		return await PeginRequestTM.find(filter);
	} else {
		return await PeginRequestMM.find(filter);
	}
}

