
import { CONFIG } from '$lib/config';
import { c32address, c32addressDecode } from 'c32check';
import { sbtcConfig } from '$stores/stores'
import { fetchUserBalances } from '$lib/bridge_api'
import type { SbtcConfig } from '$types/sbtc_config';
import { StacksTestnet, StacksMainnet, StacksMocknet } from '@stacks/network';
import { openSignatureRequestPopup } from '@stacks/connect';
import { AppConfig, UserSession, showConnect, getStacksProvider, openStructuredDataSignatureRequestPopup } from '@stacks/connect';
import type { AddressObject } from 'sbtc-bridge-lib' 
import { stringUtf8CV, tupleCV, uintCV, stringAsciiCV } from '@stacks/transactions';

export const txtRecordPrecis = 'sBTC Signer: ';
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig }); // we will use this export from other files

export const webWalletNeeded = false;

export function getStacksNetwork() {
	const network = CONFIG.VITE_NETWORK;
	let stxNetwork:StacksMainnet|StacksTestnet;
	if (network === 'testnet') stxNetwork = new StacksTestnet();
	else if (network === 'mainnet') stxNetwork = new StacksMainnet();
	else {
		stxNetwork = new StacksMocknet({ url: "http://devnet.stx.eco" });
	}
	return stxNetwork;
}

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

export function decodeStacksAddress(stxAddress:string) {
	if (!stxAddress) throw new Error('Needs a stacks address');
	const decoded = c32addressDecode(stxAddress)
	return decoded
}

export function encodeStacksAddress (network:string, b160Address:string) {
	let version = 26
	if (network === 'mainnet') version = 22
	const address = c32address(version, b160Address) // 22 for mainnet
	return address
}

export async function fetchSbtcBalance () {
	const adrds:AddressObject = addresses();
	let result:AddressObject;
	try {
		result = await fetchUserBalances(adrds);
		try {
			result.sBTCBalance = Number(result.stacksTokenInfo?.fungible_tokens[CONFIG.VITE_SBTC_CONTRACT_ID + '::sbtc'].balance)
		} catch (err) {
			// for testing..
			try { result.sBTCBalance = Number(result.stacksTokenInfo?.fungible_tokens['ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN.sky-blue-elephant::sbtc'].balance) }
			catch (err) { result.sBTCBalance = 0 }
		}

	} catch(err) {
		result = adrds;
		console.log('Network down...');
	}
	//const result = await fetchUserSbtcBalance(adrds.stxAddress);
	await sbtcConfig.update((conf:SbtcConfig) => {
		try {
			conf.addressObject = result;
			conf.loggedIn = true;
	
		} catch (err:any) {
			console.log(err.message)
		}
		return conf;
	});
	return true;
}

function addresses():AddressObject {
	if (!userSession) return {} as AddressObject;
	try {
		const userData = userSession.loadUserData();
		const network = CONFIG.VITE_NETWORK;
		//let something = hashP2WPKH(payload.public_keys[0])
		const stxAddress = (network === 'testnet' || network === 'devnet') ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet;
		const cardinal = (network === 'testnet' || network === 'devnet') ? userData.profile.btcAddress.p2wpkh.testnet : userData.profile.btcAddress.p2wpkh.mainnet;
		const ordinal = (network === 'testnet' || network === 'devnet') ? userData.profile.btcAddress.p2tr.testnet : userData.profile.btcAddress.p2tr.mainnet;
		return {
			stxAddress,
			cardinal,
			ordinal,
			btcPubkeySegwit0: userData.profile.btcPublicKey.p2wpkh,
			btcPubkeySegwit1: userData.profile.btcPublicKey.p2tr,
			sBTCBalance: 0,
			stxBalance: 0
		};
	} catch(err) {
		return {} as AddressObject
	}
}

export function appDetails() {
	return {
		name: 'sBTC Bridge',
		icon: (window) ? window.location.origin + '/img/icon_sbtc.png' : '/img/icon_sbtc.png',
	}
}

