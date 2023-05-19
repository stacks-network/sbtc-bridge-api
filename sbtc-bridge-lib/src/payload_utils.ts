import * as secp from '@noble/secp256k1';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { addressFromPubkey } from './wallet_utils';
import { c32address, c32addressDecode } from 'c32check';
import * as P from 'micro-packed';
import { bitcoinToSats } from './formatting'
import type { withdrawalPayloadType, depositPayloadType } from './types/sbtc_types'
import { hashMessage } from '@stacks/encryption';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';

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

export function parseDepositPayload(d1:Uint8Array, amountSats: number):depositPayloadType {
	const magicOp = getMagicAndOpCode(d1);
	if (magicOp.magic) {
		return parseDepositPayloadNoMagic(d1.subarray(2), amountSats);
	}
	return parseDepositPayloadNoMagic(d1, amountSats);
}

function parseDepositPayloadNoMagic(d1:Uint8Array, amountSats: number):depositPayloadType {
    console.log('payload rev: ', hex.encode(d1))
	const opcode = hex.encode(d1.subarray(0,1)).toUpperCase();
	const prinType = parseInt(hex.encode(d1.subarray(1,2)), 16);
	const addr0 = parseInt(hex.encode(d1.subarray(2,3)), 16);
	const addr1 = hex.encode(d1.subarray(3,23));
	const stacksAddress = c32address(addr0, addr1);
	const lengthOfCname = parseInt(hex.encode(d1.subarray(23,24)), 8);
    console.log('payload lengthOfCname: ', lengthOfCname)
	let cname;
	if (lengthOfCname > 0) {
	  cname = new TextDecoder().decode(d1.subarray(24, 24 + lengthOfCname));
	  console.log('payload cname: ', cname)
	}

	let current = 24 + lengthOfCname;
	let memo;
	const lengthOfMemo = parseInt(hex.encode(d1.subarray(current, current + 1)), 8);
    console.log('payload lengthOfMemo: ', lengthOfMemo)
	if (lengthOfMemo > 0) {
		memo = new TextDecoder().decode(d1.subarray(current + 1, lengthOfMemo + current + 1));
	}
	current = current + 1 + lengthOfMemo;
	const rev = hex.decode(hex.encode(d1.subarray(current)));
    console.log('payload rev: ', hex.encode(rev))
	const revealFee = uint8ToAmount(rev);
    console.log('payload rev: ', revealFee)

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
	view.setUint32(0, amt); // Max unsigned 32-bit integer
	const res = new Uint8Array(view.buffer);
	return res;
}

export function uint8ToAmount(buf:Uint8Array):number {
	const view = new DataView(buf.buffer);
	const amt = view.getUint32(0);
	return amt;
}

export function parseWithdrawalPayload(network:string, d1:Uint8Array, sbtcWallet:string, compression:number):withdrawalPayloadType {
	const magicOp = getMagicAndOpCode(d1);
	if (magicOp.magic) {
		return parseWithdrawalPayloadNoMagic(network, d1.subarray(2), sbtcWallet, compression);
	}
	return parseWithdrawalPayloadNoMagic(network, d1, sbtcWallet, compression);
}

function parseWithdrawalPayloadNoMagic(network:string, d1:Uint8Array, sbtcWallet:string, compression:number):withdrawalPayloadType {
	const opcode = hex.encode(d1.subarray(0,1));
	const amountSats = uint8ToAmount(d1.subarray(1, 10));
	const signature = hex.encode(d1.subarray(10, 75));
	const dataToSign = getDataToSign(network, amountSats, sbtcWallet);
	const msgHash = hashMessage(hex.encode(dataToSign));
	const stxAddresses = getStacksAddressFromSignature(msgHash, signature, compression);
	const stacksAddress = (network === 'testnet') ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
	return {
		opcode,
		stacksAddress,
		signature,
		amountSats,
		compression
	};
}

export function buildDepositPayload(net:any, revealFee:number, address:string, opDrop:boolean, memo:string|undefined):Uint8Array {
	const magicBuf = (typeof net === 'object' && net.bech32 === 'tb') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGIN_OPCODE);
	const addr = c32addressDecode(address.split('.')[0])
	const addr0Buf = hex.decode(addr[0].toString(16));
	const addr1Buf = hex.decode(addr[1]);

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
	const feeBuf = amountToUint8(revealFee, 8)
	buf1 = concat(buf1, feeBuf)
	
	if (!opDrop) return concat(magicBuf, buf1)
	return buf1;
}

export function buildWithdrawalPayload(net:any, amount:number, sigOrPrin:string, opDrop:boolean):Uint8Array {
	const magicBuf = (net === btc.TEST_NETWORK) ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(PEGOUT_OPCODE);
	const view2 = amountToUint8(amount, 9);
	const sigBuf = hex.decode(sigOrPrin);
	let data = concat(opCodeBuf, view2, sigBuf)
	if (!opDrop) data = concat(magicBuf, opCodeBuf, view2, sigBuf);
	return data;
}

export function parseSbtcWalletAddress(network:string, outputs:Array<any>) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	let sbtcWallet;
	if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
	  sbtcWallet = outputs[1].scriptPubKey.address;
	} else {
	  const scriptHex = outputs[0].scriptPubKey.asm.split(' ')[6];
	  const encscript = btc.OutScript.decode(hex.decode(scriptHex));
	  sbtcWallet = btc.Address(net).encode(encscript);  
	}
	addressFromPubkey(network, outputs[0].scriptPubKey)
	return sbtcWallet;
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
  
export function parseOutputs(network:string, output0:any, sbtcWalletAddress:string, amountSats: number) {
	const d1 = hex.decode(output0.scriptPubKey.asm.split(' ')[1]);
	const witnessData = getMagicAndOpCode(d1);
	witnessData.txType = output0.scriptPubKey.type;

	let innerPayload:withdrawalPayloadType|depositPayloadType;
	if (witnessData.opcode === '3C') {
		innerPayload = parseDepositPayload(d1, amountSats);
	} else if (witnessData.opcode.toUpperCase() === '3E') {
		const compression = (output0.scriptPubKey.type === 'nulldata') ? 0 : 1;
		innerPayload = parseWithdrawalPayload(network, d1, sbtcWalletAddress, compression)
	} else {
	  throw new Error('Wrong opcode : expected: 3A or 3C :  receved: ' + witnessData.opcode)
	}
	return {
		sbtcWallet: sbtcWalletAddress,
		payload: innerPayload
	};
  }
  
export function getDataToSign(network:string, amount:number, sbtcWalletAddress:string):Uint8Array {
	const amtBuf = amountToUint8(amount, 9);
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const script = btc.OutScript.encode(btc.Address(net).decode(sbtcWalletAddress))
	const data = concat(amtBuf, script);
	return data;
}

export function getStacksAddressFromSignature(messageHash:Uint8Array, signature:string, compression:number) {
	const sig = secp.Signature.fromCompact(signature);
	//const s1 = new secp.Signature(sig.r, sig.s)
	let pubkey1:secp.ProjectivePoint = sig.recoverPublicKey(messageHash);
	const pubkey = hex.decode(pubkey1.toHex());
	//const pubkey0 = getPublicKeyFromSignature({ hash: hex.(msgUint8), signature: sig.signature, recoveryBytes: sig.recoveryBytes });	
	const addresses = {
		tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
		tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
		mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
		mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
	}
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