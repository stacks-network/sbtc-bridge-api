import * as secp from '@noble/secp256k1';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { c32address, c32addressDecode } from 'c32check';
import * as P from 'micro-packed';
import { bitcoinToSats } from './formatting.js'
import type { WithdrawalPayloadType, DepositPayloadType, PayloadType } from './types/sbtc_types.js'
import { verifyMessageSignature, hashMessage } from '@stacks/encryption';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { recoverSignature } from "micro-stacks/connect";

const concat = P.concatBytes;

export const MAGIC_BYTES_TESTNET = '5432';
export const MAGIC_BYTES_MAINNET = '5832';
export const PEGIN_OPCODE = '3C';
export const PEGOUT_OPCODE = '3E';

const priv = secp.utils.randomPrivateKey()
type KeySet = {
	priv: Uint8Array,
	ecdsaPub: Uint8Array,
	schnorrPub: Uint8Array
}
const keySetForFeeCalculation: KeySet[] = []
keySetForFeeCalculation.push({
  priv,
  ecdsaPub: secp.getPublicKey(priv, true),
  schnorrPub: secp.getPublicKey(priv, false)
})

export function parseDepositPayload(d1:Uint8Array, amountSats: number):DepositPayloadType {
	const magicOp = getMagicAndOpCode(d1);
	if (magicOp.magic) {
		return parseDepositPayloadNoMagic(d1.subarray(2), amountSats);
	}
	return parseDepositPayloadNoMagic(d1, amountSats);
}

function parseDepositPayloadNoPrincipal(d1:Uint8Array, amountSats: number):DepositPayloadType {
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	const addr0 = parseInt(hex.encode(d1.subarray(1,2)), 8);
	const addr1 = hex.encode(d1.subarray(2,22));
	const stacksAddress = c32address(addr0, addr1);
	return {
		opcode,
		prinType: 0,
		stacksAddress,
		lengthOfCname: 0,
		cname: undefined,
		lengthOfMemo: 0,
		memo: undefined,
		revealFee: 0,
		amountSats
	};
}

function parseDepositPayloadNoMagic(d1:Uint8Array, amountSats: number):DepositPayloadType {
    //console.log('payload rev: ', hex.encode(d1))
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	if (opcode !== '3C') throw new Error('Wrong opcode for deposit: should be 3C was ' + opcode)
	const prinType = parseInt(hex.encode(d1.subarray(1,2)), 8);
	if (prinType === 22 || prinType === 26) return parseDepositPayloadNoPrincipal(d1, amountSats)
	const addr0 = parseInt(hex.encode(d1.subarray(2,3)), 16);
	const addr1 = hex.encode(d1.subarray(3,23));
	const stacksAddress = c32address(addr0, addr1);
	const lengthOfCname = parseInt(hex.encode(d1.subarray(23,24)), 8);
	let cname;
	if (lengthOfCname > 0) {
	  cname = new TextDecoder().decode(d1.subarray(24, 24 + lengthOfCname));
	}

	let current = 24 + lengthOfCname;
	let memo;
	const lengthOfMemo = parseInt(hex.encode(d1.subarray(current, current + 1)), 8);
	if (lengthOfMemo > 0) {
		memo = new TextDecoder().decode(d1.subarray(current + 1, lengthOfMemo + current + 1));
	}
	current = current + 1 + lengthOfMemo;
	const rev = d1.subarray(current);
	const revealFee = bigUint64ToAmount(rev)

	//const view = new DataView(hex.decode(hex.encode(rev)).buffer, 0, 8);
	//const revealFee = Number(view.getBigUint64(0));

	
	if (opcode.toUpperCase() !== PEGIN_OPCODE) 
	  throw new Error('Wrong OPCODE : expected: ' +  PEGIN_OPCODE + '  received: ' + opcode)
  
	return {
		opcode,
		prinType,
		stacksAddress,
		lengthOfCname,
		cname,
		lengthOfMemo,
		memo,
		revealFee,
		amountSats
	};
}

