/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { cvToJSON, deserializeCV } from '@stacks/transactions';
import { getConfig } from '../../../lib/config.js';
import { pox4EventsCollection } from '../../../lib/data/db_models.js';
import util from 'util'
import { DelegationAggregationIncrease, DelegationStackExtend, DelegationStackIncrease, DelegationStackStx, DelegationStx, HandleUnlock, PoolStackerEvent, PoxAddress, StackExtend, StackIncrease, StackStx } from '../../../types/pox_types.js';


export async function readPox4Events() {
  const url = getConfig().stacksApi + '/extended/v1/contract/' + getConfig().pox4ContractId + '/events?limit=' + 20;
  let currentOffset = await countsPoolStackerEvents()
  console.log('readPox4Events: currentOffset:' + currentOffset)
  if (!currentOffset) currentOffset = 0
  let count = 0;
  let moreEvents = true
  try {
    do {
      try {
        let urlOffset = url + '&offset=' + (currentOffset + (count * 20))
        const response = await fetch(urlOffset);
        const val = await response.json();
        console.log('innerReadPox4Events: reading more: ' + urlOffset)
        moreEvents = await innerReadPox4Events(val)
        count++;
      } catch (err:any) {
        console.log('readPox4Events: ' + err.message)
      }
    }
    while (moreEvents)
  }
  catch (err) {
      console.log('callContractReadOnly4: ', err);
  }
}

