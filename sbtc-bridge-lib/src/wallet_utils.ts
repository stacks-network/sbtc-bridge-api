import * as secp from '@noble/secp256k1';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { schnorr } from '@noble/curves/secp256k1';
import type { CommitKeysI } from './types/sbtc_types';

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

const testWallets = [
	{
		"privateKey": "ad1195070a559967782fb6eaa622a2baeaed9d9d254880059f9fbf781cf7852c",
		"ecdsaPub": "0235bbcc0b6898fc63d6e856c10b67490b153f8866a88b7e59b2229fb2dc9cf102",
		"schnorrPub": "0435bbcc0b6898fc63d6e856c10b67490b153f8866a88b7e59b2229fb2dc9cf102369bdef88e0c63b560a7d5295347e6dc6cd9d2158a8edc906ba09ac1019db0f8",
	},
	{
		"privateKey": "b3fd3a7216621aa796270da8149298a6f1cbf2eba4a4fc3cc21725f289d2551d",
		"ecdsaPub": "0235bbcc0b6898fc63d6e856c10b67490b153f8866a88b7e59b2229fb2dc9cf102",
		"schnorrPub": "0435bbcc0b6898fc63d6e856c10b67490b153f8866a88b7e59b2229fb2dc9cf102369bdef88e0c63b560a7d5295347e6dc6cd9d2158a8edc906ba09ac1019db0f8"
	}
]
export const sbtcWallets = [
	{
		"sbtcAddress": "tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8",
		"pubKey": "264bd0d3bd80ea2da383b0a2a29f53d258e05904d2279f5f223053b987a3fd56",
		"desc": "tr([760ce8cf/86'/1'/0'/0/1]264bd0d3bd80ea2da383b0a2a29f53d258e05904d2279f5f223053b987a3fd56)#j4wq04cw",
		"parent_desc": "tr([760ce8cf/86'/1'/0']tpubDDQtKohNhMryjsYgQu8hsZ1BMXJWb1h4xGDZvsQV5ZK9E5QDNgp3w1h9N2XTyz6GVDmMcbAw5YU67mcGousktHxjVTx6RmqXX6GfJJrkqqh/0/*)#kqt0kevz",
		"scriptPubKey": "51204faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710",
		"witness_program": "4faa61bcd4f553d1ca945d6f74b18f60705d85191f61d76d34158b0e7798b710",
	},
	{
		"sbtcAddress": "tb1pmmkznvm0pq5unp6geuwryu2f0m8xr6d229yzg2erx78nnk0ms48sk9s6q7",
		"pubKey": "802fb08c62f33a5e074dae2fc19441e7cef96c6e5a1ffa4065e5f7a8423816a3",
		"desc": "tr([7e0bf729/86'/1'/0'/0/2]802fb08c62f33a5e074dae2fc19441e7cef96c6e5a1ffa4065e5f7a8423816a3)#d8elhne5",
		"parent_desc": "tr([7e0bf729/86'/1'/0']tpubDCzcBRDqD1G23fAdF79sTfdECnfRprb5uGKb9vKBxrH4uZbC46ZJmxtSdYHwEJykzuzZV3KUGtFSRaoNAJuZpRSCiKoC1FUxkmRjPjDrbSA/0/*)#a8uhq8yj",	
		"scriptPubKey": "5120deec29b36f0829c98748cf1c3271497ece61e9aa5148242b23378f39d9fb854f",
		"witness_program": "deec29b36f0829c98748cf1c3271497ece61e9aa5148242b23378f39d9fb854f",
	}
]
/**
 * Constructs the script hash with script paths corresponding to two internal
 * test wallets.
 */
export function getTestAddresses (network:string):CommitKeysI {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	return {
		fromBtcAddress: btc.getAddress('tr', hex.decode(testWallets[0].privateKey), net) as string,
		reveal: btc.getAddress('tr', hex.decode(testWallets[0].privateKey), net) as string,
		revealPub: hex.encode(schnorr.getPublicKey(testWallets[0].privateKey) as Uint8Array),
		revealPrv: testWallets[0].privateKey,
		reclaim: btc.getAddress('tr', hex.decode(testWallets[1].privateKey), net) as string,
		reclaimPub: hex.encode(schnorr.getPublicKey(testWallets[1].privateKey) as Uint8Array),
		reclaimPrv: testWallets[1].privateKey,
		stacksAddress: (network === 'testnet') ? 'ST1RBP62PR532FWVP7JRGC9SVFKKHD1JYK23KYNN0' : 'unsupported'
	}
}

// Address from a 33 byte public key (returns the pub key if schnorr pub key passed in)
export function addressFromPubkey(network:string, pubkey:Uint8Array) {
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	try {
		return btc.Address(net).encode(btc.OutScript.decode(pubkey));
	} catch(err) {
		console.error('needs to be a 33 byte public key - doesnot work for schnorr pub keys.')
		return hex.encode(pubkey)
	}
}