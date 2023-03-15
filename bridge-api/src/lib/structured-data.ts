import { serializeCV, type ClarityValue } from "micro-stacks/clarity";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, concatByteArrays } from "micro-stacks/common";
import { tupleCV, bufferCV, uintCV, stringAsciiCV } from "micro-stacks/clarity";
import { publicAppName, publicAppVersion, network } from './config';
import { recoverSignature, verifyMessageSignature, makeStructuredDataHash } from "micro-stacks/connect";
import { hexToBytes } from "micro-stacks/common";
import { recoverPublicKey, Signature } from '@noble/secp256k1';
import { publicKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';
import { hashMessage } from '@stacks/encryption';

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

export function getStacksAddressFromSignature(message:string, signature:string) {
	const sig = recoverSignature({ signature: signature, mode: 'rsv' });
	const s1 = new Signature(sig.signature.r, sig.signature.s)
	let pubkey:Uint8Array|string = recoverPublicKey(hashMessage(message), s1, 0, true);
	pubkey = bytesToHex(pubkey);
	//const pubkey0 = getPublicKeyFromSignature({ hash: Buffer.from(msgUint8), signature: sig.signature, recoveryBytes: sig.recoveryBytes });	
	const addresses = {
		tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
		tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
		mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
		mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
	}
	return addresses;
}
