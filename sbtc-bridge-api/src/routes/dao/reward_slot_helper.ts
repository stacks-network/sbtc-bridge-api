import { getConfig } from '../../lib/config.js';
import { rewardSlotHolders } from '../../lib/data/db_models.js';
import { RewardSlot } from '../../types/stxeco_stacker_type.js';

const limit = 250;
let depth = 5000;
export async function readAllRewardSlots() {
  let val;
  let runningTotal = 0;
  let count = 0;
  try {
    do {
      val = await readRewardSlots((count * limit), limit)
      if (!val || !val.results || val.results.length === 0) {
        depth = 0
      } else {
        runningTotal += val.results.length
        count++;
        console.log('readRewardSlots: runningTotal: ' + runningTotal);
      }
    }
    while (runningTotal < depth)
  }
  catch (err) {
      console.log('callContractReadOnly4: ', err);
  }
}

export async function readRewardSlots(offset:number, limit:number) {
  const url = getConfig().stacksApi + '/extended/v1/burnchain/reward_slot_holders?offset=' + offset + '&limit=' + limit;
  console.log('readRewardSlots: ' + url);
  try {
    const response = await fetch(url);
    const val = await response.json();
    if (val) {
      for (const event of val.results) {
        //console.log('readRewardSlots: ', event);
        await saveOrUpdateRewardSlot(event)
      }
    }
    return val;
  } catch (err) {
      console.log('callContractReadOnly4: ', err);
  }
}

// -- mongo: reward slots -------------
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

export async function saveOrUpdateRewardSlot(v:RewardSlot) {
	try {
		const pdb = await findRewardSlot(v.address, v.slot_index, v.burn_block_height)
		if (!pdb || !pdb._id) {
			console.log('saveOrUpdateVote: saving: ' + v.address);
			await saveRewardSlot(v)
		}
	} catch (err:any) {
		console.log('saveOrUpdateVote: unable to save or update')
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