async function innerReadPox4Events(val:any):Promise<any> {
  let stackerEvent:PoolStackerEvent;
  let result:any;
  if (!val || !val.results || val.results.length === 0) {
    console.log('innerReadPox4Events: all done.');
    return false
  }
  for (const event of val.results) {
    try {
      //console.log('innerReadPox4Events: event.contract_log.value: ', event.contract_log.value)
      result = cvToJSON(deserializeCV(event.contract_log.value.hex)).value.value;
      const eventName = result.name.value
      stackerEvent = {
        //submitTxId: event.tx_id,
        eventIndex: event.event_index,
        burnchainUnlockHeight: Number(result['burnchain-unlock-height'].value),
        event: eventName,
        locked: Number(result.locked.value),
        balance: Number(result.balance.value),
        stacker: result.stacker.value,
      } as any

      let data:DelegationStx|DelegationAggregationIncrease|DelegationStackExtend|DelegationStackStx|DelegationStackIncrease|StackStx|StackIncrease|StackExtend|HandleUnlock
      if (eventName === 'stack-aggregation-increase') {
        data = {
          amountUstx: Number(result.data.value['amount-ustx'].value),
          delegator: result.data.value['delegator'].value,
          rewardCycle: Number(result.data.value['reward-cycle'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'delegate-stack-extend') {
        data = {
          amountUstx:0,
          delegator: result.data.value['delegator'].value,
          extendCount: Number(result.data.value['extend-count'].value),
          unlockBurnHeight: Number(result.data.value['unlock-burn-height'].value),
          stacker: result.data.value['stacker'].value,
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'delegate-stack-stx') {
        data = {
          amountUstx:0,
          delegator: result.data.value['delegator'].value,
          lockAmount: Number(result.data.value['lock-amount'].value),
          lockPeriod: Number(result.data.value['lock-period'].value),
          unlockBurnHeight: Number(result.data.value['unlock-burn-height'].value),
          startBurnHeight: Number(result.data.value['start-burn-height'].value),
          stacker: result.data.value['stacker'].value,
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'delegate-stx') {
        data = {
          amountUstx: Number(result.data.value['amount-ustx'].value),
          delegator: result.data.value['delegate-to'].value,
          unlockBurnHeight: Number(result.data.value['unlock-burn-height'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'stack-aggregation-commit-indexed') {
        data = {
          amountUstx: Number(result.data.value['amount-ustx'].value),
          delegator: result.data.value['delegator'].value,
          rewardCycle: Number(result.data.value['reward-cycle'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'stack-aggregation-commit') {
        data = {
          amountUstx: Number(result.data.value['amount-ustx'].value),
          delegator: result.data.value['delegator'].value,
          rewardCycle: Number(result.data.value['reward-cycle'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'delegate-stack-increase') {
        data = {
          amountUstx:0,
          delegator: result.data.value['delegator'].value,
          increaseBy: Number(result.data.value['increase-by'].value),
          totalLocked: Number(result.data.value['total-locked'].value),
          stacker: result.data.value['stacker'].value,
          poxAddr: extractPoxAddress(result.data.value['pox-addr'])
        }
      } else if (eventName === 'stack-stx') {
        data = {
          amountUstx:0,
          lockAmount: Number(result.data.value['lock-amount'].value),
          lockPeriod: Number(result.data.value['lock-period'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr']),
          unlockBurnHeight: Number(result.data.value['unlock-burn-height'].value),
          startBurnHeight: Number(result.data.value['start-burn-height'].value),
        }
      } else if (eventName === 'stack-increase') {
        data = {
          amountUstx:0,
          increaseBy: Number(result.data.value['increase-by'].value),
          totalLocked: Number(result.data.value['total-locked'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr']),
        }
      } else if (eventName === 'stack-extend') {
        data = {
          amountUstx:0,
          extendCount: Number(result.data.value['extend-count'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr']),
          unlockBurnHeight: Number(result.data.value['unlock-burn-height'].value),
        }
      } else if (eventName === 'handle-unlock') {
        data = {
          amountUstx:0,
          firstCycleLocked: Number(result.data.value['first-cycle-locked'].value),
          poxAddr: extractPoxAddress(result.data.value['pox-addr']),
          firstUnlockedCycle: Number(result.data.value['first-unlocked-cycle'].value),
        }
      } else {
        console.log('innerReadPox4Events: missed: ', util.inspect(result, false, null, true /* enable colors */));
      }
      stackerEvent.data = data;
      //console.log('innerReadPox4Events: ', util.inspect(stackerEvent, false, null, true /* enable colors */));
      await savePoolStackerEvent(stackerEvent)
    } catch (err:any) {
      console.log('innerReadPox4Events: error: ', util.inspect(result, false, null, true /* enable colors */));
      console.log('innerReadPox4Events: error: ' + err.message)
    }
  }
  return true
}

function extractPoxAddress(result: any):PoxAddress {
  try {
    const version = result.value.version.value
    const hashBytes = result.value.hashbytes.value
    return { version, hashBytes }
  } catch (err:any) {
    return
  }
}

export async function countsPoolStackerEventsByEvent(event:string):Promise<number> {
  try {
    const result = await pox4EventsCollection.countDocuments({event});
    return Number(result);
  } catch (err:any) {
    return 0
  }
}

export async function countsPoolStackerEvents():Promise<number> {
  try {
    const result = await pox4EventsCollection.countDocuments();
    return Number(result);
  } catch (err:any) {
    return 0
  }
}

export async function findPoolStackerEvents(page:number, limit:number):Promise<any> {
  const result = await pox4EventsCollection.find({}).skip(page * limit).limit( limit ).toArray();
  return result;
}

export async function aggregateDelegationData():Promise<any> {
  const result1Query = '{$match: {"data.delegator": {$exists: true}}}, { $group: {_id:{"delegator":"$data.delegator"}, "total": {$sum: "$data.amountUstx" }, delegations: {$sum:1} } }'
  const result2Query = '{$match: {"data.delegator": {$exists: true}, event:"delegate-stx"}}, { $group: {_id:{"delegator":"$data.delegator"}, "total": {$sum: "$data.amountUstx" }, delegations: {$sum:1} } }'
  const result3Query = '{ $group: {_id:{"event":"$event"}, "total": {$sum: "$amountUstx" }, count: {$sum:1} } }'
  const result1 = await pox4EventsCollection.aggregate([{$match: {"data.delegator": {$exists: true}}}, { $group: {_id:{"delegator":"$data.delegator"}, "total": {$sum: "$data.amountUstx" }, delegations: {$sum:1} } } ]).toArray();
  const result2 = await pox4EventsCollection.aggregate([{$match: {"data.delegator": {$exists: true}, event:'delegate-stx'}}, { $group: {_id:{"delegator":"$data.delegator"}, "total": {$sum: "$data.amountUstx" }, delegations: {$sum:1} } } ]).toArray();
  const result3 = await pox4EventsCollection.aggregate([ { $group: {_id:{"event":"$event"}, "total": {$sum: "$amountUstx" }, count: {$sum:1} } } ]).toArray();
  return {result1, result1Query, result2, result2Query, result3, result3Query};
}

export async function findPoolStackerEventsByEvent(event:string, page:number, limit:number):Promise<any> {
  const result = await pox4EventsCollection.find({event}).skip(page * limit).limit( limit ).toArray();
  return result;
}


export async function findPoolStackerEventsByHashBytes(hashBytes:string, page:number, limit:number):Promise<any> {
  if (!hashBytes.startsWith('0x')) hashBytes = '0x' + hashBytes
  const result = await pox4EventsCollection.find({"data.poxAddr.hashBytes":hashBytes}).skip(page * limit).limit( limit ).toArray();
  return result;
}

export async function findPoolStackerEventsByHashBytesAndEvent(hashBytes:string, event:string):Promise<any> {
  if (!hashBytes.startsWith('0x')) hashBytes = '0x' + hashBytes
  const result = await pox4EventsCollection.find({"data.poxAddr.hashBytes":hashBytes, event}).toArray();
  return result;
}

export async function findPoolStackerEventsByHashBytesAndVersion(version:string, hashBytes:string, page:number, limit:number):Promise<any> {
  if (!hashBytes.startsWith('0x')) hashBytes = '0x' + hashBytes
  if (!version.startsWith('0x')) version = '0x' + version
  const result = await pox4EventsCollection.find({"data.poxAddr.hashBytes":hashBytes, "data.poxAddr.version":version, }).skip(page * limit).limit( limit ).toArray();
  return result;
}

export async function findPoolStackerEventsByStacker(stacker:string):Promise<any> {
  const result = await pox4EventsCollection.find({"stacker":stacker}).toArray();
  return result;
}

export async function findPoolStackerEventsByDelegator(stacker:string):Promise<any> {
  const result = await pox4EventsCollection.find({"data.delegator":stacker}).toArray();
  return result;
}

export async function findPoolStackerEventsByStackerAndEvent(stacker:string, event:string):Promise<any> {
  const result = await pox4EventsCollection.find({stacker:stacker, event: event}).toArray();
  return result;
}

export async function findPoolStackerEventsBySubmitTxId(criteria:any):Promise<any> {
  const result = await pox4EventsCollection.findOne(criteria);
  return result;
}

export async function saveOrUpdatePoolStackerEvent(v:PoolStackerEvent) {
  try {
    const pdb = await findPoolStackerEventsBySubmitTxId(v)
    if (pdb) {
      console.log('saveOrUpdatePoolStackerEvent: updating:  event: ' + v.event + ' stacker: ' + v.stacker + ' amountUstx: ' + ' unlockHeight: ' + v.burnchainUnlockHeight);
      await updatePoolStackerEvent(pdb, v)
    } else {
      const amt = v.data?.amountUstx || 0
      console.log('saveOrUpdatePoolStackerEvent: saving: event: ' + v.event + ' stacker: ' + v.stacker + ' amountUstx: ' + amt + ' unlockHeight: ' + v.burnchainUnlockHeight);
      await savePoolStackerEvent(v)
    }
  } catch (err:any) {
    console.log('saveOrUpdatePoolStackerEvent: unable to save or update: ' + err.message)
  }
}

async function savePoolStackerEvent(v:any) {
  //console.log('saveOrUpdatePoolStackerEvent: saving: event: ' + v.event + ' amountUstx: ' + v.data.amountUstx + ' unlockHeight: ' + v.burnchainUnlockHeight);
  const result = await pox4EventsCollection.insertOne(v);
  return result;
}

async function updatePoolStackerEvent(vote:any, changes: any) {
  const result = await pox4EventsCollection.updateOne({
    _id: vote._id
  },
    { $set: changes});
  return result;
}
