import { sha256 } from "@noble/hashes/sha256";
import { getConfig } from './config.js';
import type { Message } from 'sbtc-bridge-lib' 
import { verifyMessageSignature } from "@stacks/encryption";
import { hex } from '@scure/base';
import { ClarityValue, bufferCV, serializeCV, stringAsciiCV, tupleCV, uintCV } from "@stacks/transactions";
import * as P from 'micro-packed';

const concat = P.concatBytes;

const prefix = Uint8Array.from([0x53, 0x49, 0x50, 0x30, 0x31, 0x38]); // SIP018

const enum ChainID {
    Testnet = 2147483648,
    Mainnet = 1
}

export type SignatureData = {
	signature: Uint8Array,
	public_key: Uint8Array,
};

export const domain = {
	name: getConfig().publicAppName,
	version: getConfig().publicAppVersion,
	'chain-id': getConfig().network === "mainnet" ? ChainID.Mainnet : ChainID.Testnet,
};

export const domainCV = tupleCV({
	name: stringAsciiCV(getConfig().publicAppName!),
	version: stringAsciiCV(getConfig().publicAppVersion!),
	'chain-id': uintCV(getConfig().network === "mainnet" ? ChainID.Mainnet : ChainID.Testnet),
})

export function verifySignedMessage(message:Message, pubKey:string) {
	if (!message.signature)
		return false;
	const signature = typeof message.signature === "string" ? hex.decode(message.signature): message.signature;
	return verifyStructuredDataSignature(message, hex.decode(pubKey), signature);
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
	return sha256(concat(prefix, hash_cv(domainCV), hash_cv(messageToTuple(message))));
}

export function verifyStructuredDataSignature(message: Message, public_key: Uint8Array, signature: Uint8Array) {
	const sig = hex.encode(signature);
	return verifyMessageSignature({
		message: structuredDataHash(message),
		signature: sig,
		publicKey: hex.encode(public_key)
	});
}

