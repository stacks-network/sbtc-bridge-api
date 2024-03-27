import { getConfig } from '../../lib/config.js';
import { rewardSlotHolders } from '../../lib/data/db_models.js';
import { PoxInfo, RewardSlot } from '../../types/pox_types.js';
import { getPoxInfo } from './pox_contract_helper.js';

const limit = 250;
let depth = 6000;

export function burnHeightToRewardCycle(height:number, poxInfo: PoxInfo) {
  const s = height - poxInfo.first_burnchain_block_height
  return Math.floor(s / poxInfo.reward_cycle_length)
}

export function startSlot() {
  if (getConfig().network === 'mainnet') {
    return 60 // first after 2.1 bug when everyone had to re-stack
  } else {
    return 500
  }
}

export async function readAllRewardSlots() {
  const poxInfo = await getPoxInfo()
  let val;
  let runningTotal = 0;
  let count = 0;
  let finished = false
  try {
    do {
      val = await readRewardSlots((count * limit), limit, poxInfo)
      if (!val || !val.results || val.results.length === 0) {
        finished = true
      } else {
        const leastRecentSlot = val.results[val.results.length - 1]
        if (leastRecentSlot.cycle < startSlot()) {
          finished = true
        }
        runningTotal += val.results.length
        count++;
        console.log('readRewardSlots: runningTotal: ' + runningTotal);
      }
    }
    while (runningTotal < depth && !finished)
  }
  catch (err) {
      console.log('readAllRewardSlots: ', err);
  }
}

export async function readRewardSlots(offset:number, limit:number, poxInfo:PoxInfo) {

  const url = getConfig().stacksApi + '/extended/v1/burnchain/reward_slot_holders?offset=' + offset + '&limit=' + limit;
  console.log('readRewardSlots: ' + url);
  try {
    const response = await fetch(url);
    const val = await response.json();
    if (val) {
      for (const event of val.results) {
        const cycle = burnHeightToRewardCycle(event.burn_block_height, poxInfo)
        if (cycle < startSlot()) throw new Error('Cycle out of bounds: ' + cycle + ' (at burn height=' + event.burn_block_height + ')')
        event.cycle = cycle
        await saveNotUpdateRewardSlot(event)
        console.log('readRewardSlots: ', event);
      }
    }
    return val;
  } catch (err) {
      console.error('readRewardSlots: ' + err.message);
  }
}

export async function getRewardsByAddress(offset:number, limit:number, address:string) {

  const url = getConfig().stacksApi + '/extended/v1/burnchain/rewards/' + address + '?offset=' + offset + '&limit=' + limit;
  console.log('readRewardSlots: ' + url);
  try {
    const response = await fetch(url);
    const val = await response.json();
    return (val.results) ? val.results : [];
  } catch (err) {
      console.error('readRewardSlots: ' + err.message);
  }
}

// -- mongo: reward slots -------------
export async function findRewardSlotByCycle(cycle:number):Promise<any> {
	const result = await rewardSlotHolders.find({"cycle":cycle}).toArray();
	return result;
}

export async function findRewardSlotByAddress(address:string):Promise<any> {
	const result = await rewardSlotHolders.find({"address":address}).toArray();
	return result;
}

export async function findRewardSlotByAddressMinHeight(address:string):Promise<any> {
	const result = await rewardSlotHolders.find({"address":address}).sort({burn_block_height: 1}).limit(1).toArray();
	return result;
}

export async function findRewardSlotByAddressMaxHeight(address:string):Promise<any> {
	const result = await rewardSlotHolders.find({"address":address}).sort({burn_block_height: -1}).limit(1).toArray();
	return result;
}

export async function findRewardSlot(address:string, slot_index:number, burn_block_height:number):Promise<any> {
	const result = await rewardSlotHolders.findOne({"address":address, 'slot_index': slot_index, 'burn_block_height': burn_block_height});
	return result;
}

export async function saveNotUpdateRewardSlot(v:RewardSlot) {
  const pdb = await findRewardSlot(v.address, v.slot_index, v.burn_block_height)
  if (!pdb || !pdb._id) {
    console.log('saveOrUpdateVote: saving: ' + v.address);
    await saveRewardSlot(v)
  } else {
    console.error('Already saved this one.. exiting.. ', v)
    throw new Error('Already saved - no need to continue...')
  }
}

export async function saveRewardSlot(vote:any) {
	const result = await rewardSlotHolders.insertOne(vote);
	return result;
}

async function updateRewardSlot(vote:any, changes: any) {
	const result = await rewardSlotHolders.updateOne({
		_id: vote._id
	},
    { $set: changes});
	return result;
}

