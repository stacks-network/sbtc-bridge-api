import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';
import * as P from 'micro-packed';
import { hex } from '@scure/base';
import type { Transaction } from '@scure/btc-signer' 
import type { BridgeTransactionType, DepositPayloadUIType, UTXO } from './types/sbtc_types.js' 
import { toStorable, buildDepositPayload } from './payload_utils.js' 
import { addInputs, getPegWalletAddressFromPublicKey, inputAmt } from './wallet_utils.js';

const concat = P.concatBytes;

const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');
export const revealPayment = 10001
export const dust = 500;

/**
 * buildOpReturnDepositTransaction:Transaction
 * @param network (devnet|testnet|mainnet)
 * @param uiPayload:DepositPayloadUIType
 * @param btcFeeRates current rates
 * @param addressInfo the utxos to spend from
 * @param stacksAddress the stacks address to materialise sBTC
 * @returns Transaction from @scure/btc-signer
 */
export function buildOpReturnDepositTransaction(network:string, uiPayload:DepositPayloadUIType, btcFeeRates:any, addressInfo:any):Transaction {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const sbtcWalletAddress = getPegWalletAddressFromPublicKey(network, uiPayload.sbtcWalletPublicKey)
	//const data = buildDepositPayloadOpReturn(network, uiPayload.principal);
	const data = buildDepositPayload(network, 0, uiPayload.principal, false, undefined);

	const txFees = calculateDepositFees(network, false, uiPayload.amountSats, btcFeeRates.feeInfo, addressInfo, sbtcWalletAddress!, data)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	// no reveal fee for op_return
	addInputs(network, uiPayload.amountSats, 0, tx, false, addressInfo.utxos, uiPayload.paymentPublicKey);
	tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
	tx.addOutputAddress(sbtcWalletAddress!, BigInt(uiPayload.amountSats), net);
	const changeAmount = inputAmt(tx) - (uiPayload.amountSats + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(changeAmount), net);
	return tx;
}

/**
 * @param network 
 * @param uiPayload 
 * @param btcFeeRates 
 * @param addressInfo 
 * @param commitTxAddress 
 * @returns Transaction from @scure/btc-signer
 */
export function buildOpDropDepositTransaction (network:string, uiPayload:DepositPayloadUIType, btcFeeRates:any, addressInfo:any, commitTxAddress:string) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const txFees = calculateDepositFees(network, true, uiPayload.amountSats, btcFeeRates.feeInfo, addressInfo, commitTxAddress, undefined)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	addInputs(network, uiPayload.amountSats, revealPayment, tx, false, addressInfo.utxos, uiPayload.paymentPublicKey);
	tx.addOutputAddress(commitTxAddress, BigInt(uiPayload.amountSats), net );
	const changeAmount = inputAmt(tx) - (uiPayload.amountSats + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(changeAmount), net);
	return tx;
}

export function getOpReturnDepositRequest(network:string, uiPayload:DepositPayloadUIType, originator:string):BridgeTransactionType {
	const req:BridgeTransactionType = {
		originator,
		uiPayload,
		status: 1,
		mode: 'op_return',
		requestType: 'deposit',
		network,
		created: new Date().getTime(),
		updated: new Date().getTime()
	}
	return req;
}

export function getOpDropDepositRequest(network:string, uiPayload:DepositPayloadUIType, originator:string):BridgeTransactionType {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	
	const data = buildData(network, uiPayload.principal, uiPayload.amountSats, true);
	const scripts =  [
		{ script: btc.Script.encode([data, 'DROP', hex.decode(uiPayload.sbtcWalletPublicKey), 'CHECKSIG']) },
		{ script: btc.Script.encode(['IF', 144, 'CHECKSEQUENCEVERIFY', 'DROP', hex.decode(uiPayload.reclaimPublicKey), 'CHECKSIG', 'ENDIF']) },
	]
	const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
	const req:BridgeTransactionType = {
		network,
		uiPayload,
		originator,
		status: 1,
		mode: 'op_drop',
		requestType: 'deposit',
		created: new Date().getTime(),
		updated: new Date().getTime()
	}
	req.commitTxScript = toStorable(script)
	return req;
}

function buildData (network:string, sigOrPrin:string, revealFee:number, opDrop:boolean):Uint8Array {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	if (opDrop) {
		return buildDepositPayload(net, revealFee, sigOrPrin, opDrop, undefined);
	}
	return buildDepositPayload(net, revealFee, sigOrPrin, opDrop, undefined);
	//Alpha: return buildDepositPayloadOpReturn(net, sigOrPrin);
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
		const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
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
