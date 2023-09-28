import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import type { Transaction } from '@scure/btc-signer';
import { BridgeTransactionType, getPegWalletAddressFromPublicKey } from './index.js';

export function buildRevealOrReclaimTransaction (network:string, txFee:number, reclaim:boolean, peginRequest:BridgeTransactionType, commitTransaction:any):btc.Transaction {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const tx:Transaction = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	const script = peginRequest.commitTxScript //toStorable(peginRequest.commitTxScript)
	if (!peginRequest || !script) throw new Error('Incorrect data passed')
	if (!peginRequest.btcTxid) peginRequest.btcTxid = '72d1cebc1bb22757f549063926006f680fd5cb9e3388a214244735d8dd124533'
	let outAddr = getPegWalletAddressFromPublicKey(network, peginRequest.uiPayload.sbtcWalletPublicKey);
	if (script.paymentType === 'wsh') {
		if (!script.witnessScript) throw new Error('Incorrect data passed')
		//const script = btc.RawTx.decode(hex.decode(tx.hex));
		const nextI:btc.TransactionInput = {
			txid: hex.decode(peginRequest.btcTxid),
			index: 0,
			witnessScript: (script.witnessScript as Uint8Array),
			witnessUtxo: {
				script: (script.script as Uint8Array), //(pegInData.requestData.commitTxScript.witnessScript),
				amount: BigInt(peginRequest.uiPayload.amountSats)
			}
		}
		//console.log('nextI: ', nextI)
		tx.addInput(nextI);
	} else if (script.paymentType === 'tr') {
		if (!peginRequest.commitTxScript) throw new Error('Incorrect data passed')
		if (!peginRequest.commitTxScript.address) throw new Error('Incorrect data passed')
		if (!script.tapMerkleRoot) throw new Error('Incorrect data passed')
		if (!script.tapInternalKey) throw new Error('Incorrect data passed')
		const sbtcWalletAddrScript = btc.Address(net).decode(outAddr!)
		if (sbtcWalletAddrScript.type !== 'tr') throw new Error('Taproot required')
		//const fromBtcAddressScript = btc.Address(net).decode(peginRequest.uiPayload.bitcoinAddress);
		//if (fromBtcAddressScript.type !== 'tr') throw new Error('Taproot required')

		const commitAddressScript = btc.Address(net).decode(peginRequest.commitTxScript.address);
		if (commitAddressScript.type !== 'tr') throw new Error('Taproot required')

		//const BIP32Der = P.struct({
		//	fingerprint: P.U32BE,
		//	path: P.array(null, P.U32LE),
		//  });
		  
		//tapLeafScript?: [{
		//	version: number;
		//	internalKey: Uint8Array;
		//	merklePath: Uint8Array[];
		//}, Uint8Array][]

		//[Uint8Array, { hashes: Uint8Array[]; der: { path: number[]; fingerprint: number; }; }][]
		// sparrow master fp: 6bd2008b
		// core master fp: 760ce8cf
		/**
		let scriptIndex = 0;
		let tapInternalKey = sbtcWalletAddrScript.pubkey;
		if (reclaim) {
			scriptIndex = 1;
			tapInternalKey = fromBtcAddressScript.pubkey;
		}
		const leafScript = [
			[
				{
					version: script.tapLeafScript[scriptIndex][0].version,
					internalKey: fromBtcAddressScript.pubkey, //script.tapLeafScript[scriptIndex][0].internalKey,
					merklePath: script.tapLeafScript[scriptIndex][0].merklePath,
				},
				script.tapLeafScript[scriptIndex][1],
			]
		]
		const bip32Derivation = [
			[commitAddressScript.pubkey,
			{
				der: {
					fingerprint: P.U32BE.decode(hex.decode('00000000')),
					path: [86,1,0] // P.array(null, P.U32LE),
				},
				hashes: [ script.leaves[scriptIndex].hash ]
			}]
		]
	  
		const tapBip32Derivation = [
			[script.tapLeafScript[scriptIndex][0].internalKey,
			{
				der: {
					fingerprint: P.U32BE.decode(hex.decode('6bd2008b')),
					path: [86,1,0] // P.array(null, P.U32LE),
				},
				hashes: [ script.leaves[scriptIndex].hash ]
			}]
		]
		 */
	  
		const nextI:btc.TransactionInput = {
			txid: hex.decode(peginRequest.btcTxid),
			index: 0,
			//sighashType: btc.SignatureHash.ALL,
			nonWitnessUtxo: (commitTransaction.hex),
			//tapBip32Derivation: 'tr([760ce8cf/86\'/1\'/0\'/0/1]264bd0d3bd80ea2da383b0a2a29f53d258e05904d2279f5f223053b987a3fd56)#j4wq04cw',
			//tapBip32Derivation: [script.tapInternalKey as Uint8Array, {
			//	hashes: script.leaves[0].hash,
			//}],
			//tapInternalKey: (script.tapInternalKey as Uint8Array),
			// [{
			//		//version: script.tapLeafScript[0][0].version as number,
			//		internalKey: script.tapLeafScript[0][0].internalKey as Uint8Array,
			//		merklePath: script.tapLeafScript[0][0].merklePath,
			//	
			//}, script.tapLeafScript[0][1]],
			//witnessScript: (script.leaves[1].script as Uint8Array),
			//witnessUtxo: {
			//	script: (script.leaves[1].script as Uint8Array), //(pegInData.requestData.commitTxScript.witnessScript),
			//	amount: BigInt(commitTx.amount)
			//}
			//bip32Derivation: tapBip32Derivation,
			//tapBip32Derivation: tapBip32Derivation,
			tapLeafScript: script.tapLeafScript,
			//tapInternalKey: script.tapInternalKey as Uint8Array,
			//tapInternalKey,
			tapMerkleRoot: script.tapMerkleRoot as Uint8Array
		}
		//console.log('nextI: ', nextI)
		tx.addInput(nextI);
	}

	if (reclaim) outAddr = peginRequest.uiPayload.bitcoinAddress;

	const amount = peginRequest.uiPayload.amountSats - txFee;
	/**
	if (addressInfo.utxos.length === -1) { // never
		const feeUtxo = addInputForFee(tx);
		amount = peginRequest.uiPayload.amountSats + feeUtxo?.value - fee;
	}
	 */
	tx.addOutputAddress(outAddr!, BigInt(amount), net);

	/**
	 */
	if (network === 'testnet') {
		try {
			//const testAddrs = getTestAddresses(CONFIG.VITE_NETWORK);	
			if (reclaim) {
				tx.sign(hex.decode('eb80b7f63eb74a215b6947b479e154a83cf429691dceab272c405b1614efb98c'));
				tx.finalize();
			} else {
				tx.sign(hex.decode('93a7e5ecde5eccc4fd858dfcf7d92011eade103600de0e8122d6fc5ffedf962d'));
				tx.finalize();
			}
		} catch(err) {
			console.log(err)
		}
	}
	const txBytes = hex.encode(tx.toBytes());
	//console.log('rawTransaction: ' + txBytes);
	return tx;
}
