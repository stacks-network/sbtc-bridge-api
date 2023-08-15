import * as btc from '@scure/btc-signer';
import * as secp from '@noble/secp256k1';
import * as P from 'micro-packed';
import { hex } from '@scure/base';
import type { KeySet, PeginRequestI, UTXO } from './types/sbtc_types.js' 
import { toStorable } from './payload_utils.js' 
import { getDataToSign, buildWithdrawalPayload, amountToBigUint64, bigUint64ToAmount } from './payload_utils.js' 
import { addInputs, inputAmt } from './wallet_utils.js';

const concat = P.concatBytes;

const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');
export const revealPayment = 10001
export const dust = 500

export function buildOpReturnWithdrawTransaction(network:string, amount:number, signature:string, addressInfo:any, commitKeys:any, btcFeeRates:any, stacksAddress:string, sbtcWalletAddress:string, changeAddress:string, userPaymentPubKey:string) {
	if (!signature) throw new Error('Signature of output 2 scriptPubKey is required');
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const data = buildData(network, amount, signature, false)
	const txFees = calculateWithdrawFees(network, false, addressInfo, amount, btcFeeRates, sbtcWalletAddress, changeAddress, userPaymentPubKey, data)
	const tx = new btc.Transaction({ allowUnknowOutput: true });
	addInputs(network, amount, revealPayment, tx, false, addressInfo.utxos, userPaymentPubKey);
	if (!signature) throw new Error('Signature of the amount and output 2 scriptPubKey is missing.')
	tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
	const change = inputAmt(tx) - (dust + txFees[1]);
	if (change > 0) tx.addOutputAddress(changeAddress, BigInt(change), net);
	tx.addOutputAddress(sbtcWalletAddress, BigInt(dust), net);
	return tx;
}

export function buildOpDropWithdrawTransaction (network:string, amount:number, signature:string, addressInfo:any, commitKeys:any, btcFeeRates:any, stacksAddress:string, sbtcWalletAddress:string, changeAddress:string, userPaymentPubKey:string) {
	if (!signature) throw new Error('Signature of output 2 scriptPubKey is required');
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const txFees = calculateWithdrawFees(network, true, addressInfo, amount, btcFeeRates, sbtcWalletAddress, changeAddress, userPaymentPubKey, undefined)
	const tx = new btc.Transaction({ allowUnknowOutput: true });
	addInputs(network, amount, revealPayment, tx, false, addressInfo.utxos, userPaymentPubKey);
	if (!signature) throw new Error('Signature of the amount and output 2 scriptPubKey is missing.')
	const data = buildData(network, amount, signature, true)
	const csvScript = getWithdrawScript(network, data, sbtcWalletAddress, changeAddress);
	if (!csvScript ) throw new Error('script required!');
	getOpDropWithdrawRequest(network, amount, sbtcWalletAddress, stacksAddress, signature, commitKeys, changeAddress)
	tx.addOutput({ script: csvScript.script, amount: BigInt(dust) });
	const change = inputAmt(tx) - (dust + txFees[1]);
	if (change > 0) tx.addOutputAddress(changeAddress, BigInt(change), net);
	return tx;
}

export function dataToSign(network:string, amount:number, fromBtcAddress:string) {
	const data = getDataToSign(network, amount, fromBtcAddress)
	return hex.encode(data);
}

export function calculateWithdrawFees(network:string, opDrop:boolean, addressInfo:any, amount:number, feeInfo:{ low_fee_per_kb:number, medium_fee_per_kb:number, high_fee_per_kb:number }, sbtcWalletAddress:string, changeAddress:string, userPaymentPubKey:string, data:Uint8Array|undefined) {
	try {
		let vsize = 0;
		const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
		const tx = new btc.Transaction({ allowUnknowOutput: true });
		addInputs(network, amount, revealPayment, tx, true, addressInfo.utxos, userPaymentPubKey);
		if (!opDrop) {
			if (data) tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: BigInt(0) });
			tx.addOutputAddress(sbtcWalletAddress, BigInt(dust), net);
		} else {
			tx.addOutput({ script: sbtcWalletAddress, amount: BigInt(dust) });
		}
		const change = inputAmt(tx) - (dust);
		if (change > 0) tx.addOutputAddress(changeAddress, BigInt(change), net);
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

