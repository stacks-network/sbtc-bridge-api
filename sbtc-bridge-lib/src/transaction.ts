import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
//import { fetchUtxoSet } from "$lib/bridge_api";
import { MAGIC_BYTES_TESTNET, MAGIC_BYTES_MAINNET, PEGIN_OPCODE } from './payload_utils.js' 
import * as P from 'micro-packed';
import { c32addressDecode } from 'c32check';
import * as secp from '@noble/secp256k1';
import { utf8ToBytes } from '@stacks/common';
import type { PeginRequestI, UTXO, KeySet, PeginScriptI } from './types/sbtc_types.js'
import type { Transaction } from '@scure/btc-signer'

export type MintData = {
	btcTxid?: string;
	currentImage?: string;
	revealFeeWithGas: number;
	feeIndex: number;
	peginRequest?:PeginRequestI;
	ordinal: string;
	cardinal: string;
	stxAddress: string;
	keys: KeySet;
	walletAddress: string;
	btcFeeRates: any;
	txFees?: Array<number>;
	tx?: Transaction;
  }
  
  
const concat = P.concatBytes;
const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');
export const revealPayment = 10001

export async function fetchUtxos (address:string ):Promise<any> {
	const path = 'https://bridge.stx.eco/bridge-api/testnet/v1/btc/wallet/address/' + address + '/utxos?verbose=true';
	const response = await fetch(path);
	if (response.status !== 200) {
	  console.log('Bitcoin address not known - is the network correct?');
	}
	return await response.json();
  }

export function buildRevealTransaction (txFee:number, reclaim:boolean, peginRequest:PeginRequestI, inTx:any, walletAddress:string):btc.Transaction {
	const net = btc.TEST_NETWORK;
	const tx:btc.Transaction = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
	const script = peginRequest.commitTxScript; //fromStorable(peginRequest.commitTxScript)

	if (!peginRequest || !script) throw new Error('Incorrect data passed')
	if (!peginRequest.btcTxid) throw new Error('No commit transaction')
	if (script.paymentType === 'wsh') {
		if (!script.witnessScript) throw new Error('Incorrect data passed')
		//const script = btc.RawTx.decode(hex.decode(tx.hex));
		const nextI:btc.TransactionInput = {
			txid: hex.decode(peginRequest.btcTxid),
			index: 0,
			witnessScript: (script.witnessScript as Uint8Array),
			witnessUtxo: {
				script: (script.script as Uint8Array),
				amount: BigInt(peginRequest.amount)
			}
		}
		console.log('nextI: ', nextI)
		tx.addInput(nextI);
	} else if (script.paymentType === 'tr') {
		if (!peginRequest.commitTxScript) throw new Error('Incorrect data passed')
		if (!peginRequest.commitTxScript.address) throw new Error('Incorrect data passed')
		if (!script.tapMerkleRoot) throw new Error('Incorrect data passed')
		if (!script.tapInternalKey) throw new Error('Incorrect data passed')
		//const sbtcWalletAddrScript = btc.Address(net).decode(walletAddress)
		//if (sbtcWalletAddrScript.type !== 'tr') throw new Error('Taproot required')
		//const commitAddressScript = btc.Address(net).decode(peginRequest.commitTxScript.address);
		//if (commitAddressScript.type !== 'tr') throw new Error('Taproot required')	  
		const nextI:btc.TransactionInput = {
			txid: hex.decode(peginRequest.btcTxid),
			index: 0,
			nonWitnessUtxo: (inTx.hex),
			tapLeafScript: script.tapLeafScript,
			tapMerkleRoot: script.tapMerkleRoot as Uint8Array
		}
		console.log('nextI: ', nextI)
		tx.addInput(nextI);
	}

	let outAddr = walletAddress;
	if (reclaim) outAddr = peginRequest.fromBtcAddress;

	const amount = peginRequest.amount - txFee;
	tx.addOutputAddress(outAddr, BigInt(amount), net);

	/**
	if (CONFIG.VITE_NETWORK === 'testnet') {
		try {
			//const testAddrs = getTestAddresses(CONFIG.VITE_NETWORK);	
			if (reclaim) {
				tx.sign(hex.decode(pubKeys.reclaimPubKey));
				tx.finalize();
			} else {
				tx.sign(hex.decode(pubKeys.revealPubKey));
				tx.finalize();
			}
		} catch(err) {
			console.log(err)
		}
	}
	*/

	const txHex = hex.encode(tx.extract());
	console.log('rawTransaction: ' + txHex);
	return tx;
}


export function buildOpDropTransaction (mintData:MintData, addressInfo:any) {
	if (!mintData.currentImage) throw new Error('no data present')
	const amount = mintData.revealFeeWithGas;
	const net = btc.TEST_NETWORK;
	const utxos = addressInfo.utxos;
	mintData.txFees = calculateFees(amount, mintData.btcFeeRates.feeInfo, utxos, mintData.ordinal, mintData.cardinal)
	const tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
	addInputs(amount, tx, false, utxos);
	const peginReqest = getOpDropPeginRequest(mintData)
	if (!peginReqest.commitTxScript || !peginReqest.commitTxScript.address ) throw new Error('buildOpDropTransaction: address required!');
	tx.addOutputAddress(peginReqest.commitTxScript.address, BigInt(amount), net );
	const changeAmount = inputAmt(tx) - (amount + mintData.txFees[1]); 
	if (changeAmount > 0) tx.addOutputAddress(mintData.cardinal, BigInt(changeAmount), net);
	return { mintData, tx };
}

