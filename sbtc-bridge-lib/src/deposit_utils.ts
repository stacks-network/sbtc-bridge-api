import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';
import * as P from 'micro-packed';
import { hex } from '@scure/base';
import type { Transaction } from '@scure/btc-signer' 
import type { BridgeTransactionType, DepositPayloadUIType, UTXO } from './types/sbtc_types.js' 
import { toStorable, buildDepositPayload, buildDepositPayloadOpDrop } from './payload_utils.js' 
import { addInputs, getPegWalletAddressFromPublicKey, inputAmt } from './wallet_utils.js';

const concat = P.concatBytes;

const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');
export const revealPayment = 10001
export const dust = 500;

/**
 * buildDepositTransaction:Transaction
 * @param network (testnet|mainnet)
 * @param sbtcWalletPublicKey - the sbtc wallet public to sending the deposit to
 * @param uiPayload:DepositPayloadUIType
 * - uiPayload.principal - stacks address or contract principal to mint to
 * - uiPayload.amountSats - amount in sats of sBTC to mint (and bitcoin to deposit)
 * - uiPayload.bitcoinAddress - address for users change - the users cardinal/payment address
 * - uiPayload.paymentPublicKey - public key for users change - the users cardinal/payment public key (only needed for xverse)
 * - btcFeeRates current fee rate estimates - see endpoint /bridge-api/testnet/v1/sbtc/init-ui
 * - utxos the users utxos to spend from - from mempool/blockstream
 * @returns Transaction from @scure/btc-signer
 */
export function buildDepositTransaction(network:string, sbtcWalletPublicKey:string, uiPayload:DepositPayloadUIType, btcFeeRates:any, utxos:Array<UTXO>):Transaction {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const sbtcWalletAddress = getPegWalletAddressFromPublicKey(network, sbtcWalletPublicKey)
	const data = buildDepositPayload(network, uiPayload.principal);

	const txFees = calculateDepositFees(network, false, uiPayload.amountSats, btcFeeRates.feeInfo, utxos, sbtcWalletAddress!, hex.decode(data))
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	// no reveal fee for op_return
	addInputs(network, uiPayload.amountSats, 0, tx, false, utxos, uiPayload.paymentPublicKey);
	tx.addOutput({ script: btc.Script.encode(['RETURN', hex.decode(data)]), amount: BigInt(0) });
	tx.addOutputAddress(sbtcWalletAddress!, BigInt(uiPayload.amountSats), net);
	const changeAmount = inputAmt(tx) - (uiPayload.amountSats + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(changeAmount), net);
	return tx;
}

/**
 * @param network 
 * @param uiPayload 
 * @param btcFeeRates 
 * @param utxos:Array<UTXO>
 * @param commitTxAddress 
 * @returns Transaction from @scure/btc-signer
 */
export function buildDepositTransactionOpDrop (network:string, uiPayload:DepositPayloadUIType, btcFeeRates:any, utxos:Array<UTXO>, commitTxAddress:string) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const txFees = calculateDepositFees(network, true, uiPayload.amountSats, btcFeeRates.feeInfo, utxos, commitTxAddress, undefined)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	addInputs(network, uiPayload.amountSats, revealPayment, tx, false, utxos, uiPayload.paymentPublicKey);
	tx.addOutputAddress(commitTxAddress, BigInt(uiPayload.amountSats), net );
	const changeAmount = inputAmt(tx) - (uiPayload.amountSats + txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(uiPayload.bitcoinAddress, BigInt(changeAmount), net);
	return tx;
}

export function getBridgeDeposit(network:string, uiPayload:DepositPayloadUIType, originator:string):BridgeTransactionType {
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

export function getBridgeDepositOpDrop(network:string, sbtcWalletPublicKey:string, uiPayload:DepositPayloadUIType, originator:string):BridgeTransactionType {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	
	const data = buildData(network, uiPayload.principal, uiPayload.amountSats);
	const scripts =  [
		{ script: btc.Script.encode([hex.decode(data), 'DROP', hex.decode(sbtcWalletPublicKey), 'CHECKSIG']) },
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

function buildData (network:string, principal:string, revealFee:number):string {
	return buildDepositPayloadOpDrop(network, principal, revealFee);
}

export function maxCommit(addressInfo:any) {
	if (!addressInfo || !addressInfo.utxos || addressInfo.utxos.length === 0) return 0;
	const summ = addressInfo?.utxos?.map((item:{value:number}) => item.value).reduce((prev:number, curr:number) => prev + curr, 0);
	return summ || 0;
}

function calculateDepositFees (network:string, opDrop:boolean, amount:number, feeInfo:any, utxos:Array<UTXO>, commitTxScriptAddress:string, data:Uint8Array|undefined) {
	try {
		const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
		let vsize = 0;
		const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
		addInputs(network, amount, revealPayment, tx, true, utxos, hex.encode(secp.getPublicKey(privKey, true)));
		if (!opDrop) {
			if (data) tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
			tx.addOutputAddress(commitTxScriptAddress, BigInt(amount), net);
		} else {
			tx.addOutputAddress(commitTxScriptAddress, BigInt(amount), net );
		}
		const changeAmount = inputAmt(tx) - (amount); 
		if (changeAmount > 0) tx.addOutputAddress(commitTxScriptAddress, BigInt(changeAmount), net);
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