export function amountToUint8(amt:number, size:number):Uint8Array {
	const buffer = new ArrayBuffer(size);
	const view = new DataView(buffer);
	view.setUint8(0, amt); // Max unsigned 32-bit integer
	const res = new Uint8Array(view.buffer);
	return res;
}

/**
export function uint8ToAmount(buf:Uint8Array):number {
	const hmmm = hex.decode(hex.encode(buf)) // needed to make work ?
	const view = new DataView(hmmm.buffer);
	const amt = view.getUint32(0);
	return amt;
}
 */
export function amountToBigUint64(amt:number, size:number) {
	//P..U64BE(BigInt(amt))
	const buffer = new ArrayBuffer(size);
	const view = new DataView(buffer);
	view.setBigUint64(0, BigInt(amt)); // Max unsigned 32-bit integer
	const res = new BigUint64Array(view.buffer);
	return hex.decode(bufferToHex(res.buffer))
	//(amt.toString(16).padStart(16, "0"))
}
function bufferToHex (buffer:ArrayBuffer) {
    return [...new Uint8Array (buffer)]
        .map (b => b.toString (16).padStart (2, "0"))
        .join ("");
}

export function bigUint64ToAmount(buf:Uint8Array):number {
	// rencode in case it was passed in a string encoded.
	buf = hex.decode(hex.encode(buf));
	const view = new DataView(buf.buffer, 0, 8);
	const amt = view.getBigUint64(0);
	return Number(amt);
}

export function parseWithdrawalPayload(network:string, d1:Uint8Array, bitcoinAddress:string):WithdrawalPayloadType {
	const magicOp = getMagicAndOpCode(d1);
	if (magicOp.magic) {
		return parseWithdrawalPayloadNoMagic(network, d1.subarray(2), bitcoinAddress);
	}
	return parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress);
}

function parseWithdrawalPayloadNoMagic(network:string, d1:Uint8Array, bitcoinAddress:string):WithdrawalPayloadType {
	//console.log('parseWithdrawalPayloadNoMagic: d1: ', hex.encode(d1))
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	if (opcode !== '3E') throw new Error('Wrong opcode for withdraw: should be 3E was ' + opcode)
    //console.log('parseWithdrawalPayloadNoMagic opcode: ', opcode)
	const amtB = d1.subarray(1, 9)
    //console.log('parseWithdrawalPayloadNoMagic amountSats: ', hex.encode(amtB))
	const amountSats = bigUint64ToAmount(amtB);
    //console.log('parseWithdrawalPayloadNoMagic amtB: ', hex.encode(amtB))
    //console.log('parseWithdrawalPayloadNoMagic amountSats: ', amountSats)
	let signature = (hex.encode(d1.subarray(9, 74)));

	//if (signature.startsWith('00')) signature = reverseSigBits(signature)
    //console.log('parseWithdrawalPayloadNoMagic signature: ', signature)

	const msgHash = getStacksSimpleHashOfDataToSign(network, amountSats, bitcoinAddress);
    //console.log('parseWithdrawalPayloadNoMagic msgHash: ' + msgHash)
	const pubKey = getPubkeySignature(hex.decode(msgHash), signature)
    //console.log('parseWithdrawalPayloadNoMagic pubKey: ' + hex.encode(pubKey))
	const v = verifyMessageSignature({ signature, message: msgHash, publicKey: hex.encode(pubKey) })
    //console.log('parseWithdrawalPayloadNoMagic v: ' + v)

	//console.log('parseWithdrawalPayloadNoMagic msgHash: ', msgHash)
	const stxAddresses = getStacksAddressFromPubkey(pubKey);
	//console.log('const stxAddresses = getStacksAddressFromSignature(hex.decode(msgHash), signature, compression);')
	//console.log('stxAddresses: ', stxAddresses)
	const stacksAddress = (network === 'testnet') ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
	return {
		opcode,
		stacksAddress,
		signature: (signature),
		amountSats
	};
}

export enum PrincipalType {
	STANDARD = '05',
	CONTRACT = '06'
}

