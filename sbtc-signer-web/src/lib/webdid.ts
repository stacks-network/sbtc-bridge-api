
import { CONFIG } from '$lib/config';
import { AppConfig, UserSession, openStructuredDataSignatureRequestPopup } from '@stacks/connect';
import { stringUtf8CV, tupleCV, uintCV, stringAsciiCV } from '@stacks/transactions';
import { appDetails } from '$lib/stacks_connect'
export const txtRecordPrecis = 'sBTC Signer: ';
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig }); // we will use this export from other files

const didRecordBare = {
	"@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/secp256k1recovery-2020/v2"],
	"id": "did:web:__domain_name__",
	"verificationMethod": [{
		"id": "did:web:__domain_name__#address-0",
		"type": "EcdsaSecp256k1RecoveryMethod2020",
		"controller": "did:web:__domain_name__",
		"blockchainAccountId": "__stacks_principal__"
	}],
	"authentication": [
		"did:web:__domain_name__#address-0"
	]
}

export function getDidWeb(domainName:string, stxAddress:string) {
	const strWebDefn = JSON.stringify(didRecordBare);
	const dns1 = strWebDefn.replaceAll('__domain_name__', domainName)
	const dns2 = dns1.replaceAll('__stacks_principal__', stxAddress)
	return dns2
}

export const domain = {
	name: CONFIG.VITE_PUBLIC_APP_NAME,
	version: CONFIG.VITE_PUBLIC_APP_VERSION,
	'chain-id': CONFIG.VITE_NETWORK === "mainnet" ? ChainID.Mainnet : ChainID.Testnet,
};

const enum ChainID {
    Testnet = 2147483648,
    Mainnet = 1
}

export const domainCV = tupleCV({
	name: stringAsciiCV(domain.name),
	version: stringAsciiCV(domain.version),
	'chain-id': uintCV(domain['chain-id']),
});
export function message_to_tuple(body:string, timestamp:string) {
	return tupleCV({
		domain: stringUtf8CV(body),
		date: stringUtf8CV(timestamp)
	});
}

export function signSip18Message(callback:any, script:string) {
	const today = new Date();
	openStructuredDataSignatureRequestPopup({
		message: message_to_tuple(script, today.toLocaleDateString("en-US")),
		domain: domainCV, // for mainnet, `new StacksMainnet()`
		appDetails: appDetails(),
		onFinish(value) {
		  console.log('Signature of the message', value.signature);
		  console.log('Use public key:', value.publicKey);
		  callback(value, script);
		},
	});
}
