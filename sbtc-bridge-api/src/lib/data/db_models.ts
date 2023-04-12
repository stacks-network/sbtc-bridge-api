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

// Compile model from schema
export const SbtcEventTestnetModel = mongTestnet.model("SbtcEvent", SbtcEventSchema);
export const SbtcEventMainnetModel = mongMainnet.model("SbtcEvent", SbtcEventSchema);
export const PeginRequestTestnetModel = mongTestnet.model("PeginRequest", PeginRequestSchema);
export const PeginRequestMainnetModel = mongMainnet.model("PeginRequest", PeginRequestSchema);

export async function countSbtcEvents () {
	if (getConfig().network === 'testnet') {
		return await SbtcEventTestnetModel.countDocuments()
	} else {
		return await SbtcEventMainnetModel.countDocuments();
	}
}

export async function saveNewSbtcEvent (newEvent:any) {
	const model = (getConfig().network === 'testnet') ? new SbtcEventTestnetModel(newEvent) : new SbtcEventMainnetModel(newEvent);
	const result = await model.save();
	return result;
}

export async function findSbtcEventsByFilter(filter:any|undefined) {
	if (getConfig().network === 'testnet') {
		return await SbtcEventTestnetModel.find(filter);
	} else {
		return await SbtcEventMainnetModel.find(filter);
	}
}

export async function saveNewPeginRequest (newEvent:any) {
	const model = (getConfig().network === 'testnet') ? new PeginRequestTestnetModel(newEvent) : new PeginRequestMainnetModel(newEvent);
	const result = await model.save();
	return result;
}

export async function findPeginRequestsByFilter(filter:any|undefined):Promise<Array<PeginRequestI>> {
	if (getConfig().network === 'testnet') {
		return await PeginRequestTestnetModel.find(filter);
	} else {
		return await PeginRequestMainnetModel.find(filter);
	}
}