export function getWithdrawScript (network:string, data:Uint8Array, sbtcWalletAddress:string, fromBtcAddress:string):{type:string, script:Uint8Array} {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const addrScript = btc.Address(net).decode(sbtcWalletAddress)
	if (addrScript.type === 'wpkh') {
		return {
			type: 'wsh',
			script: btc.Script.encode([data, 'DROP', btc.p2wpkh(addrScript.hash).script])
		}
	} else if (addrScript.type === 'tr') {
		return {
			type: 'tr',
			//script: btc.Script.encode([data, 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG'])
			//script: btc.Script.encode([data, 'DROP', 'IF', 144, 'CHECKSEQUENCEVERIFY', 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG', 'ELSE', 'DUP', 'HASH160', sbtcWalletUint8, 'EQUALVERIFY', 'CHECKSIG', 'ENDIF'])
			//script: btc.Script.encode([data, 'DROP', btc.p2tr(hex.decode(pubkey2)).script])
			script: btc.Script.encode([data, 'DROP', btc.p2tr(addrScript.pubkey).script])
		}
	} else {
		const asmScript = btc.Script.encode([data, 'DROP', 
			'IF', 
			btc.OutScript.encode(btc.Address(net).decode(sbtcWalletAddress)),
			'ELSE', 
			144, 'CHECKSEQUENCEVERIFY', 'DROP',
			btc.OutScript.encode(btc.Address(net).decode(fromBtcAddress)),
			'CHECKSIG',
			'ENDIF'
		])
		return {
			type: 'tr',
			//script: btc.Script.encode([data, 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG'])
			//script: btc.Script.encode([data, 'DROP', 'IF', 144, 'CHECKSEQUENCEVERIFY', 'DROP', btc.OutScript.encode(btc.Address(net).decode(this.fromBtcAddress)), 'CHECKSIG', 'ELSE', 'DUP', 'HASH160', sbtcWalletUint8, 'EQUALVERIFY', 'CHECKSIG', 'ENDIF'])
			//script: btc.Script.encode([data, 'DROP', btc.p2tr(hex.decode(pubkey2)).script])
			script: btc.p2tr(asmScript).script
		}
	}
}

  export function getOpDropWithdrawRequest(network:string, amount:number, sbtcWalletAddress:string, stacksAddress:string, signature:string, commitKeys:KeySet, fromBtcAddress:string):PeginRequestI {
	const data = buildData(network, amount, signature, true);
	console.log('reclaimAddr.pubkey: ' + commitKeys.deposits.revealPubKey)
	console.log('revealAddr.pubkey: ' + commitKeys.deposits.revealPubKey)
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	
	const scripts =  [
	  { script: btc.Script.encode([data, 'DROP', hex.decode(commitKeys.deposits.revealPubKey), 'CHECKSIG']) },
	  { script: btc.Script.encode([hex.decode(commitKeys.deposits.revealPubKey), 'CHECKSIG']) }
	]
	const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true);
	const req:PeginRequestI = {
	  originator: stacksAddress,
	  fromBtcAddress: fromBtcAddress,
	  revealPub: commitKeys.deposits.revealPubKey,
	  reclaimPub: commitKeys.deposits.revealPubKey,
	  status: 1,
	  tries: 0,
	  mode: 'op_drop',
	  amount: amount,
	  requestType: 'withdrawal',
	  wallet: 'p2tr(TAPROOT_UNSPENDABLE_KEY, [{ script: Script.encode([data, \'DROP\', revealPubK, \'CHECKSIG\']) }, { script: Script.encode([reclaimPubKey, \'CHECKSIG\']) }], net, true)',
	  stacksAddress: stacksAddress,
	  sbtcWalletAddress: sbtcWalletAddress,
	}
	req.commitTxScript = toStorable(script)
	return req;
  }
  
  export function getOpReturnWithdrawRequest(network:string, amount:number, sbtcWalletAddress:string, stacksAddress:string, signature:string, commitKeys:KeySet, fromBtcAddress:string):PeginRequestI {
	const data = buildData(network, amount, signature, false);
	console.log('reclaimAddr.pubkey: ' + commitKeys.deposits.reclaimPubKey)
	console.log('revealAddr.pubkey: ' + commitKeys.deposits.revealPubKey)
	
	const req:PeginRequestI = {
	  originator: stacksAddress,
	  fromBtcAddress: fromBtcAddress,
	  revealPub: commitKeys.deposits.revealPubKey,
	  reclaimPub: commitKeys.deposits.reclaimPubKey,
	  status: 1,
	  tries: 0,
	  mode: 'op_return',
	  amount: amount,
	  requestType: 'withdrawal',
	  wallet: hex.encode(data),
	  stacksAddress: stacksAddress,
	  sbtcWalletAddress: sbtcWalletAddress,
	}
	return req;
  }
  
  function buildData(network:string, amount:number, sigOrPrin:string, opDrop:boolean):Uint8Array {
	const sats = amount;
	const amt = amountToBigUint64(amount, 8)
	const tamt = bigUint64ToAmount(amt)
	console.log('Sats (be, buf=1): ' + sats + ' amountToBigUint64:' + hex.encode(amt) + ' bigUint64ToAmount:' + tamt)
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	return buildWithdrawalPayload(net, amount, hex.decode(sigOrPrin), opDrop)
  }
