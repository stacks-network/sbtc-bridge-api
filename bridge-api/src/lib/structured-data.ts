import { serializeCV, type ClarityValue } from "micro-stacks/clarity";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, concatByteArrays } from "micro-stacks/common";
import { tupleCV, bufferCV, uintCV, stringAsciiCV } from "micro-stacks/clarity";
import { publicAppName, publicAppVersion, network } from './config.js';
import { recoverSignature, verifyMessageSignature, makeStructuredDataHash } from "micro-stacks/connect";
import { hexToBytes } from "micro-stacks/common";
import { recoverPublicKey, Signature } from '@noble/secp256k1';
import { publicKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';
import * as  btc from '@scure/btc-signer';

const prefix = Uint8Array.from([0x53, 0x49, 0x50, 0x30, 0x31, 0x38]); // SIP018

const enum ChainID {
    Testnet = 2147483648,
    Mainnet = 1
}

export type SignatureData = {
	signature: Uint8Array,
	public_key: Uint8Array,
};

export type Message = {
	script: Uint8Array,
	signature?: Uint8Array | string
};

export const domain = {
	name: publicAppName,
	version: publicAppVersion,
	'chain-id': network === "mainnet" ? ChainID.Mainnet : ChainID.Testnet,
};

export const domainCV = tupleCV({
	name: stringAsciiCV(publicAppName!),
	version: stringAsciiCV(publicAppVersion!),
	'chain-id': uintCV(network === "mainnet" ? ChainID.Mainnet : ChainID.Testnet),
})

export function verifySignedMessage(message:Message, pubKey:string) {
	if (!message.signature)
		return false;
	const signature = typeof message.signature === "string" ? hexToBytes(message.signature): message.signature;
	return verifyStructuredDataSignature(message, hexToBytes(pubKey), signature);
}

function messageToTuple(message: Message) {
	return tupleCV({
		script: bufferCV(message.script)
	});
}

export function hash_cv(clarityValue: ClarityValue) {
	return sha256(serializeCV(clarityValue));
}

export function structuredDataHash(message: Message) {
	return sha256(concatByteArrays([prefix, hash_cv(domainCV), hash_cv(messageToTuple(message))]));
}

export function verifyStructuredDataSignature(message: Message, public_key: Uint8Array, signature: Uint8Array) {
	const sig = bytesToHex(signature);
	return verifyMessageSignature({
		message: structuredDataHash(message),
		signature: sig,
		publicKey: bytesToHex(public_key)
	});
}

export function getStacksAddressFromSignature(messageHash:Uint8Array, signature:string, compression:number) {
	const sig = recoverSignature({ signature: signature, mode: 'rsv' });
	//console.log('getStacksAddressFromSignature:sig ', signature);
	//console.log('getStacksAddressFromSignature:sig ', sig);
	const s1 = new Signature(sig.signature.r, sig.signature.s)
	//console.log('getStacksAddressFromSignature:s1 ', s1);
	let pubkey:Uint8Array|string = recoverPublicKey(messageHash, s1, compression, true);
	pubkey = bytesToHex(pubkey);
	console.log('getStacksAddressFromSignature:pubkey ', pubkey);
	//const pubkey0 = getPublicKeyFromSignature({ hash: Buffer.from(msgUint8), signature: sig.signature, recoveryBytes: sig.recoveryBytes });	
	const addresses = {
		tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
		tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
		mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
		mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
	}
	return addresses;
}

export function getDataToSign(amount:number, sbtcWalletAddress:string):Buffer {
	//console.log('getDataToSign:amount ', amount);
	//console.log('getDataToSign:sbtcWalletAddress ', sbtcWalletAddress);
	const amtBuf = Buffer.alloc(9);
	amtBuf.writeUInt32LE(amount, 0);
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	const script = btc.OutScript.encode(btc.Address(net).decode(sbtcWalletAddress))
	//console.log('decodePegOutOutputs ', util.inspect(Buffer.from(script).toString('hex'), false, null, true /* enable colors */));
	const scriptBuf = Buffer.from(script);
	//console.log('getDataToSign:amtBuf ', amtBuf.toString('hex'));
	//console.log('getDataToSign:scriptBuf ', scriptBuf.toString('hex'));
	const data = Buffer.concat([amtBuf, scriptBuf]);
	return data;
}
