import * as secp from '@noble/secp256k1';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { c32address, c32addressDecode } from 'c32check';
import * as P from 'micro-packed';
import { bitcoinToSats } from './formatting.js'
import type { PayloadType } from './types/sbtc_types.js'
import { verifyMessageSignature, hashMessage } from '@stacks/encryption';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { recoverSignature } from "micro-stacks/connect";
import { getAddressFromOutScript } from './wallet_utils.js';
import { dust } from './withdraw_utils.js';

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

export function parseDepositPayload(d1:Uint8Array):PayloadType {
	const magicOp = getMagicAndOpCode(d1);
	if (magicOp.magic) {
		return parseDepositPayloadNoMagic(d1.subarray(2));
	}
	return parseDepositPayloadNoMagic(d1);
}

function parseDepositPayloadNoPrincipal(d1:Uint8Array):PayloadType {
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	const addr0 = parseInt(hex.encode(d1.subarray(1,2)), 16);
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
		amountSats: 0
	};
}

function parseDepositPayloadNoMagic(d1:Uint8Array):PayloadType {
    //console.log('payload rev: ', hex.encode(d1))
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	if (opcode.toUpperCase() !== PEGIN_OPCODE) throw new Error('Wrong OPCODE : expected: ' +  PEGIN_OPCODE + '  received: ' + opcode)
  
	const prinType = parseInt(hex.encode(d1.subarray(1,2)), 16);
	if (prinType === 22 || prinType === 26) return parseDepositPayloadNoPrincipal(d1)
	const addr0 = parseInt(hex.encode(d1.subarray(2,3)), 16);
	const addr1 = hex.encode(d1.subarray(3,23));
	const stacksAddress = c32address(addr0, addr1);
	const lengthOfCname = parseInt(hex.encode(d1.subarray(23,24)), 8);
	let cname;
	if (lengthOfCname > 0) {
	  cname = new TextDecoder().decode(d1.subarray(24, 24 + lengthOfCname));
	}

	let current = 24 + lengthOfCname;
	//let memo;
	//const lengthOfMemo = parseInt(hex.encode(d1.subarray(current, current + 1)), 8);
	//if (lengthOfMemo > 0) {
	//	memo = new TextDecoder().decode(d1.subarray(current + 1, lengthOfMemo + current + 1));
	//}

	let revealFee = 0
	if (d1.length > current + 1) { // + lengthOfMemo) {
		//current = current + 1 + lengthOfMemo;
		const rev = d1.subarray(current);
		console.log('parseDepositPayloadNoMagic: ' + hex.encode(rev))
		revealFee = bigUint64ToAmount(rev)
		console.log('parseDepositPayloadNoMagic:revealFee: ' + revealFee)
	}

	return {
		opcode,
		prinType,
		stacksAddress,
		lengthOfCname,
		cname,
		lengthOfMemo: 0,
		memo: undefined,
		revealFee,
		amountSats: 0
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
	if (!buf || buf.byteLength === 0) return 0
	buf = hex.decode(hex.encode(buf));
	const view = new DataView(buf.buffer, 0, 8);
	const amt = view.getBigUint64(0);
	return Number(amt);
}

export function parseWithdrawPayload(network:string, d0:string, bitcoinAddress:string):PayloadType {
	const d1 = hex.decode(d0)
	const magicOp = getMagicAndOpCode(d1);
	if (magicOp.magic) {
		return parseWithdrawalPayloadNoMagic(network, d1.subarray(2), bitcoinAddress);
	}
	return parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress);
}

function parseWithdrawalPayloadNoMagic(network:string, d1:Uint8Array, bitcoinAddress:string):PayloadType {
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	if (opcode !== '3E') throw new Error('Wrong opcode for withdraw: should be 3E was ' + opcode)
	const amtB = d1.subarray(1, 9)
	const amountSats = bigUint64ToAmount(amtB);
	let signature = (hex.encode(d1.subarray(9, 74)));
	const msgHash = getStacksSimpleHashOfDataToSign(network, amountSats, bitcoinAddress);
	const pubKey = getPubkeySignature(hex.decode(msgHash), signature)
	const stxAddresses = getStacksAddressFromPubkey(pubKey);
	const stacksAddress = (network === 'testnet') ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
	return {
		opcode,
		stacksAddress,
		signature,
		amountSats
	};
}

export enum PrincipalType {
	STANDARD = '05',
	CONTRACT = '06'
}

export function buildDepositPayload(network:string, stacksAddress:string):string {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	return buildDepositPayloadInternal(net, 0, stacksAddress, false)
}

export function buildDepositPayloadOpDrop(network:string, stacksAddress:string, revealFee:number):string {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	return buildDepositPayloadInternal(net, revealFee, stacksAddress, true)
}

