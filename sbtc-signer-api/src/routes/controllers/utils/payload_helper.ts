import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { MAGIC_BYTES_MAINNET, MAGIC_BYTES_TESTNET, depositPayloadType, parseDepositPayload, parseWithdrawalPayload, withdrawalPayloadType } from 'sbtc-bridge-lib';

/**

const btcPrecision = 100000000

export function satsToBitcoin(amountSats:number) {
  return  Math.round(amountSats) / btcPrecision
}

export function bitcoinToSats(amountBtc:number) {
  return  Math.round(amountBtc * btcPrecision)
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

export function parseSbtcWalletAddress(network:string, outputs:Array<any>) {
	try {
		// attempt 1: parse as mempool data structure
		return parseSbtcWalletAddressFromMempool(network, outputs)
	} catch (err:any) {
		return parseSbtcWalletAddressFromBitcoinCore(network, outputs)
	}
}

function parseSbtcWalletAddressFromMempool(network:string, outputs:Array<any>) {
	// attempt 1: parse as mempool data structure
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	let amountSats;
	let bitcoinAddress;
	if (outputs[0].scriptPubKey.type.toLowerCase() === 'nulldata') {
	  amountSats = bitcoinToSats(outputs[1].value);
		bitcoinAddress = outputs[1].scriptPubKey.address;
	} else {
		const scriptHex = outputs[0].scriptPubKey.asm.split(' ')[6];
		const encscript = btc.OutScript.decode(hex.decode(scriptHex));
	  amountSats = bitcoinToSats(outputs[0].value);
		bitcoinAddress = btc.Address(net).encode(encscript);  
	}
	// addressFromPubkey(network, outputs[0].scriptPubKey)
	return { bitcoinAddress, amountSats };
}

function parseSbtcWalletAddressFromBitcoinCore(network:string, outputs:Array<any>) {
	// attempt 1: parse as mempool data structure
	const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
	let amountSats;
	let bitcoinAddress;
	if (outputs[0].scriptpubkey_type.toLowerCase() === 'op_return') {
	  amountSats = bitcoinToSats(outputs[1].value);
		bitcoinAddress = outputs[1].scriptpubkey_address;
	} else {
		const scriptHex = outputs[0].scriptpubkey_asm.split(' ')[6];
		const encscript = btc.OutScript.decode(hex.decode(scriptHex));
	  amountSats = (outputs[0].value);
		bitcoinAddress = btc.Address(net).encode(encscript);  
	}
	// addressFromPubkey(network, outputs[0].scriptPubKey)
	return { bitcoinAddress, amountSats };
}

export function parseOutputsBitcoinCore(network:string, output0:any, bitcoinAddress:string, amountSats: number) {
	const outType = output0.scriptpubkey_type;
  const txType = (outType === 'nulldata' || outType === 'op_return') ? 'nulldata' : outType;
	const outAsm = output0.scriptpubkey_asm;
  console.log('parseOutputsBitcoinCore: outAsm: ' + outAsm);
  console.log('parseOutputsBitcoinCore: outType: ' + outType);
	const d1 = hex.decode(outAsm.split(' ')[2]);
  console.log('parseOutputsBitcoinCore: outType: ' + outType);
	const witnessData = getMagicAndOpCode(d1);
	witnessData.txType = txType;

	let innerPayload:withdrawalPayloadType|depositPayloadType;
	try {
		if (witnessData.opcode === '3C') {
			innerPayload = parseDepositPayload(d1, amountSats);
		} else if (witnessData.opcode.toUpperCase() === '3E') {
			const compression = (outType === 'nulldata' || outType === 'op_return') ? 0 : 1;
			innerPayload = parseWithdrawalPayload(network, d1, bitcoinAddress, compression)
		} else {
		  throw new Error('Wrong opcode : expected: 3A or 3C :  receved: ' + witnessData.opcode)
		}
	} catch (err:any) {
		console.log('parseOutputs: Error: ' + err.message);
	}
	return innerPayload;
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
 */

