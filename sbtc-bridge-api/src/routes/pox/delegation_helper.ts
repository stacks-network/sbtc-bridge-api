import { getConfig } from '../../lib/config.js';
import { delegationEvents } from '../../lib/data/db_models.js';
import { Delegation } from '../../types/pox_types.js';
import { getPoxInfo } from './pox_contract_helper.js';
import { burnHeightToRewardCycle, startSlot } from './reward_slot_helper.js';

export async function readDelegationEvents(poolPrincipal:string, offset:number, limit:number) {

  const poxInfo = await getPoxInfo()
  const url = getConfig().stacksApi + '/extended/beta/stacking/' + poolPrincipal + '/delegations?offset=' + offset + '&limit=' + limit;
  console.log('readDelegationEvents: ' + url);
  try {
    const response = await fetch(url);
    const val = await response.json();
    if (val) {
      for (const event of val.results) {
        const cycle = burnHeightToRewardCycle(event.block_height, poxInfo)
        if (cycle >= startSlot()) event.cycle = cycle
      }
    }
    return val;
  } catch (err) {
      console.error('readDelegationEvents: ' + err.message);
  }
}