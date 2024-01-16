import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { getConfig, isDev } from '../config.js';
import { ProposalEvent, VoteEvent } from '../../types/stxeco_type.js';
import { RewardSlot } from '../../types/stxeco_stacker_type.js';

let exchangeRates:Collection;
let sbtcContractEvents:Collection;
let commitments:Collection;
let proposals:Collection;
let proposalVotes:Collection;
export let rewardSlotHolders:Collection;
export let poxAddressInfo:Collection;
export let daoMongoConfig:Collection;
  
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
	proposals = database.collection('proposals');
	await proposals.createIndex({contractId: 1}, { unique: true })
	proposalVotes = database.collection('proposalVotes');
	await proposalVotes.createIndex({submitTxId: 1}, { unique: true })
	daoMongoConfig = database.collection('daoMongoConfig');
	await daoMongoConfig.createIndex({configId: 1}, { unique: true })
	rewardSlotHolders = database.collection('rewardSlotHolders');
	await rewardSlotHolders.createIndex({address: 1, slot_index: 1, burn_block_height: 1}, { unique: true })
	poxAddressInfo = database.collection('poxAddressInfo');
	await poxAddressInfo.createIndex({hashBytes: 1, version: 1, totalUstx: 1, cycle: 1}, { unique: true })
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

export async function findContractEventsByPage(filter:any|undefined, page:number, limit:number):Promise<any> {
	return await sbtcContractEvents.find(filter).skip(page * limit).limit( limit ).sort({'payloadData.burnBlockHeight': -1, 'payloadData.txIndex': -1}).toArray();
}

export async function findContractEventsByFilter(filter:any|undefined) {
	return await sbtcContractEvents.find(filter).sort({'payloadData.burnBlockHeight': -1, 'payloadData.txIndex': -1}).toArray();
}

export async function findContractEventBySbtcWalletAddress(sbtcWallet:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "payloadData.sbtcWallet": sbtcWallet }).sort({'payloadData.burnBlockHeight': -1, 'payloadData.txIndex': -1}).toArray();
	return result;
}

export async function findContractEventByStacksAddress(stacksAddress:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "payloadData.stacksAddress": stacksAddress }).sort({'payloadData.burnBlockHeight': -1, 'payloadData.txIndex': -1}).toArray();
	return result;
}

export async function findContractEventByBitcoinAddress(bitcoinAddress:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "payloadData.spendingAddress": bitcoinAddress }).sort({'payloadData.burnBlockHeight': -1, 'payloadData.txIndex': -1}).toArray();
	return result;
}

export async function findContractEventByBitcoinTxId(bitcoinTxid:string):Promise<any> {
	const result = await sbtcContractEvents.find({ "bitcoinTxid.payload.value": '0x' + bitcoinTxid }).sort({'payloadData.burnBlockHeight': -1, 'payloadData.txIndex': -1}).toArray();
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

export async function saveProposal(proposal:any) {
	const result = await proposals.insertOne(proposal);
	return result;
}

export async function updateProposal(proposal:any, changes: any) {
	const result = await proposals.updateOne({
		_id: proposal._id
	},
    { $set: changes});
	return result;
}

export async function getProposals():Promise<any> {
	const result = await proposals.find({}).toArray();
	return result;
}

export async function findProposalByContractId(contractId:string):Promise<any> {
	const result = await proposals.findOne({"contractId":contractId});
	return result;
}

export async function findProposalByContractIdConcluded(contractId:string):Promise<any> {
	const result = await proposals.findOne({"contractId":contractId});
	return result;
}

export async function getDaoMongoConfig():Promise<any> {
	const result = await daoMongoConfig.find({}).toArray()
	if (result && result.length > 0) return result[0];
	return
}

export async function saveOrUpdateDaoMongoConfig(config:any) {
	try {
		const pdb = await getDaoMongoConfig()
		if (pdb) {
			console.log('updateDaoMongoConfig: updating: ' + config.contractId);
			await updateDaoMongoConfig(pdb, config)
		} else {
			console.log('saveDaoMongoConfig: saving: ' + config.contractId);
			await saveDaoMongoConfig(config)
		}
		return await getDaoMongoConfig()
	} catch (err:any) {
		console.log('saveOrUpdateProposal: error')
	}
}
async function saveDaoMongoConfig(config:any) {
	const result = await daoMongoConfig.insertOne(config);
	return result;
}
async function updateDaoMongoConfig(config:any, changes: any) {
	const result = await daoMongoConfig.updateOne({
		_id: config._id
	},
    { $set: changes});
	return result;
}




export async function saveOrUpdateProposal(p:ProposalEvent) {
	try {
		const pdb = await findProposalByContractId(p.contractId)
		if (pdb) {
			console.log('saveOrUpdateProposal: updating: ' + p.contractId);
			await updateProposal(pdb, p)
		} else {
			console.log('saveOrUpdateProposal: saving: ' + p.contractId);
			await saveProposal(p)
		}
	} catch (err:any) {
		console.log('saveOrUpdateProposal: error')
	}
}


async function saveVote(vote:any) {
	const result = await proposalVotes.insertOne(vote);
	return result;
}

async function updateVote(vote:any, changes: any) {
	const result = await proposalVotes.updateOne({
		_id: vote._id
	},
    { $set: changes});
	return result;
}

export async function findProposalVotesByProposal(proposalContractId:string):Promise<any> {
	const result = await proposalVotes.find({"proposalContractId":proposalContractId}).toArray();
	return result;
}

export async function findVotesByProposalAndVoter(proposalContractId:string, voter:string):Promise<any> {
	const result = await proposalVotes.find({"proposalContractId":proposalContractId, "voter":voter}).toArray();
	return result;
}

export async function findVotesByVoter(voter:string):Promise<any> {
	const result = await proposalVotes.find({"voter":voter}).toArray();
	return result;
}

export async function findVoteBySubmitTxId(submitTxId:string):Promise<any> {
	const result = await proposalVotes.findOne({"submitTxId":submitTxId});
	return result;
}

export async function saveOrUpdateVote(v:VoteEvent) {
	try {
		const pdb = await findVoteBySubmitTxId(v.votingContractId)
		if (pdb) {
			//console.log('saveOrUpdateVote: updating: ' + v.proposalContractId + ' voter: ' + v.voter + ' amount: ' + v.amount + ' for: ' + v.for);
			await updateVote(pdb, v)
		} else {
			//console.log('saveOrUpdateVote: saving: ', v);
			await saveVote(v)
		}
	} catch (err:any) {
		//console.log('saveOrUpdateVote: unable to save or update')
	}
}