export function buildDepositPayloadOpReturn(net:any, address:string):Uint8Array {
	const magicBuf = (typeof net === 'object' && net.bech32 === 'tb') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGIN_OPCODE);
	const addr = c32addressDecode(address.split('.')[0])
	const addr0Buf = hex.decode(addr[0].toString(16));
	const addr1Buf = hex.decode(addr[1]);

	const cnameLength = new Uint8Array(1);
	const principalType = (address.indexOf('.') > -1) ? hex.decode(PrincipalType.CONTRACT.valueOf()) : hex.decode(PrincipalType.STANDARD.valueOf());
	let buf1 = concat(opCodeBuf, addr0Buf, addr1Buf);
	if (address.indexOf('.') > -1) {
		const cnameBuf = new TextEncoder().encode(address.split('.')[1]);
		const cnameLen = hex.decode(cnameBuf.length.toString(8));
		if (cnameBuf.length > 40) throw new Error('Contract name is too long - max 40 characters')
		buf1 = concat(buf1, cnameLen, cnameBuf);
	} else {
		cnameLength.fill(0);
		buf1 = concat(buf1, cnameLength);
	}

	return concat(magicBuf, buf1)
}

export function buildDepositPayload(net:any, revealFee:number, address:string, opDrop:boolean, memo:string|undefined):Uint8Array {
	const magicBuf = (typeof net === 'object' && net.bech32 === 'tb') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGIN_OPCODE);
	const addr = c32addressDecode(address.split('.')[0])
	//const addr0Buf = hex.encode(amountToUint8(addr[0], 1));
	const addr0Buf = (hex.decode(addr[0].toString(16)));
	const addr1Buf = hex.decode(addr[1]);

	console.log(addr)
	console.log('addr0Buf: ' + hex.encode(addr0Buf))
	console.log('address: ' + address)
	console.log('opCodeBuf: ' + hex.encode(opCodeBuf))
	
	const cnameLength = new Uint8Array(1);
	const memoLength = new Uint8Array(1);
	const principalType = (address.indexOf('.') > -1) ? hex.decode('06') : hex.decode('05');
	let buf1 = concat(opCodeBuf, principalType, addr0Buf, addr1Buf);
	if (address.indexOf('.') > -1) {
		const cnameBuf = new TextEncoder().encode(address.split('.')[1]);
		const cnameLen = hex.decode(cnameBuf.length.toString(8));
		buf1 = concat(buf1, cnameLen, cnameBuf);
	} else {
		cnameLength.fill(0);
		buf1 = concat(buf1, cnameLength);
	}
	
	if (memo) {
		const memoBuf = new TextEncoder().encode(memo);
		const memoLength = hex.decode(memoBuf.length.toString(8));
		buf1 = concat(buf1, memoLength, memoBuf);
	} else {
		memoLength.fill(0);
		buf1 = concat(buf1, memoLength);
	}
	const feeBuf = amountToBigUint64(revealFee, 8)
	buf1 = concat(buf1, feeBuf)
	
	if (!opDrop) return concat(magicBuf, buf1)
	return buf1;
}

export function buildWithdrawalPayload(net:any, amount:number, signature:Uint8Array, opDrop:boolean):Uint8Array {
	const magicBuf = (net === btc.TEST_NETWORK) ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGOUT_OPCODE);
	const amountBuf = amountToBigUint64(amount, 8);
	//const amountRev = bigUint64ToAmount(amountBuf);
	let data = concat(opCodeBuf, amountBuf, signature)
	if (!opDrop) data = concat(magicBuf, opCodeBuf, amountBuf, signature);
	return data;
}

export function parseSbtcWalletAddress(network:string, outputs:Array<any>) {
	try {
		// attempt 1: parse as mempool data structure
		return parseSbtcWalletAddressFromMempool(network, outputs)
	} catch (err:any) {
		return parseSbtcWalletAddressFromBitcoinCore(network, outputs)
	}
}