function buildDepositPayloadInternal(net:any, amountSats:number, address:string, opDrop:boolean):string {
	const magicBuf = (typeof net === 'object' && net.bech32 === 'tb') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGIN_OPCODE);
	const addr = c32addressDecode(address.split('.')[0])
	//const addr0Buf = hex.encode(amountToUint8(addr[0], 1));
	const addr0Buf = (hex.decode(addr[0].toString(16)));
	const addr1Buf = hex.decode(addr[1]);

	const cnameLength = new Uint8Array(1);
	//const memoLength = new Uint8Array(1);
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
	/**
	if (memo) {
		const memoBuf = new TextEncoder().encode(memo);
		const memoLength = hex.decode(memoBuf.length.toString(8));
		buf1 = concat(buf1, memoLength, memoBuf);
	} else {
		memoLength.fill(0);
		buf1 = concat(buf1, memoLength);
	}
	 */
	if (opDrop) {
		const feeBuf = amountToBigUint64(amountSats, 8)
		buf1 = concat(buf1, feeBuf)
	}
	
	if (!opDrop) return hex.encode(concat(magicBuf, buf1))
	return hex.encode(buf1);
}

/**
 * @param network (testnet|mainnet)
 * @param amount 
 * @param signature 
 * @returns 
 */
export function buildWithdrawPayload(network:string, amount:number, signature:string):string {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	return buildWithdrawPayloadInternal(net, amount, signature, false)
}

/**
 * Withdrawal using commit reveal (op_drop) pattern
 * @param network (testnet|mainnet)
 * @param amount 
 * @param signature 
 * @returns 
 */
export function buildWithdrawPayloadOpDrop(network:string, amount:number, signature:string):string {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	return buildWithdrawPayloadInternal(net, amount, signature, true)
}

function buildWithdrawPayloadInternal(net:any, amount:number, signature:string, opDrop:boolean):string {
	const magicBuf = (net === btc.TEST_NETWORK) ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGOUT_OPCODE);
	const amountBuf = amountToBigUint64(amount, 8);
	//const amountRev = bigUint64ToAmount(amountBuf);
	const data = concat(opCodeBuf, amountBuf, hex.decode(signature))
	if (!opDrop) return hex.encode(concat(magicBuf, data));
	return hex.encode(data);
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

/**
 * 
 * @param network 
 * @param txHex 
 * @returns 
 */
export function parsePayloadFromTransaction(network:string, txHex:string):PayloadType {
	const tx:btc.Transaction = btc.Transaction.fromRaw(hex.decode(txHex), {allowUnknowInput:true, allowUnknowOutput: true, allowUnknownOutputs: true, allowUnknownInputs: true})
	const out0 = tx.getOutput(0);
	const script0 = out0.script!
	const spendScr = btc.OutScript.decode(script0);
	let payload = {} as PayloadType;
	if (spendScr.type === 'unknown') {
		const scriptPubKey = tx.getOutput(1).script
		payload = parsePayloadFromOutput(network, out0, hex.encode(scriptPubKey!));
		payload.sbtcWallet = getAddressFromOutScript('testnet', tx.getOutput(1).script!)
		//payload.dust = Number(tx.getOutput(1).amount)
	}
	console.log('parsePayloadFromTransaction: payload: ' + payload);
	return payload;
}

export function parsePayloadFromOutput(network:string, out0:any, scriptPubKey:string):PayloadType {
	const d1 = out0.script.subarray(2) as Uint8Array // strip the op type and data length
	const witnessData = getMagicAndOpCode(d1);
	witnessData.txType = out0.type;

	let innerPayload:PayloadType;
	if (witnessData.opcode === '3C') {
		innerPayload = parseDepositPayload(d1);
		return innerPayload;
	} else if (witnessData.opcode.toUpperCase() === '3E') {
		innerPayload = parseWithdrawPayload(network, hex.encode(d1), scriptPubKey)
		return innerPayload;
	} else {
	  throw new Error('Wrong opcode : expected: 3A or 3C :  recieved: ' + witnessData.opcode)
	}
}

/**
 * 
 * @param network 
 * @param amount 
 * @param bitcoinAddress 
 * @returns 
 */
export function getDataToSign(network:string, amount:number, bitcoinAddress:string):Uint8Array {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const tx = new btc.Transaction({ allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	tx.addOutputAddress(bitcoinAddress, BigInt(dust), net);
	const amtBuf = amountToBigUint64(amount, 8);
	const data = concat(amtBuf, tx.getOutput(0).script!);
	const dataLen = hex.decode(data.length.toString(8));
	return concat(dataLen, data);
}

export function getStacksSimpleHashOfDataToSign(network:string, amount:number, bitcoinAddress:string):string {
	const dataToSign = getDataToSign(network, amount, bitcoinAddress);
	const msgHash = hashMessage(hex.encode(dataToSign));
	console.log('getStacksSimpleHashOfDataToSign:dataToSign: ' + hex.encode(dataToSign))
	console.log('getStacksSimpleHashOfDataToSign:msgHash: ' + hex.encode(msgHash))
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
	const sigM = recoverSignature({ signature: signature, mode: 'vrs' }); // vrs to rsv
	let sig = new secp.Signature(sigM.signature.r, sigM.signature.s);
	sig = sig.addRecoveryBit(0);
	const pubkeyM = sig.recoverPublicKey(messageHash);
	const pubkey = hex.decode(pubkeyM.toHex());
	console.log(pubkeyM.toHex())
	return pubkey;
}

/**
 * 
 * @param messageHash 
 * @param signature 
 * @returns 
 */
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
	console.log('getStacksAddressFromSignature: addresses: ', addresses)
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

/**
 * 
 * @param script
 * @returns 
 */
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
  
  