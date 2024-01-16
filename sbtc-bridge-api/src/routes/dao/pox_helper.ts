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

function getAddressFromHasbytes(hashBytes:string, version:string) {
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

async function saveRewardCyclePoxList(cycle:number):Promise<any> {
    const len = await getNumbEntriesRewardCyclePoxList(cycle)
    console.log('saveRewardCyclePoxList: len: ' + len)
    const entries = []
    for (let i = 0; i < len; i++) {
      try {
        const entry = await getNextEntryRewardCyclePoxList(cycle, i)
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
  
  export async function getNextEntryRewardCyclePoxList(cycle:number, index:number):Promise<any> {
    const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`, `0x${hex.encode(serializeCV(uintCV(index)))}`];
      const data = {
      contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
      contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
      functionName: 'get-reward-set-pox-address',
      functionArgs,
    }
    const result = (await callContractReadOnly(data)).value;
    return result
  }
  
  export async function getNumbEntriesRewardCyclePoxList(cycle:number):Promise<any> {
    const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
      const data = {
      contractAddress: getDaoConfig().VITE_DOA_POX.split('.')[0],
      contractName: getDaoConfig().VITE_DOA_POX.split('.')[1],
      functionName: 'get-num-reward-set-pox-addresses',
      functionArgs,
    }
    const result = (await callContractReadOnly(data)).value;
    return result
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

