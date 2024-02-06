import { hex } from '@scure/base';
import { poxAddressInfo } from "../../lib/data/db_models.js";
import * as btc from '@scure/btc-signer';
import { getConfig } from "../../lib/config.js";
import { getNumbEntriesRewardCyclePoxList, getPoxInfo, getRewardSetPoxAddress } from "./pox_contract_helper.js";
import * as P from 'micro-packed';
import { burnHeightToRewardCycle } from "./reward_slot_helper.js";
import { PoxAddress, PoxEntry } from '../../types/pox_types.js';

const ADDRESS_VERSION_P2PKH =new Uint8Array([0])
const ADDRESS_VERSION_P2SH = new Uint8Array([1])
const ADDRESS_VERSION_P2WPKH = new Uint8Array([2])
const ADDRESS_VERSION_P2WSH = new Uint8Array([3])
const ADDRESS_VERSION_NATIVE_P2WPKH = new Uint8Array([4])
const ADDRESS_VERSION_NATIVE_P2WSH = new Uint8Array([5])
const ADDRESS_VERSION_NATIVE_P2TR = new Uint8Array([6])

const concat = P.concatBytes;

export async function readPoxEntriesFromContract(cycle:number):Promise<any> {
  if (cycle <= 0) {
    const poxInfo = await getPoxInfo();
    const blockHeight = poxInfo.burn_block_height
    cycle = burnHeightToRewardCycle(blockHeight, poxInfo) + cycle;
  }
  console.log('readPoxEntriesFromContract: ', cycle)
  const len = await getNumbEntriesRewardCyclePoxList(cycle)
  let offset = 0
  try {
    const o = await findLastPoxEntryByCycle(cycle)
    if (o && o.length > 0) offset = o[0].index + 1
  } catch(e) {}

  if (len > 0) {
    console.log('readSavePoxEntries: cycle=' + cycle + ' number entries=' + len + ' from offset=', offset)
    readSavePoxEntries(cycle, len, offset);
    return { entries: len }
  }
  return []
}

function getVersionAsType(version:string) {
  if (version === '0x00') return 'pkh'
  else if (version === '0x01') return 'sh'
  else if (version === '0x04') return 'wpkh'
  else if (version === '0x05') return 'wsh'
  else if (version === '0x06') return 'tr'
}

export function getAddressFromHashBytes(hashBytes:string, version:string) {
  const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
  let btcAddr:string|undefined;
  try {
    let txType = getVersionAsType(version)
    let outType:any;
    if (txType === 'tr') {
      outType = {
        type: getVersionAsType(version),
        pubkey: hex.decode(hashBytes.split('x')[1])
      }
    } else {
      outType = {
        type: getVersionAsType(version),
        hash: hex.decode(hashBytes.split('x')[1])
      }
    }
    const addr:any = btc.Address(net);
    btcAddr = addr.encode(outType)
    return btcAddr
  } catch (err:any) {
    btcAddr = err.message
    console.error('getAddressFromHashBytes: version:hashBytes: ' + version + ':' + hashBytes)
  }
  return btcAddr
}

export function getHashBytesFromAddress(address:string):{version:Uint8Array, hashBytes:Uint8Array }|undefined {
  const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
  let outScript:any;
  try {
    const addr:any = btc.Address(net);
    //const outScript = btc.OutScript.encode(addr.decode(address));
    const s = btc.OutScript.encode(addr.decode(address))
    const outScript = btc.OutScript.decode(s);
    if (outScript.type === "ms") {
      return
    } else if (outScript.type === "pkh") {
      return { version: ADDRESS_VERSION_P2PKH, hashBytes: (outScript.hash) }
    } else if (outScript.type === "sh") {
      return { version: ADDRESS_VERSION_P2SH, hashBytes: (outScript.hash) }
    } else if (outScript.type === "wpkh") {
      return { version: ADDRESS_VERSION_NATIVE_P2WPKH, hashBytes: (outScript.hash) }
    } else if (outScript.type === "wsh") {
      return { version: ADDRESS_VERSION_NATIVE_P2WSH, hashBytes: (outScript.hash) }
    } else if (outScript.type === "tr") {
      return { version: ADDRESS_VERSION_NATIVE_P2TR, hashBytes: (outScript.pubkey) }
    }
    return
  } catch (err:any) {
    console.error('getPartialStackedByCycle: ' + outScript)
  }
  return
}