function parseSbtcWalletAddressFromMempool(network:string, outputs:Array<any>) {
	// attempt 1: parse as mempool data structure
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	let amountSats;
	let bitcoinAddress;
	if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
	  	amountSats = (outputs[1].value.index('.') > -1) ? bitcoinToSats(outputs[1].value) : outputs[1].value;
		bitcoinAddress = outputs[1].scriptPubKey.address;
	} else {
		const scriptHex = outputs[0].scriptPubKey.asm.split(' ')[6];
		const encscript = btc.OutScript.decode(hex.decode(scriptHex));
		amountSats = (outputs[0].value.index('.') > -1) ? bitcoinToSats(outputs[1].value) : outputs[1].value;
		bitcoinAddress = btc.Address(net).encode(encscript);
	}
	// addressFromPubkey(network, outputs[0].scriptPubKey)
	return { bitcoinAddress, amountSats };
}

function parseSbtcWalletAddressFromBitcoinCore(network:string, outputs:Array<any>) {
	// attempt 1: parse as mempool data structure
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	let amountSats;
	let bitcoinAddress;
	if (outputs[0].scriptpubkey_type.toLowerCase() === 'op_return') {
	  	amountSats = outputs[1].value;
		bitcoinAddress = outputs[1].scriptpubkey_address;
	} else {
		const scriptHex = outputs[0].scriptpubkey_asm.split(' ')[6];
		const encscript = btc.OutScript.decode(hex.decode(scriptHex));
	  	amountSats = outputs[0].value;
		bitcoinAddress = btc.Address(net).encode(encscript);  
	}
	// addressFromPubkey(network, outputs[0].scriptPubKey)
	return { bitcoinAddress, amountSats };
}

export function readDepositValue(outputs:Array<any>) {
	let amountSats = 0;
	if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
	  amountSats = bitcoinToSats(outputs[1].value);
	} else {
	  amountSats = bitcoinToSats(outputs[0].value);
	}
	return amountSats;
}
  
export function parseOutputs(network:string, output0:any, bitcoinAddress:string, amountSats: number) {
	if (output0.scriptpubkey_type) return parseOutputsBitcoinCore(network, output0, bitcoinAddress, amountSats)
	const d1 = hex.decode(output0.scriptPubKey.asm.split(' ')[1]);
	const witnessData = getMagicAndOpCode(d1);
	witnessData.txType = output0.scriptPubKey.type;

	let innerPayload:WithdrawalPayloadType|DepositPayloadType;
	if (witnessData.opcode === '3C') {
		innerPayload = parseDepositPayload(d1, amountSats);
		return innerPayload;
	} else if (witnessData.opcode.toUpperCase() === '3E') {
		innerPayload = parseWithdrawalPayload(network, d1, bitcoinAddress)
		return innerPayload;
	} else {
	  throw new Error('Wrong opcode : expected: 3A or 3C :  recieved: ' + witnessData.opcode)
	}
}

function parseOutputsBitcoinCore(network:string, output0:any, bitcoinAddress:string, amountSats: number) {
	const outType = output0.scriptpubkey_type;
  	const txType = (outType === 'nulldata' || outType === 'op_return') ? 'nulldata' : outType;
	const outAsm = output0.scriptpubkey_asm;
  	//console.log('parseOutputsBitcoinCore: outAsm: ' + outAsm);
  	//console.log('parseOutputsBitcoinCore: outType: ' + outType);
	const d1 = hex.decode(outAsm.split(' ')[2]);
  	//console.log('parseOutputsBitcoinCore: outType: ' + outType);
	const witnessData = getMagicAndOpCode(d1);
	witnessData.txType = txType;

	let innerPayload:WithdrawalPayloadType|DepositPayloadType;
	if (witnessData.opcode === '3C') {
		innerPayload = parseDepositPayload(d1, amountSats);
		return innerPayload;
	} else if (witnessData.opcode.toUpperCase() === '3E') {
		innerPayload = parseWithdrawalPayload(network, d1, bitcoinAddress)
		return innerPayload;
	} else {
	  throw new Error('Wrong opcode : expected: 3A or 3C :  receved: ' + witnessData.opcode)
	}
}

export function getDataToSign(network:string, amount:number, bitcoinAddress:string):Uint8Array {
	const amtBuf = amountToBigUint64(amount, 8);
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const script = btc.OutScript.encode(btc.Address(net).decode(bitcoinAddress))
	const data = concat(amtBuf, script);
	return data;
}

