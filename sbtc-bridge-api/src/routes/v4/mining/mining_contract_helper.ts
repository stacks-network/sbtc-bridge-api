import { bitcoinToSats } from "sbtc-bridge-lib";
import { getBlock } from "../../../lib/bitcoin/rpc_blockchain.js";
import { getConfig } from "../../../lib/config.js";
import { BurnBlock, L1Input, L1Output, Layer1StacksTx } from "../../../types/mining_types.js";
import { getPoxInfo } from "../pox-contract/pox_contract_helper.js";
import util from 'util'
import { parseRawPayload } from "./payload_type_parser.js";
import { pox4BitcoinStacksTxCollection } from "../../../lib/data/db_models.js";
import { PoxEntry } from "../../../types/pox_types.js";

export const MAGIC_BYTES_TESTNET = '5432';  // 
export const MAGIC_BYTES_TESTNET_NAK = '4e33';
export const MAGIC_BYTES_MAINNET = '5832';
export const MAGIC_BYTES_MAINNET_NAK = '5832';
export const OPCODES = [ 
  {opcode: '3c', opchar: '<', name:'sbtc-deposit', sip: 'SIP025', url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-001/sip-001-burn-election.md#bitcoin-wire-formats'} ,
  {opcode: '3e', opchar: '>', name:'sbtc-withdrawal', sip: 'SIP025', url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-001/sip-001-burn-election.md#bitcoin-wire-formats'} ,
  {opcode: '5b', opchar: '[', name:'leader-block-commit', sip: 'SIP001', url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-001/sip-001-burn-election.md#bitcoin-wire-formats'} ,
  {opcode: '5e', opchar: '^', name:'leader-vrf-key-registrations', sip: 'SIP001', url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-001/sip-001-burn-election.md#bitcoin-wire-formats'} ,
  {opcode: '5f', opchar: '_', name:'user-support-burns', sip: 'SIP001', url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-001/sip-001-burn-election.md#bitcoin-wire-formats'} ,
  {opcode: '70', opchar: 'p', name:'pre-stx-op', sip: 'SIP007', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-007/sip-007-stacking-consensus.md#prestxop'} ,
  {opcode: '78', opchar: 'x', name:'stack-stx-op', sip: 'SIP007', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-007/sip-007-stacking-consensus.md#prestxop'} ,
  {opcode: '24', opchar: '$', name:'transfer-stx-op', sip: 'SIP007', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-007/sip-007-stacking-consensus.md#prestxop'} ,
  {opcode: '23', opchar: '#', name:'delegate-stx', sip: 'SIP015', url: 'https://github.com/stacksgov/sips/blob/07abb6ff67f5d46667aa32d2f67cb268ceb280fd/sips/sip-015/sip-015-network-upgrade.md#new-burnchain-transaction-delegate-stx'} ,
  {opcode: '5e', opchar: '^', name:'miner-signature-validation', sip: 'SIP21', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-021/sip-021-nakamoto.md#new-block-validation-rules'} ,
  {opcode: '78', opchar: 'x', name:'stack-stx', sip: 'SIP21', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-021/sip-021-nakamoto.md#new-block-validation-rules'} ,
  {opcode: '2b', opchar: '+', name:'delegate-stack-stx', sip: 'SIP21', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-021/sip-021-nakamoto.md#new-block-validation-rules'} ,
  {opcode: '2a', opchar: '*', name:'stack-aggregation-commit', sip: 'SIP21', url: 'https://github.com/stacksgov/sips/blob/feat/sip-021-nakamoto/sips/sip-021/sip-021-nakamoto.md#new-block-validation-rules'} ,
];

export async function aggregateMiningData():Promise<any> {
  let backStopBlock = await getEpochStartHeight('Epoch25')
  const result1Query = {
    name: 'Stacks over Bitcoin Transactions',
    description: 'Data starting at Epoch25 (block ' + backStopBlock + ') that aggregates type and count of stacks bitcoin transactions.',
    query:'[{$match: {"txId": {$exists: true}}}, { $group: {_id:{"name":"$name"}, "total": {$sum:1} } } ]'
  }
  const result1 = await pox4BitcoinStacksTxCollection.aggregate([{$match: {"txId": {$exists: true}}}, { $group: {_id:{"name":"$name"}, "total": {$sum:1} } } ]).toArray();
  return {result1, result1Query};
}

export async function syncLayer2TransactionsChangeAddresses():Promise<any> {
  const limit = 50;
  let page = 0
  let txs = await findPox4BitcoinStacksTx(page, limit)
  //console.log('syncLayer2TransactionsChangeAddresses: ', txs)
  do {
    for (let tx of txs) {
      for (let output of tx.outputs) {
        if (output.address) {
          const idx = tx.inputs.findIndex((o) => o.address === output.address)
          if (idx > -1) {
            //console.log('syncLayer2TransactionsChangeAddresses: offset: ' + output.address + ' idx: ' + idx)
            output.change = true
            await updatePoxEntryInfo(tx, {output: { change: true } } )
          }
        }
      }
    }
    page++
    txs = await findPox4BitcoinStacksTx(page, limit)
    console.log('syncLayer2TransactionsChangeAddresses: fixing page: ' + page)
  } while (txs && txs.length > 0)
  console.log('syncLayer2TransactionsChangeAddresses: finished fixing change addresses')
}

export async function syncLayer2Transactions():Promise<any> {
  let backStopBlock = await getEpochStartHeight('Epoch25')
  console.log('syncLayer2Transactions: Epoch25: backStopBlock: ' + backStopBlock);
  const last = await findLastPoxEntryByHeight()
  if (last && last.length === 1 && last[0].blockHeight > 0) {
    backStopBlock = last[0].blockHeight
    console.log('syncLayer2Transactions: backStopBlock: ' + backStopBlock);
  }
  //backStopBlock = 2585920
  let currentlyProcessingHeight = 0;
  let offset = 0;
  let limit = 30;
  let burnBlocks: {results: Array<BurnBlock>, total: number, limit:number, offset:number};
  do {
    burnBlocks = await getBurnBlocks(offset, limit)
    let counter = 0;
    for (let burnBlock of burnBlocks.results) {
      let hash = burnBlock.burn_block_hash.split('0x')[1]
      if (burnBlock.burn_block_height < backStopBlock) return
      //console.log('syncLayer2Transactions: burnBlock: ' + burnBlock.burn_block_height + ' \t\t' + hash);
      let j = currentlyProcessingHeight - burnBlock.burn_block_height
      if (counter > 0) {
        let bitcoinRPCBlock = await getBlock(hash, 1)
        for (let i = 1; i < j; i++) {
          bitcoinRPCBlock = await getBlock(bitcoinRPCBlock.nextblockhash, 1)
          console.log('syncLayer2Transactions: bitcoinRPCBlock: ' + bitcoinRPCBlock.height + ' \t\t' + bitcoinRPCBlock.hash);
          await processBurnBlock(bitcoinRPCBlock.hash, bitcoinRPCBlock.height, true)
        }
      }
      currentlyProcessingHeight = burnBlock.burn_block_height;
      console.log('syncLayer2Transactions: processBurnBlock: ' + burnBlock.burn_block_height);
      await processBurnBlock(hash, burnBlock.burn_block_height, false)
      counter++;
    }
    offset += limit
  } while (backStopBlock <= currentlyProcessingHeight)
}

async function processBurnBlock(hash:string, burn_block_height:number, apiMissingBlock:boolean):Promise<any> {
  const bBlock = await getBlock(hash, 3)
  
  for (let tx of bBlock.tx) {
    processTx(tx, hash, burn_block_height, apiMissingBlock)
  }
}

async function processTx(tx:any, burn_block_hash:string, burn_block_height:number, apiMissingBlock:boolean) {
  const magic1 = (getConfig().network === 'testnet') ? MAGIC_BYTES_TESTNET : MAGIC_BYTES_MAINNET
  const magic2 = (getConfig().network === 'testnet') ? MAGIC_BYTES_TESTNET_NAK : MAGIC_BYTES_MAINNET_NAK
  let inputs:Array<L1Input> = []
  let outputs:Array<L1Output> = []
  let payload;
  let name;
  for (let output of tx.vout) {
    let change = false;
    if (output.scriptPubKey.asm.indexOf('OP_RETURN') > -1 || output.scriptPubKey.type === 'nulldata') {
      const data = (output.scriptPubKey.asm.split(' ')[1])
      try {
        if (data && (data.startsWith(magic1) || data.startsWith(magic1.toUpperCase()) || data.startsWith(magic2)  || data.startsWith(magic2.toUpperCase()))) {
          payload = parseRawPayload(data);
          console.log('processBurnBlock: data: ' + payload.opcode);
        }
      } catch(err:any) {
        console.error('processTx: ' + err.message + ' processing: ' + data)
      }
      try {
        change = tx.vin.find((input) => input?.prevout?.scriptPubKey?.address === output.scriptPubKey.address)
      } catch(err:any) {}
    }
    // keep all the outputs
    outputs.push({
      amountSats: bitcoinToSats(output.value),
      address: output.scriptPubKey.address,
      type: output.scriptPubKey.type,
      change
    })
  }
  if (payload) {
    for (let input of tx.vin) {
      inputs.push({
        txId: input.txid,
        vout: input.vout,
        amountSats: bitcoinToSats(input.prevout?.value || 0),
        address: input.prevout.scriptPubKey.address,
      })
    }
    const idx = OPCODES.findIndex((o) => o.opcode === payload.opcode)
    name = (idx >= 0) ? OPCODES[idx].name : 'Huh: ' + payload.opcode
    const layer1StacksTx:Layer1StacksTx = {
      name,
      blockHash: burn_block_hash,
      blockHeight: burn_block_height,
      txId: tx.txid,
      outputs,
      inputs,
      payload,
      apiMissingBlock
    }
    // found a stacks tx !
    const dbTx = await saveOrUpdateEntry(layer1StacksTx)
    //console.log('processBurnBlock: ', util.inspect(dbTx, false, null, true /* enable colors */));
  }
}

async function getEpochStartHeight(epochId:string):Promise<number> {
  const poxInfo = await getPoxInfo()
  const epoch = poxInfo.epochs.find((o) => o.epoch_id === epochId)
  return epoch.start_height
}

async function getBurnBlocks(offset:number, limit:number):Promise<{results: [], total: number, limit:number, offset:number}> {
  const url = getConfig().stacksApi + '/extended/v2/burn-blocks?offset=' + offset + '&limit=' + limit;
  //console.log('getProposalData: url: ' + url)
  const response = await fetch(url)
  const val = await response.json();
  return val;
}

async function getBurnBlock(height:number):Promise<any> {
  const url = getConfig().stacksApi + '/extended/v2/burn-blocks/' + height;
  //console.log('getProposalData: url: ' + url)
  const response = await fetch(url)
  const val = await response.json();
  return val;
}

export async function findPox4BitcoinStacksTx(page:number, limit:number):Promise<any> {
  const result = await pox4BitcoinStacksTxCollection.find({}).skip(page * limit).limit( limit ).toArray();
  return result;
}

export async function saveOrUpdateEntry(poxEntry:Layer1StacksTx) {
  try {
    console.log('saveOrUpdatePoxEntry: saving: ' + poxEntry.name + ' / ' + poxEntry.txId)
    await savePoxEntryInfo(poxEntry)
  } catch (err:any) {
    console.log('saveOrUpdateVote: unable to save or update: ' + poxEntry.name + ' / ' + poxEntry.txId)
  }
}

async function savePoxEntryInfo(vote:any) {
  const result = await pox4BitcoinStacksTxCollection.insertOne(vote);
  return result;
}

async function updatePoxEntryInfo(vote:any, changes: any) {
  //console.log('updatePoxEntryInfo: ' + vote.txId + ' changes: ', changes)
  const result = await pox4BitcoinStacksTxCollection.updateOne({
      _id: vote._id
    },
    { $set: changes});
  return result;
}

async function findLastPoxEntryByHeight():Promise<any> {
  const result = await pox4BitcoinStacksTxCollection.find().sort({blockHeight: -1}).limit(1).toArray();
  return result;
}
