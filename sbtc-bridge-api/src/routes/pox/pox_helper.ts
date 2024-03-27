import { hex } from '@scure/base';
import { poxAddressInfo } from "../../lib/data/db_models.js";
import * as btc from '@scure/btc-signer';
import { getConfig } from "../../lib/config.js";
import { getNumbEntriesRewardCyclePoxList, getPoxCycleInfo, getPoxInfo, getStackerInfoFromContract, getRewardSetPoxAddress } from "./pox_contract_helper.js";
import * as P from 'micro-packed';
import { burnHeightToRewardCycle, findRewardSlotByAddress, getRewardsByAddress } from "./reward_slot_helper.js";
import { PoolStackerEvent, PoxAddress, PoxEntry, StackerInfo, StackerStats } from '../../types/pox_types.js';
import { decodeStacksAddress } from '../../lib/utils_stacks.js';
import { findVotesByVoter } from '../dao/vote_count_helper.js';
import { findPoolStackerEventsByHashBytesAndVersion, findPoolStackerEventsByStacker } from './pool_stacker_events_helper.js';
import { VoteEvent } from '../../types/stxeco_type.js';

const ADDRESS_VERSION_P2PKH =new Uint8Array([0])
const ADDRESS_VERSION_P2SH = new Uint8Array([1])
const ADDRESS_VERSION_P2WPKH = new Uint8Array([2])
const ADDRESS_VERSION_P2WSH = new Uint8Array([3])
const ADDRESS_VERSION_NATIVE_P2WPKH = new Uint8Array([4])
const ADDRESS_VERSION_NATIVE_P2WSH = new Uint8Array([5])
const ADDRESS_VERSION_NATIVE_P2TR = new Uint8Array([6])

export async function collatePoolStackerInfo(address:string, cycle:number):Promise<StackerStats> {
  const addressType = 'stacks'
  const votes = await findVotesByVoter(address)
  console.log('collatePoolStackerInfo: votes: ' + votes.length)
  const rewardSlots:Array<any> = [];
  const poxEntries:Array<any> = await findPoxEntriesByStacker(address);
  const stackerEvents:Array<PoolStackerEvent> = await findPoolStackerEventsByStacker(address)
  const stackerEventsAsDelegator:Array<PoolStackerEvent> = await findPoolStackerEventsByStacker(address)
  const stackerInfo:Array<StackerInfo> = [];

  const stackerInfoPerCycle = (await getStackerInfoFromContract(address, cycle)) as StackerInfo;
  stackerInfoPerCycle.cycleInfo = await getPoxCycleInfo(cycle);
  countEntries(cycle, stackerInfoPerCycle)
  stackerInfo.push(stackerInfoPerCycle)

  return {
    address,
    addressType,
    cycle,
    votes,
    stackerInfo,
    poxEntries,
    rewardSlots,
    stackerEvents,
    stackerEventsAsDelegator,
  }
}
async function countEntries(cycle:number, stackerInfo:StackerInfo) {
  let entries:Array<any> = [];
  let totalStacked = 0
  if (!stackerInfo || !stackerInfo.stacker || !stackerInfo.stacker.rewardSetIndexes) {
    return {entries, totalStacked};
  }

  for (const entry of stackerInfo.stacker.rewardSetIndexes) {
    try {
      const result = await findPoxEntryByCycleAndIndex(cycle, Number(entry.value))
      //console.log('countEntries: poxEntry: ', result)
      if (result && result.length > 0) {
        entries.push({
          amount: result[0].totalUstx,
          cycle: result[0].cycle,
          index: result[0].index,
          bitcoinAddress: result[0].bitcoinAddr
        })
        totalStacked += result[0].totalUstx
      }
    } catch(err:any) {
      console.log('countEntries: ' + err.message)
    }
  }
  return {entries, totalStacked}
}

export async function extractAllPoxEntriesInCycle(address:string, cycle:number) {
  const poxEntries:Array<any> = await findPoxEntriesByAddressAndCycle(address, cycle);
  //console.log('extractAllPoxEntriesInCycle: poxEntries: address: ' + address + ' cycle: ' + cycle, poxEntries)
  let newEntries = [];
  try {
    for (const entry of poxEntries) {
      const idx = newEntries.findIndex((o) => o.index === entry.index)
      if (idx === -1) newEntries.push(entry)
    }
  } catch(err:any) {
    newEntries = poxEntries;
    console.error('extractAllPoxEntriesInCycle: error1: ' + err.message)
  }
  //console.log('extractAllPoxEntriesInCycle: ' + newEntries.length)

  for (const entry of newEntries) {
    try {
      if (entry.stacker) {
        const stackerInfoPerCycle = (await getStackerInfoFromContract(entry.stacker, entry.cycle));
        if (stackerInfoPerCycle?.stacker?.rewardSetIndexes) {
          entry.poxStackerInfo = await countEntries(entry.cycle, stackerInfoPerCycle)
        }
      } else {
        entry.poxStackerInfo = []
      }
    } catch (err:any) {
      console.error('extractAllPoxEntriesInCycle: error2: ' + err.message)
    }
  }
  return newEntries
}