export function makeFlash(el1:HTMLElement|null, styler:number|undefined) {
	let count = 0;
	if (!el1) return;
	let clazz = 'flasherize-under';
	if (!styler) clazz = 'flasherize-button';
	el1.classList.add(clazz);
    const ticker = setInterval(function () {
		count++;
		if ((count % 2) === 0) {
			el1.classList.add(clazz);
		}
		else {
			el1.classList.remove(clazz);
		}
		if (count === 2) {
			el1.classList.remove(clazz);
			clearInterval(ticker)
		}
	  }, 1000)
}

export function isDevnet(href:string):boolean {
	if (href.indexOf('?net=devnet') === -1) {
		return false;
	}
}

export function isLegal(routeId:string):boolean {
	if (userSession.isUserSignedIn()) return true;
	if (routeId.startsWith('http')) {
		if (routeId.indexOf('/deposit') > -1 || routeId.indexOf('/withdraw') > -1 || routeId.indexOf('/admin') > -1 || routeId.indexOf('/transactions') > -1) {
			return false;
		}
	} else if (['/deposit', '/withdraw', '/admin', '/transactions'].includes(routeId)) {
		return false;
	}
	return true;
}

export function loggedIn():boolean {
	return userSession.isUserSignedIn()
}

export async function loginStacksJs(callback:any):Promise<any> {
	try {
		const provider = getStacksProvider()
		console.log('provider: ', provider)
		if (!userSession.isUserSignedIn()) {
			showConnect({
				userSession,
				appDetails: appDetails(),
				onFinish: async () => {
					await fetchSbtcBalance();
					callback(true);
				},
				onCancel: () => {
					callback(false);
				},
			});
		} else {
			await fetchSbtcBalance();
			callback(true);
		}
	} catch (e) {
		if (window) window.location.href = "https://wallet.hiro.so/wallet/install-web";
		callback(false);
	}
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

export function signMessage(callback:any, script:string) {
	openSignatureRequestPopup({
		message: script,
		network: getStacksNetwork(), // for mainnet, `new StacksMainnet()`
		appDetails: appDetails(),
		onFinish(value) {
		  console.log('Signature of the message', value.signature);
		  console.log('Use public key:', value.publicKey);
		  callback(value, script);
		},
	});
}

export function logUserOut() {
	return userSession.signUserOut();
}

const FORMAT = /[ `!@#$%^&*()_+=[\]{};':"\\|,<>/?~]/;

export function verifyStacksPricipal(stacksAddress?:string) {
	if (!stacksAddress) {
	  throw new Error('Address not found');
	} else if (FORMAT.test(stacksAddress)) {
	  throw new Error('please remove white space / special characters');
	}
	try {
	  const decoded = decodeStacksAddress(stacksAddress.split('.')[0]);
	  if ((CONFIG.VITE_NETWORK === 'testnet' || CONFIG.VITE_NETWORK === 'devnet') && decoded[0] !== 26) {
		throw new Error('Please enter a valid stacks blockchain testnet address');
	  }
	  if (CONFIG.VITE_NETWORK === 'mainnet' && decoded[0] !== 22) {
		throw new Error('Please enter a valid stacks blockchain mainnet address');
	  }
	  return stacksAddress;
	} catch (err:any) {
		throw new Error('Invalid stacks principal - please enter a valid ' + CONFIG.VITE_NETWORK + ' account or contract principal.');
	}
}
  
  
export function verifyAmount(amount:number) {
	if (!amount || amount === 0) {
		throw new Error('No amount entered');
	  }
  	if (amount < 10000) {
		throw new Error('Amount less than mnimum transaction fee.');
	  }
}
export function verifySBTCAmount(amount:number, balance:number, fee:number) {
	if (!amount || amount === 0) {
		throw new Error('No amount entered');
	}
	if (amount > (balance - fee)) {
		throw new Error('No more then balance (less fee of ' + fee + ')');
	}
}
  
	