export async function readSavePoxEntries(cycle:number, len:number, offset:number):Promise<any> {
    const entries = []
    let poxEntry:PoxEntry;
    for (let i = offset; i < len; i++) {
      //if (i > 2) {
      //  i = len;
      //  break;
      //}
      let poxAddr:PoxAddress;
      try {
        const entry = await getRewardSetPoxAddress(cycle, i)
        if (entry) {
          poxAddr = {
            version: entry['pox-addr'].value.version.value, 
            hashBytes: entry['pox-addr'].value.hashbytes.value
          }
    
          poxEntry = {
            index: i,
            cycle,
            poxAddr,
            bitcoinAddr: getAddressFromHashBytes(poxAddr.hashBytes, poxAddr.version),
            stacker: (entry.stacker.value) ? entry.stacker.value.value : undefined,
            totalUstx: Number(entry['total-ustx'].value),
            delegations: 0
          } as PoxEntry
          if (poxEntry.stacker) {
            const result = await readDelegates(poxEntry.stacker)
            poxEntry.delegations = result?.total || 0
          }
          await saveOrUpdatePoxEntry(poxEntry)
          entries.push(poxEntry)
        }
      } catch (err:any) {
        console.error('readSavePoxEntries: saving: ' + poxAddr + '/' + cycle + '/' + i)
        console.error('readSavePoxEntries: ' + err.message)
      }
    }
    return entries
  }
  
  async function readDelegates(delegate:string) {
    const url = getConfig().stacksApi + '/extended/beta/stacking/' + delegate + '/delegations?offset=0&limit=1';
    try {
      const response = await fetch(url);
      const val = await response.json();
      return val;
    } catch (err) {
       console.log('callContractReadOnly4: ', err);
    }
  }
  
  // -- mongo: reward slots -------------
  export async function findLastPoxEntryByCycle(cycle:number):Promise<any> {
    const result = await poxAddressInfo.find({cycle}).sort({index: -1}).limit(1).toArray();
    return result;
  }
  
  export async function findPoxEntryByCycleAndIndex(cycle:number, index:number):Promise<any> {
    const result = await poxAddressInfo.find({cycle, index}).limit(1);
    return result;
  }
  
  export async function findPoxEntry(poxAddr:PoxAddress, totalUstx:number, cycle:number):Promise<any> {
    const result = await poxAddressInfo.findOne({poxAddr, totalUstx, cycle});
    return result;
  }
  
  export async function findPoxEntriesByAddress(address:string):Promise<any> {
    const result = await poxAddressInfo.find({"bitcoinAddr":address});
    return result;
  }
  
  export async function findPoxEntriesByStacker(stacker:string):Promise<any> {
    const result = await poxAddressInfo.find({stacker}).toArray();
    return result;
  }
  
  export async function findPoxEntriesByStackerAndCycle(stacker:string, cycle:number):Promise<any> {
    const result = await poxAddressInfo.find({stacker, cycle}).toArray();
    return result;
  }
  
  export async function findPoxEntriesByCycle(cycle:number):Promise<any> {
    const result = await poxAddressInfo.find({cycle}).toArray();
    return result;
  }
  
  export async function saveOrUpdatePoxEntry(poxEntry:PoxEntry) {
	try {
		const pdb = await findPoxEntry(poxEntry.poxAddr, poxEntry.totalUstx, poxEntry.cycle)
    // hashBytes: 1, version: 1, totalUstx: 1, cycle: 1
		if (!pdb || !pdb._id) {
      console.log('saveOrUpdatePoxEntry: saving: ' + poxEntry.bitcoinAddr + '/' + poxEntry.stacker + '/' + poxEntry.cycle + '/' + poxEntry.index)
			await savePoxEntryInfo(poxEntry)
		}
	} catch (err:any) {
		//console.log('saveOrUpdateVote: unable to save or update', err)
	}
}

export async function savePoxEntryInfo(vote:any) {
	const result = await poxAddressInfo.insertOne(vote);
	return result;
}

async function updatePoxEntryInfo(vote:any, changes: any) {
	const result = await poxAddressInfo.updateOne({
		_id: vote._id
	},
    { $set: changes});
	return result;
}