export async function collateSoloStackerInfo(address:string, cycle:number):Promise<StackerStats> {

  const addressType = 'bitcoin'
  const votes = await findVotesByVoter(address)

  let vote:VoteEvent
  if (votes && votes.length > 0) vote = votes[0]

  let voterProxy = address
  if (vote && vote.voterProxy) voterProxy = vote.voterProxy
  console.log('collateSoloStackerInfo: address: ' + address + ' proxy: ' + voterProxy)

  //const rewardSlots:Array<any> = await findRewardSlotByAddress(address);
  const rewardSlots:Array<any> = await getRewardsByAddress(0, 30, voterProxy);
  let poxEntries:Array<any> = await extractAllPoxEntriesInCycle(voterProxy, cycle);
  const poxEntries1:Array<any> = await extractAllPoxEntriesInCycle(voterProxy, cycle + 1);
  poxEntries = poxEntries.concat(poxEntries1)
  let stackerEvents:Array<PoolStackerEvent> = []
  let stackerEventsAsDelegator:Array<PoolStackerEvent> = [];
  if (vote) {
    stackerEvents = await findPoolStackerEventsByStacker(vote.poxStacker)
    stackerEventsAsDelegator = await findPoolStackerEventsByStacker(vote.poxStacker);
  }
  const hashBytes = getHashBytesFromAddress(voterProxy)
  const stackerEventsAsPoxAddress:Array<PoolStackerEvent> = await findPoolStackerEventsByHashBytesAndVersion(hashBytes.version, hashBytes.hashBytes, 0, 100);
  
  const stackerInfo:Array<StackerInfo> = [];
  //const stackerInfoPerCycle = (await getStackerInfoFromContract(address, cycle));
  //console.log('collateSoloStackerInfo: poxCycles: stackerInfoPerCycle: ',stackerInfoPerCycle)
  //stackerInfoPerCycle.cycleInfo = await getPoxCycleInfo(cycle);
  //countEntries(cycle, stackerInfoPerCycle)
  //stackerInfo.push(stackerInfoPerCycle)

  return {
    address,
    addressType,
    cycle,
    votes,
    stackerInfo,
    poxEntries,
    rewardSlots,
    stackerEvents,
    stackerEventsAsDelegator,
    stackerEventsAsPoxAddress,
  }
}

export async function collateStackerInfo(address:string, cycle:number):Promise<StackerStats> {
    if (address.toUpperCase().startsWith('S')) {
      console.log('collateStackerInfo: stacks address: ' + address)
      return await collatePoolStackerInfo(address, cycle)
    } else {
      console.log('collateStackerInfo: bitcoin address: ' + address)
      return await collateSoloStackerInfo(address, cycle)
    }

}

export async function readPoxEntriesFromContract(cycle:number):Promise<any> {
  if (cycle <= 0) {
    const poxInfo = await getPoxInfo();
    const blockHeight = poxInfo.burn_block_height
    cycle = burnHeightToRewardCycle(blockHeight, poxInfo) + cycle;
  }
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
  if (!version.startsWith('0x')) version = '0x' + version
  if (!hashBytes.startsWith('0x')) hashBytes = '0x' + hashBytes
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

export function getHashBytesFromAddress(address:string):{version:string, hashBytes:string }|undefined {
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
      return { version: hex.encode(ADDRESS_VERSION_P2PKH), hashBytes: hex.encode(outScript.hash) }
    } else if (outScript.type === "sh") {
      return { version: hex.encode(ADDRESS_VERSION_P2SH), hashBytes: hex.encode(outScript.hash) }
    } else if (outScript.type === "wpkh") {
      return { version: hex.encode(ADDRESS_VERSION_NATIVE_P2WPKH), hashBytes: hex.encode(outScript.hash) }
    } else if (outScript.type === "wsh") {
      return { version: hex.encode(ADDRESS_VERSION_NATIVE_P2WSH), hashBytes: hex.encode(outScript.hash) }
    } else if (outScript.type === "tr") {
      return { version: hex.encode(ADDRESS_VERSION_NATIVE_P2TR), hashBytes: hex.encode(outScript.pubkey) }
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
            //console.log('readDelegates: ', result)
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
    const result = await poxAddressInfo.find({cycle, index}).limit(1).toArray();
    return result;
  }
  
  export async function findPoxEntryByPoxAddr(poxAddr:PoxAddress):Promise<any> {
    const result = await poxAddressInfo.findOne({poxAddr});
    return result;
  }
  
  export async function findPoxEntriesByAddress(address:string):Promise<any> {
    const result = await poxAddressInfo.find({"bitcoinAddr":address}).toArray();
    return result;
  }
  
  export async function findPoxEntriesByAddressAndCycle(address:string, cycle:number):Promise<any> {
    const result = await poxAddressInfo.find({"bitcoinAddr":address, cycle}).toArray();
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
    console.log('saveOrUpdatePoxEntry: saving: ' + poxEntry.bitcoinAddr + '/' + poxEntry.stacker + '/' + poxEntry.cycle + '/' + poxEntry.index)
    await savePoxEntryInfo(poxEntry)
  } catch (err:any) {
		console.log('saveOrUpdateVote: unable to save or update' + poxEntry.bitcoinAddr)
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

