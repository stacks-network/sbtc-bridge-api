import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';
import * as P from 'micro-packed';
import { hex } from '@scure/base';
import type { PeginRequestI, UTXO } from './types/sbtc_types.js' 
import { toStorable, buildDepositPayload, buildDepositPayloadOpReturn } from './payload_utils.js' 
import { addInputs, inputAmt } from './wallet_utils.js';

const concat = P.concatBytes;

const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');
export const revealPayment = 10001
export const dust = 500;
/**
 * 
 * @param network 
 * @param amount the amount to deposit plus the reveal transaction gas fee
 * @param btcFeeRates current rates
 * @param addressInfo the utxos to spend from
 * @param stacksAddress the stacks address to materialise sBTC
 * @param sbtcWalletAddress the sBTC peg wallet address where funds are revealed to
 * @param cardinal a change address
 * @param userPaymentPubKey pubkey needed to spend script hash inputs
 * @returns 
 */
export function buildOpReturnDepositTransaction(network:string, amount:number, btcFeeRates:any, addressInfo:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string, userPaymentPubKey:string) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	if (!stacksAddress) throw new Error('Stacks address required!');
	const data = buildDepositPayloadOpReturn(network, stacksAddress);
	const txFees = calculateDepositFees(network, false, amount, btcFeeRates.feeInfo, addressInfo, sbtcWalletAddress, data)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
	addInputs(network, amount, revealPayment, tx, false, addressInfo.utxos, userPaymentPubKey);
	tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
	tx.addOutputAddress(sbtcWalletAddress, BigInt(amount), net);
	const changeAmount = inputAmt(tx) - (amount + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(cardinal, BigInt(changeAmount), net);
	return tx;
}

/**
 * @param network 
 * @param amount the amount to deposit plus the reveal transaction gas fee
 * @param btcFeeRates current rates
 * @param addressInfo the utxos to spend from
 * @param commitTxAddress the commitment address - contains the taproot data and the payload
 * @param cardinal the change address
 * @param userPaymentPubKey pubkey needed to spend script hash inputs
 * @returns transaction object
 */
export function buildOpDropDepositTransaction (network:string, amount:number, btcFeeRates:any, addressInfo:any, commitTxAddress:string, cardinal:string, userPaymentPubKey:string) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const txFees = calculateDepositFees(network, true, amount, btcFeeRates.feeInfo, addressInfo, commitTxAddress, undefined)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
	addInputs(network, amount, revealPayment, tx, false, addressInfo.utxos, userPaymentPubKey);
	tx.addOutputAddress(commitTxAddress, BigInt(amount), net );
	const changeAmount = inputAmt(tx) - (amount + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(cardinal, BigInt(changeAmount), net);
	return tx;
}

export function getOpReturnDepositRequest(network:string, amount:number, commitKeys:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string):PeginRequestI {
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

export function getOpDropDepositRequest(network:string, revealFee:number, commitKeys:any, stacksAddress:string, sbtcWalletAddress:string, cardinal:string):PeginRequestI {
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

export function calculateDepositFees (network:string, opDrop:boolean, amount:number, feeInfo:any, addressInfo:any, commitTxScriptAddress:string, data:Uint8Array|undefined) {
	try {
		const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
		let vsize = 0;
		const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
		addInputs(network, amount, revealPayment, tx, true, addressInfo.utxos, hex.encode(secp.getPublicKey(privKey, true)));
		if (!opDrop) {
			if (data) tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
			tx.addOutputAddress(commitTxScriptAddress, BigInt(amount), net);
		} else {
			tx.addOutputAddress(commitTxScriptAddress, BigInt(amount), net );
		}
		const changeAmount = inputAmt(tx) - (amount); 
		if (changeAmount > 0) tx.addOutputAddress(addressInfo.address, BigInt(changeAmount), net);
		//tx.sign(privKey);
		//tx.finalize();
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
