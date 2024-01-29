import { getDaoConfig } from "../../lib/config_dao.js"
import { serializeCV, uintCV } from '@stacks/transactions';
import { hex } from '@scure/base';
import { callContractReadOnly } from "../stacks/stacks_helper.js"
import { getStacksInfo } from "./dao_helper.js";
import { PoxEntry } from "../../types/stxeco_stacker_type.js";
import { poxAddressInfo } from "../../lib/data/db_models.js";
import * as btc from '@scure/btc-signer';
import { getConfig } from "../../lib/config.js";
import { base58 } from "@scure/base";
import { getNumbEntriesRewardCyclePoxList, getRewardSetPoxAddress } from "../pox/pox_contract_helper.js";
import * as P from 'micro-packed';

const concat = P.concatBytes;

export async function readPoxAddressInfo(cycle:number):Promise<any> {
  if (cycle <= 0) {
    const stacksInfo = await getStacksInfo();
    const blockHeight = stacksInfo.burn_block_height
    cycle = Number((await getRewardCycleFromBurnHeight(blockHeight))) + cycle;
  }
  console.log('readPoxAddressInfo: ', cycle)
  const entries = await saveRewardCyclePoxList(cycle);
  return entries
}

export async function getRewardCycleFromBurnHeight(burnHeight:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(burnHeight)))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
    contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
    functionName: 'burn-height-to-reward-cycle',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return result
}

export function getAddressFromHasbytes(hashBytes:string, version:string) {
  const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
  let btcAddr:string;
  try {
    const scureAddr:any = btc.Address(net);
    let outS = btc.OutScript.decode(hex.decode(version + hashBytes))
    btcAddr = scureAddr.encode(outS)
  } catch (err:any) {
    //console.log('getAddressFromHasbytes: ', err)
    try {
      btcAddr = base58.encode(hex.decode(version + hashBytes));
      //console.log('getAddressFromHasbytes: btcAddr: ', btcAddr)
    } catch (err:any) {
      //console.log('getAddressFromHasbytes: addr: ', btcAddr)
      btcAddr =  'unable to parse'
    }
  }
  return btcAddr
  //let addr = base58.encode(hex.decode(version + hashBytes));
}

export function getHasbytesFromAddress(address:string):{version:Uint8Array, hashBytes:Uint8Array }|undefined {
  const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
  let outScript:any;
  try {
    const addr:any = btc.Address(net);
    console.debug('getHasbytesFromAddress: ', net)
    console.debug('getHasbytesFromAddress: ', btc.Address(btc.NETWORK).decode(address))
    //outScript = btc.OutScript.encode(address);
    const s = btc.OutScript.encode(btc.Address(net).decode(address))
    outScript = btc.OutScript.decode(s);
    if (outScript.type === "ms") {
      return
    } else if (outScript.type === "pkh") {
      return { version: (new Uint8Array(0)), hashBytes: (outScript.hash) }
    } else if (outScript.type === "sh") {
      return { version: (new Uint8Array(1)), hashBytes: (outScript.hash) }
    } else if (outScript.type === "wpkh") {
      return { version: (new Uint8Array(4)), hashBytes: (outScript.hash) }
    } else if (outScript.type === "wsh") {
      return { version: (new Uint8Array(5)), hashBytes: (outScript.hash) }
    } else if (outScript.type === "tr") {
      return { version: (new Uint8Array(6)), hashBytes: (outScript.pubkey) }
    }
    return
  } catch (err:any) {
    console.error('getPartialStackedByCycle: ' + outScript)
  }
  return
}

async function saveRewardCyclePoxList(cycle:number):Promise<any> {
    const len = await getNumbEntriesRewardCyclePoxList(cycle)
    console.log('saveRewardCyclePoxList: len: ' + len)
    const entries = []
    for (let i = 0; i < len; i++) {
      try {
        const entry = await getRewardSetPoxAddress(cycle, i)
        if (entry) {
          //console.log('saveRewardCyclePoxList: entry: ', entry)
          const hashBytes = entry.value['pox-addr'].value.hashbytes.value.split('x')[1]
          const version = entry.value['pox-addr'].value.version.value.split('x')[1]
          const net = (getConfig().network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK
          let poxAddr = getAddressFromHasbytes(hashBytes, version);
          const poxEntry = {
            cycle,
            poxAddr,
            hashBytes,
            version,
            stacker: entry.value.stacker.value.value,
            totalUstx: Number(entry.value['total-ustx'].value),
            delegations: 0
          } as PoxEntry
          if (poxEntry.stacker) {
            const result = await readDelegates(poxEntry.stacker)
            poxEntry.delegations = result?.total || 0
            //console.log('saveRewardCyclePoxList: delegations: ', result)
          }
          await saveOrUpdatePoxEntry(poxEntry)
          //console.log('saveRewardCyclePoxList: entry saved ')
          entries.push(poxEntry)
        }
      } catch (err:any) {
        // continue
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
export async function findPoxAddress(address:string):Promise<any> {
	const result = await poxAddressInfo.findOne({"address":address});
	return result;
}

export async function saveOrUpdatePoxEntry(v:PoxEntry) {
	try {
		const pdb = await findPoxAddress(v.poxAddr)
		if (!pdb || !pdb._id) {
			//console.log('saveOrUpdateVote: saving: ' + v.poxAddr);
			await savePoxAddressInfo(v)
		}
	} catch (err:any) {
		//console.log('saveOrUpdateVote: unable to save or update', err)
	}
}

export async function savePoxAddressInfo(vote:any) {
	const result = await poxAddressInfo.insertOne(vote);
	return result;
}

async function updatePoxAddressInfo(vote:any, changes: any) {
	const result = await poxAddressInfo.updateOne({
		_id: vote._id
	},
    { $set: changes});
	return result;
}

