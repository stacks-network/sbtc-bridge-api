
import { hashMessage } from '@stacks/encryption';
import { c32address, c32addressDecode } from 'c32check';
import { hex } from '@scure/base';
import util from 'util'
import { publicKeyFromSignatureRsv, type MessageSignature, StacksMessageType, publicKeyFromSignatureVrs } from '@stacks/transactions';
import { getStacksAddressFromPubkey } from 'sbtc-bridge-lib/dist/payload_utils';
import { getConfig } from './config';
const authMessage = 'Please sign this message to complete authentication'

export function isUpdateAllowed(req, stacksAddressFromRequest:string) {
	const stacksAddressSig = stacksAddressFromSignatureHeader(req.headers.authorization)
	console.log('isUpdateAllowed: stacksAddressFromRequest' + stacksAddressFromRequest)
	console.log('isUpdateAllowed: stacksAddressSig' + stacksAddressSig)
	return stacksAddressSig === stacksAddressFromRequest;
}

function stacksAddressFromSignatureHeader(authorization:any) {
	const network = getConfig().network
	const decoded = JSON.parse(authorization)
	const msgHash = hashMessage(authMessage);
	const pubkey = publicKeyFromSignatureVrs(hex.encode(msgHash), { data: decoded.signature, type: StacksMessageType.MessageSignature })
	const stacks = getStacksAddressFromPubkey(hex.decode(pubkey))
	if (network === 'testnet') return stacks.tp2pkh
	else return stacks.mp2pkh
}

export function authorised(authorization:any) {
	if (!authorization) return false;
	const decoded = JSON.parse(authorization)
	const stacksAddressSig = stacksAddressFromSignatureHeader(authorization)
	console.log('stacksAddressSig: ' + stacksAddressSig)
	console.log('decoded.stxAddress: ' + decoded.stxAddress)
	return stacksAddressSig === decoded.stxAddress;
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