export function getOpDropPeginRequest (mintData:MintData) {
	if (!mintData.currentImage) throw new Error('no data present')
	const amount = mintData.revealFeeWithGas;
	const net = btc.TEST_NETWORK;
	console.log('reclaimAddr.pubkey: ' + mintData.keys.deposits.reclaimPubKey)
	console.log('revealAddr.pubkey: ' + mintData.keys.deposits.revealPubKey)
	const data = buildData(mintData);
	//const scripts =  [
	//	{ script: btc.Script.encode([data, 'DROP', hex.decode(this.commitKeys.revealPub), 'CHECKSIG']) },
	//	{ script: btc.Script.encode([hex.decode(this.commitKeys.reclaimPub), 'CHECKSIG']) }
	//]
	const scripts =  [
		{ script: data },
		{ script: btc.Script.encode([hex.decode(mintData.keys.deposits.reclaimPubKey), 'CHECKSIG']) }
	]
	const script = btc.p2tr(btc.TAPROOT_UNSPENDABLE_KEY, scripts, net, true) as btc.P2TROut;
	const req:PeginRequestI = {
		fromBtcAddress: mintData.cardinal,
		revealPub: mintData.keys.deposits.revealPubKey,
		reclaimPub: mintData.keys.deposits.reclaimPubKey,
		status: 1,
		tries: 0,
		mode: 'op_drop',
		amount,
		requestType: 'deposit',
		wallet: 'p2tr(TAPROOT_UNSPENDABLE_KEY, [{ script: Script.encode([data, \'DROP\', revealPubK, \'CHECKSIG\']) }, { script: Script.encode([reclaimPubKey, \'CHECKSIG\']) }], net, true)',
		originator: mintData.stxAddress,
		stacksAddress: mintData.stxAddress,
		sbtcWalletAddress: mintData.walletAddress,
	}
	req.commitTxScript = Object.assign(script) // toStorable(script)
	return req;
}

export function calculateFees (amount:number, feeInfo:{ low_fee_per_kb:number, medium_fee_per_kb:number, high_fee_per_kb:number }, utxos:Array<UTXO>, commitTxScriptAddress:string, changeAddress:string) {
	const net = btc.TEST_NETWORK;
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
}

export function buildDepositPayload (net:any, address:string):Uint8Array {
		const magicBuf = (typeof net === 'object' && net.bech32 === 'tb') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
		const opCodeBuf = hex.decode(PEGIN_OPCODE);
		const addr = c32addressDecode(address.split('.')[0])
		const addr0Buf = hex.decode(addr[0].toString(16));
		const addr1Buf = hex.decode(addr[1]);
	
		let buf1 = concat(opCodeBuf, addr0Buf, addr1Buf);
		if (address.indexOf('.') > -1) {
			const cnameBuf = new TextEncoder().encode(address.split('.')[1]);
			buf1 = concat(buf1, cnameBuf);
		}
				
		return concat(magicBuf, buf1)
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

function buildData (mintData:MintData) {
	const net = btc.TEST_NETWORK;
	const ord = utf8ToBytes('ord')
	const ct = utf8ToBytes('text/plain;charset=utf-8')
	const msg = utf8ToBytes('Hello Raphael')
	const addr1 = btc.Address(net).decode(mintData.ordinal)
	if (addr1.type !== 'tr') throw new Error('Wrong address type')
	//return btc.Script.encode([addr1.pubkey, 'CHECKSIG', 0, 'IF', ord, ct, msg, 'ENDIF'])
	return btc.Script.encode([hex.decode(mintData.keys.deposits.revealPubKey), 'CHECKSIG', 0, 'IF', ord, ct, msg, 'ENDIF'])

/**
		OP_IF
		  OP_PUSH "ord"
		  OP_PUSH 1
		  OP_PUSH "text/plain;charset=utf-8"
		  OP_PUSH 0
		  OP_PUSH "Hello, world!"
		OP_ENDIF		

		OP_PUSHBYTES_32 bad5e0c0a331133fa5926c30a2c9d0f5a8b295d6050b8d34dccc8bab5846d3a6
OP_CHECKSIG
OP_0
OP_IF
OP_PUSHBYTES_3 6f7264
OP_PUSHBYTES_1 01
OP_PUSHBYTES_10 696d6167652f6a706567
OP_0
OP_PUSHDATA2 ffd8ffe000104a46494600010100000100010000fffe001f436f6d70726573736564206279206a7065672d7265636f6d7072657373ffdb0084000404040404040404040406060506060807070707080c09090909090c130c0e0c0c0e0c131114100f1014111e171515171e221d1b1d222a25252a34323444445c010404040404040404040406060506060807070707080c09090909090c130c0e0c0c0e0c131114100f1014111e171515171e221d1b1d222a25252a34323444445cffc20011080200020003012200021101031101ffc4001d000100010403010000000000000000000000010206070803040509ffda0008010100000000d46fa297e4800000000000001627cf1fa0b9100000000000000029b26f98840901200000004080264899a0000990000042000015522aa40009900001080000013348001290000041000004ca900013200000204000054a4000264000001100002654800012900000110000545200004c80000204000151480004c8000008040005452098005400250008125200264a425001321558b6b53d5f32daca17bfbc000110002a29094004ca6c1c59e35ef78f42d8e9df9182ae8f67d2f5724f726000a40099290000ab1cd8bea5d3514cb1c593dcce54631bef13e5cca8f02d5c9002100132440000b03c8f7288888f23c1e8deddcb5ecacbbd0c7bdec4d9d711636cbbdbda3e6010412248800018cbbf5743cc
OP_PUSHDATA2 afd9b3ed2bdf86eab73d0d78f071cda3ef
OP_PUSHBYTES_27 ddeef466bb68f5847df1f7063eee3d079573aec358a3d4815fffd9
OP_ENDIF
 */
}

