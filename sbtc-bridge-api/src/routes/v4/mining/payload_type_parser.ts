import { hex } from '@scure/base';
import { MAGIC_BYTES_MAINNET_NAK, MAGIC_BYTES_TESTNET_NAK } from './mining_contract_helper.js';
import { Layer1TxPayload, LeaderBlockCommit, LeaderVRFKeyRegistration, MinerSignatureValidation } from '../../../types/mining_types.js';

export function parseRawPayload(d0:string): Layer1TxPayload {
	let d1 = (hex.decode(d0)) //.subarray(4)
	if (!d1 || d1.length < 2) throw new Error('no magic data passed');
	const magic = hex.encode(d1.subarray(0,2)).toLowerCase();
  const opcode = hex.encode(d1.subarray(2,3)).toLowerCase();
  const opchar = new TextDecoder().decode(d1.subarray(2,3))
  const payload = decodePayload(magic, opchar, d1);
  return {
    magic: magic.toUpperCase(),
    opcode,
    opchar,
    payload
  }
}

function decodePayload(magic:string, opchar:string, d0: Uint8Array): any {
  const nak = (magic === MAGIC_BYTES_TESTNET_NAK || magic === MAGIC_BYTES_MAINNET_NAK)
  if (opchar === '[') {
    return getLeaderBlockCommit(d0, nak)
  } else if (opchar === '^') {
    return getLeaderVRFKeyRegistration(d0, nak)
  } else if (opchar === '_') {
    return getUserSupportBurn(d0, nak)
  } else if (opchar === '_') {
    return getUserSupportBurn(d0, nak)
  } else {
    return hex.encode(d0)
  }
}

function getLeaderBlockCommit(d0: Uint8Array, nak:boolean): any {
  const payload:LeaderBlockCommit = {
    block_hash: hex.encode(d0.subarray(3,34)),
    new_seed: hex.encode(d0.subarray(35,67)),
    parent_block: hex.encode(d0.subarray(67,71)),
    parent_txoff: hex.encode(d0.subarray(71,73)),
    key_block: hex.encode(d0.subarray(73,77)),
    key_txoff: hex.encode(d0.subarray(77,79)),
    burn_parent_modulus: hex.encode(d0.subarray(79,80)),
  }
  return payload;
}

function getLeaderVRFKeyRegistration(d0: Uint8Array, nak:boolean): any {
  if (nak) {
    const payload:MinerSignatureValidation = {
      consensus_hash: hex.encode(d0.subarray(3,23)),
      proving_public_key: hex.encode(d0.subarray(23,55)),
      miner_pk: hex.encode(d0.subarray(55,75)),
      memo: hex.encode(d0.subarray(75,80)),
    }
    return payload;
  } else {
    const payload:LeaderVRFKeyRegistration = {
      consensus_hash: hex.encode(d0.subarray(3,23)),
      proving_public_key: hex.encode(d0.subarray(23,55)),
      memo: hex.encode(d0.subarray(55,80)),
    }
    return payload;
  }
}

function getUserSupportBurn(d0: Uint8Array, nak:boolean): any {
  const payload = {
    consensus_hash: hex.encode(d0.subarray(3,23)),
    proving_public_key: hex.encode(d0.subarray(23,55)),
    memo: hex.encode(d0.subarray(55,80)),
  }
  return payload;
}
