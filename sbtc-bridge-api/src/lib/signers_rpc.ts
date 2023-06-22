import { deserializeCV, cvToJSON } from "micro-stacks/clarity";
import fetch from 'node-fetch';
//import { callContractReadOnly } from './sbtc_rpc.js'
import type { BlockchainInfo, PoxInfo, StacksInfo } from 'sbtc-bridge-lib';
import { fetchMainnetTipHeight } from './bitcoin/mempool_api.js'

export async function fetchPoxInfo():Promise<BlockchainInfo> {
  const contractId = 'SP000000000000000000002Q6VF78.pox-3' //getConfig().poxContractId;
  const data = {
    contractAddress: contractId!.split('.')[0],
    contractName: contractId!.split('.')[1],
    functionName: 'get-pox-info',
    functionArgs: [],
    network: 'mainnet' // getConfig().network
  }
  const response = await callContractReadOnly(data);
  const poxInfo:PoxInfo = {
    currentRejectionVotes: getValOrZero(response, 'current-rejection-votes'),
    firstBurnchainBlockHeight: getValOrZero(response, 'first-burnchain-block-height'),
    minAmountUstx: getValOrZero(response, 'min-amount-ustx'),
    prepareCycleLength: getValOrZero(response, 'prepare-cycle-length'),
    rejectionFraction: getValOrZero(response, 'rejection-fraction'),
    rewardCycleId: getValOrZero(response, 'reward-cycle-id'),
    rewardCycleLength: getValOrZero(response, 'reward-cycle-length'),
    totalLiquidSupplyUstx: getValOrZero(response, 'total-liquid-supply-ustx')
  }
  //const bcInfo = await getBlockChainInfo()
  const mainnetTipHeight = Number(await fetchMainnetTipHeight())
  const stacksInfo:StacksInfo = await fetchStacksInfo()
  const bcInfo:BlockchainInfo = {
    mainnetTipHeight,
    poxInfo,
    stacksInfo
  }
  console.log('bcInfo: ', bcInfo)
  return bcInfo;
}

export async function fetchStacksInfo():Promise<StacksInfo> {
  const url = 'https://api.hiro.so/v2/info'
  const response = await fetch(url);
  const stacksInfo = await response.json();
  return stacksInfo;
}

export async function callContractReadOnly(data:any) {
  const url = 'https://api.hiro.so' + '/v2/contracts/call-read/' + data.contractAddress + '/' + data.contractName + '/' + data.functionName
  let val;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arguments: data.functionArgs,
        sender: data.contractAddress,
      })
    });
    val = await response.json();
  } catch (err) {
    console.log('callContractReadOnly4: ', err);
  }
  const result = cvToJSON(deserializeCV(val.result));
  return result;
}

function getValOrZero(resp:any, field:string) {
  try {
    return Number(resp.value.value[field].value)
  } catch (err) {
    return 0;
  }
}