export function getStacksSimpleHashOfDataToSign(network:string, amount:number, bitcoinAddress:string):string {
	const dataToSign = getDataToSign(network, amount, bitcoinAddress);
	const msgHash = hashMessage(hex.encode(dataToSign));
	return hex.encode(msgHash);
}

function reverseSigBits (signature:string) {
	if (signature.startsWith('00')) {
		const sig = signature.substring(2)
		return sig + '00'
	//} else {
	//	const sig = signature.substring(0, signature.length - 2)
	//	const sigPre = signature.substring(signature.length - 2)
	//	return sigPre + sig
	}
	return signature
}

function getPubkeySignature(messageHash:Uint8Array, signature:string) {
	//console.log('getStacksAddressFromSignature: messageHash: ' + hex.encode(messageHash))
	//console.log('getStacksAddressFromSignature: signature: ' + signature)
	let pubkey;
	try {
		//console.log('=============================================================')
		const recBits = (signature.substring(signature.length - 2));
		//let signature = signature.substring(2)
		//console.log('getPubkeySignature1: recBits: ' + ' ' + recBits)
		// works for Hiro sig but not unit test sig ?
		const sigM = recoverSignature({ signature: signature, mode: 'rsv' }); // vrs to rsv
		let sig = new secp.Signature(sigM.signature.r, sigM.signature.s);
		sig = sig.addRecoveryBit(Number(recBits)); // sometime 0 sometiimes 1 ??
		//console.log('getPubkeySignature1: recovery: ', sig)
		const pubkeyM = sig.recoverPublicKey(messageHash);
		//console.log('getPubkeySignature11: Hiro: messageHash: ' + hex.encode(messageHash))
		pubkey = hex.decode(pubkeyM.toHex());
		//console.log('getPubkeySignature11: Hiro: pubkey: ' + hex.encode(pubkey))
	} catch (err:any) {
		//console.log('=============================================================')
		//console.log('getPubkeySignature2: error: ' + ' ' + err.message)
		const recBits = (signature.substring(0, 2));
		const sigM = recoverSignature({ signature: signature, mode: 'rsv' }); // vrs to rsv
		//console.log('getPubkeySignature2: sigM: ', sigM)
		let sig = new secp.Signature(sigM.signature.r, sigM.signature.s);

		sig = sig.addRecoveryBit(Number(recBits)); // sometime 0 sometiimes 1 ??
		//console.log('getPubkeySignature2: recovery: ', sig)
		const pubkeyM = sig.recoverPublicKey(messageHash);
		//console.log('getPubkeySignature2: Hiro: messageHash: ' + hex.encode(messageHash))
		pubkey = hex.decode(pubkeyM.toHex());
		//console.log('getPubkeySignature2: Hiro: pubkey: ' + hex.encode(pubkey))
	}
	return pubkey
}


export function getStacksAddressFromSignature(messageHash:Uint8Array, signature:string) {
	const pubkey = getPubkeySignature(messageHash, signature)
	return getStacksAddressFromPubkey(pubkey);
}

export function getStacksAddressFromPubkey(pubkey:Uint8Array) {
	const addresses = {
		tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
		tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
		mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
		mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
	}
	//console.log('getStacksAddressFromSignature: addresses: ', addresses)
	return addresses;
}

function publicKeyToStxAddress(
	publicKey: Uint8Array,
	addressVersion: StacksNetworkVersion = StacksNetworkVersion.mainnetP2PKH): string {
	return c32address(addressVersion, hex.encode(hash160(publicKey)));
}
  
function hash160(input: Uint8Array): Uint8Array {
	const sha = sha256(input);
	return ripemd160(sha);
}

function getMagicAndOpCode(d1: Uint8Array): {magic?:string; opcode:string; txType? :string; } {
	if (!d1 || d1.length < 2) throw new Error('no magic data passed');
	const magic = hex.encode(d1.subarray(0,2));
	if (magic === MAGIC_BYTES_TESTNET || magic === MAGIC_BYTES_MAINNET) {
		return {
			magic: magic.toUpperCase(),
			opcode: hex.encode(d1.subarray(2,3)).toUpperCase()
		}
	}
	return {
		opcode: hex.encode(d1.subarray(0,1)).toUpperCase()
	}
}

