
import { c32address, c32addressDecode } from 'c32check';

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

export function hexToAscii(input:string) {
	const buf = Buffer.from(input, "hex");
	return buf.toString("ascii");
}

