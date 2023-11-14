import * as secp from '@noble/secp256k1';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import * as P from 'micro-packed';
import { buildDepositPayloadOpDrop } from './payload_utils.js'
import { getNet } from './wallet_utils.js';

const concat = P.concatBytes;

const privKey = hex.decode('0101010101010101010101010101010101010101010101010101010101010101');

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

/**
 * @deprecated - maybe not needed with op_drop as the users wallet calculates
 * the fees. Keep for now in case we switch back to op_return
 * @returns
 */
export function approxTxFees(network:string, utxos:any, changeAddress:string, payeeAddress:string):number {
    console.log('approxTxFees change=' + changeAddress)
    console.log('approxTxFees dest=' + payeeAddress)
	const net = getNet(network);
	const tx = new btc.Transaction({ allowUnknowOutput: true, allowUnknownInputs:true, allowUnknownOutputs:true });
	// create a set of inputs corresponding to the utxo set
	if (!utxos || utxos.length === 0) throw new Error('No UTXOs');
	for (const utxo of utxos) {
		tx.addInput({
			txid: hex.decode(utxo.txid),
			index: utxo.vout,
			witnessUtxo: {
				amount: BigInt(600),
				script: btc.p2wpkh(secp.getPublicKey(privKey, true)).script,
			},
		});
	}
	if (tx.inputsLength === 0) throw new Error('No confirmed UTXOs')
	const data = buildDepositPayloadOpDrop(network, 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT', 1000);
	tx.addOutput({ script: btc.Script.encode(['RETURN', hex.decode(data)]), amount: BigInt(0) });
	//tx.addOutput({ script: btc.OutScript.encode(btc.Address(net).decode(payeeAddress)), amount });
	tx.addOutputAddress(payeeAddress, BigInt(500), net);
	const changeAmount = Math.floor(0);
	if (changeAmount > 0) tx.addOutputAddress(changeAddress, BigInt(changeAmount), net);
	tx.sign(privKey);
	tx.finalize();
	return Number(tx.fee);
}