enum StacksNetworkVersion {
	mainnetP2PKH = 22, // 'P'   MainnetSingleSig
	mainnetP2SH = 20, // 'M'    MainnetMultiSig
	testnetP2PKH = 26, // 'T'   TestnetSingleSig
	testnetP2SH = 21, // 'N'    TestnetMultiSig
}

/**
 * Ensure we don't overwrite the original object with Uint8Arrays these can't be serialised to local storage.
 * @param script  
 * @returns 
 */
export function fromStorable(script:any) {
	const clone = JSON.parse(JSON.stringify(script));
	if (typeof script.tweakedPubkey !== 'string') return clone
	return codifyScript(clone, true)
}
  
export function toStorable(script:any) {
	//const copied = JSON.parse(JSON.stringify(script));
	return codifyScript(script, false)
}
  
function codifyScript(script:any, asString:boolean) {
	return {
	  address: script.address,
	  script: codify(script.script, asString),
	  paymentType: (script.type) ? script.type : script.paymentType,
	  witnessScript: codify(script.witnessScript, asString),
	  redeemScript: codify(script.redeemScript, asString),
	  leaves: (script.leaves) ? codifyLeaves(script.leaves, asString) : undefined,
	  tapInternalKey: codify(script.tapInternalKey, asString),
	  tapLeafScript: (script.tapLeafScript) ? codifyTapLeafScript(script.tapLeafScript, asString) : undefined,
	  tapMerkleRoot: codify(script.tapMerkleRoot, asString),
	  tweakedPubkey: codify(script.tweakedPubkey, asString),
	}
}
  
  function codifyTapLeafScript(tapLeafScript:any, asString:boolean) {
	if (tapLeafScript[0]) {
	  const level0 = tapLeafScript[0]
	  if (level0[0]) tapLeafScript[0][0].internalKey = codify(tapLeafScript[0][0].internalKey, asString)
	  if (level0[0]) tapLeafScript[0][0].merklePath[0] = codify(tapLeafScript[0][0].merklePath[0], asString)
	  if (level0[1]) tapLeafScript[0][1] = codify(tapLeafScript[0][1], asString)
	}
	if (tapLeafScript[1]) {
	  const level1 = tapLeafScript[1]
	  if (level1[0]) tapLeafScript[1][0].internalKey = codify(tapLeafScript[1][0].internalKey, asString)
	  if (level1[0]) tapLeafScript[1][0].merklePath[0] = codify(tapLeafScript[1][0].merklePath[0], asString)
	  if (level1[1]) tapLeafScript[1][1] = codify(tapLeafScript[1][1], asString)
	}
	return tapLeafScript;
  }
  
  function codify (arg:unknown, asString:boolean) {
	if (!arg) return;
	if (typeof arg === 'string') {
	  return hex.decode(arg)
	} else {
	  return hex.encode(arg as Uint8Array)
	}
  }
  function codifyLeaves(leaves:any, asString:boolean) {
	if (leaves[0]) {
	  const level1 = leaves[0]
	  if (level1.controlBlock) leaves[0].controlBlock = codify(leaves[0].controlBlock, asString)
	  if (level1.hash) leaves[0].hash = codify(leaves[0].hash, asString)
	  if (level1.script) leaves[0].script = codify(leaves[0].script, asString)
	  if (level1.path && level1.path[0]) leaves[0].path[0] = codify(leaves[0].path[0], asString)
	}
	if (leaves[1]) {
	  const level1 = leaves[1]
	  if (level1.controlBlock) leaves[1].controlBlock = codify(leaves[1].controlBlock, asString)
	  if (level1.hash) leaves[1].hash = codify(leaves[1].hash, asString)
	  if (level1.script) leaves[1].script = codify(leaves[1].script, asString)
	  if (level1.path && level1.path[0]) leaves[1].path[0] = codify(leaves[1].path[0], asString)
	}
	return leaves;
  }
  
  