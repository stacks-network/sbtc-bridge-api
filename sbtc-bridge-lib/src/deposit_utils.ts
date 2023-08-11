import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';
import * as P from 'micro-packed';
import { hex } from '@scure/base';
import type { PeginRequestI, UTXO } from './types/sbtc_types.js' 
import { toStorable, buildDepositPayload, buildDepositPayloadOpReturn } from './payload_utils.js' 
import { c32addressDecode } from 'c32check';

const concat = P.concatBytes;

const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');
export const revealPayment = 10001

export function buildOpReturnTransaction(network:string, amount:number, btcFeeRates:any, addressInfo:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	if (!stacksAddress) throw new Error('Stacks address required!');
	const utxos = addressInfo.utxos;
	const txFees = calculateFees(network, amount, btcFeeRates.feeInfo, utxos, sbtcWalletAddress, cardinal)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
	addInputs(amount, tx, false, utxos);
	const data = buildDepositPayloadOpReturn(network, stacksAddress);
	tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
	tx.addOutputAddress(sbtcWalletAddress, BigInt(amount), net);
	const changeAmount = inputAmt(tx) - (amount + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(cardinal, BigInt(changeAmount), net);
	return tx;
}

export function buildOpDropTransaction (network:string, revealFeeWithGas:number, commitKeys:any, btcFeeRates:any, addressInfo:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string, ordinal:string) {
	const amount = revealFeeWithGas;
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const utxos = addressInfo.utxos;
	const txFees = calculateFees(network, amount, btcFeeRates.feeInfo, utxos, ordinal, cardinal)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
	addInputs(amount, tx, false, utxos);
	const peginReqest = getOpDropPeginRequest(network, amount, commitKeys, stacksAddress, sbtcWalletAddress, cardinal);
	if (!peginReqest.commitTxScript || !peginReqest.commitTxScript.address ) throw new Error('Address required!');
	tx.addOutputAddress(peginReqest.commitTxScript.address, BigInt(amount), net );
	const changeAmount = inputAmt(tx) - (amount + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(cardinal, BigInt(changeAmount), net);
	return { peginReqest, tx };
}

export function getOpReturnPeginRequest(network:string, amount:number, commitKeys:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string):PeginRequestI {
	if (!stacksAddress) throw new Error('Stacks address missing')
	const data = buildDepositPayloadOpReturn(network, stacksAddress);
	console.log('reclaimAddr.pubkey: ' + commitKeys.reclaimPub)
	console.log('revealAddr.pubkey: ' + commitKeys.revealPub)
	
	const req:PeginRequestI = {
		originator: stacksAddress,
		fromBtcAddress: cardinal,
		revealPub: commitKeys.revealPub,
		reclaimPub: commitKeys.reclaimPub,
		status: 1,
		tries: 0,
		mode: 'op_return',
		amount: amount,
		requestType: 'deposit',
		wallet: hex.encode(data),
		stacksAddress: stacksAddress,
		sbtcWalletAddress: sbtcWalletAddress,
	}
	return req;
}

export function getOpDropPeginRequest(network:string, revealFee:number, commitKeys:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string):PeginRequestI {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	if (!stacksAddress) throw new Error('Address needed')
	console.log('reclaimAddr.pubkey: ' + commitKeys.reclaimPub)
	console.log('revealAddr.pubkey: ' + commitKeys.revealPub)
	
	const data = buildData(network, stacksAddress, revealFee, true);
	const scripts =  [
		{ script: btc.Script.encode([data, 'DROP', hex.decode(commitKeys.revealPub), 'CHECKSIG']) },
		{ script: btc.Script.encode([hex.decode(commitKeys.reclaimPub), 'CHECKSIG']) }
	]
	const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
	const req:PeginRequestI = {
		originator: stacksAddress,
		fromBtcAddress: cardinal,
		revealPub: commitKeys.revealPub,
		reclaimPub: commitKeys.reclaimPub,
		status: 1,
		tries: 0,
		mode: 'op_drop',
		amount: revealFee,
		requestType: 'deposit',
		wallet: 'p2tr(TAPROOT_UNSPENDABLE_KEY, [{ script: Script.encode([data, \'DROP\', revealPubK, \'CHECKSIG\']) }, { script: Script.encode([reclaimPubKey, \'CHECKSIG\']) }], net, true)',
		stacksAddress: stacksAddress,
		sbtcWalletAddress: sbtcWalletAddress,
	}
	req.commitTxScript = toStorable(script)
	return req;
}

function buildData (network:string, sigOrPrin:string, revealFee:number, opDrop:boolean):Uint8Array {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	if (opDrop) {
		return buildDepositPayload(net, revealFee, sigOrPrin, opDrop, undefined);
	}
	return buildDepositPayloadOpReturn(net, sigOrPrin);
}

export function maxCommit(addressInfo:any) {
	if (!addressInfo || !addressInfo.utxos || addressInfo.utxos.length === 0) return 0;
	const summ = addressInfo?.utxos?.map((item:{value:number}) => item.value).reduce((prev:number, curr:number) => prev + curr, 0);
	return summ || 0;
}

export function calculateFees (network:string, amount:number, feeInfo:{ low_fee_per_kb:number, medium_fee_per_kb:number, high_fee_per_kb:number }, utxos:Array<UTXO>, commitTxScriptAddress:string, changeAddress:string) {
	try {
		const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
		let vsize = 0;
		const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
		addInputs(amount, tx, true, utxos);
		tx.addOutputAddress(commitTxScriptAddress, BigInt(amount), net );
		const changeAmount = inputAmt(tx) - (amount); 
		if (changeAmount > 0) tx.addOutputAddress(changeAddress, BigInt(changeAmount), net);
		tx.sign(privKey);
		tx.finalize();
		vsize = tx.vsize;
		const fees = [
			Math.floor(vsize * feeInfo['low_fee_per_kb'] / 1024),
			Math.floor(vsize * feeInfo['medium_fee_per_kb'] / 1024),
			Math.floor(vsize * feeInfo['high_fee_per_kb'] / 1024),
		]
		return fees;
	} catch (err:any) {
		return [ 850, 1000, 1150]
	}
}

function addInputs (amount:number, tx:btc.Transaction, feeCalc:boolean, utxos:Array<UTXO>) {
	const bar = revealPayment + amount;
	let amt = 0;
	for (const utxo of utxos) {
		const hexy = (utxo.tx.hex) ? utxo.tx.hex : utxo.tx 
		const script = btc.RawTx.decode(hex.decode(hexy))
		if (amt < bar && isUTXOConfirmed(utxo)) {
			amt += utxo.value;
			let witnessUtxo = {
				script: script.outputs[utxo.vout].script,
				amount: BigInt(utxo.value)
			}
			if (feeCalc) {
				witnessUtxo = {
					amount: BigInt(utxo.value),
					script: btc.p2wpkh(secp.getPublicKey(privKey, true)).script,
				}		
			}
			const nextI:btc.TransactionInput = {
				txid: hex.decode(utxo.txid),
				index: utxo.vout,
				witnessUtxo
			}
			tx.addInput(nextI);
		}
	}
}

function isUTXOConfirmed (utxo:any) {
	return utxo.tx.confirmations >= 3;
};

function inputAmt (tx:btc.Transaction) {
	let amt = 0;
	for (let idx = 0; idx < tx.inputsLength; idx++) {
		amt += Number(tx.getInput(idx).witnessUtxo?.amount)
	}
	return amt;
}
