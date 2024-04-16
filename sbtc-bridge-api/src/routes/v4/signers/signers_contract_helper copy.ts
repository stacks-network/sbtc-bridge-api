import { serializeCV, uintCV } from "@stacks/transactions";
import { getConfig } from "../../../lib/config.js";
import { callContractReadOnly } from "../../stacks/stacks_helper.js";
import { hex } from '@scure/base';
import { StackerDbConfig } from "../../../types/signer_types.js";
import { getPoxInfo } from "../pox-contract/pox_contract_helper.js";

export async function getSigners(cycle:number):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(cycle)))}`];
  const data = {
    contractAddress: getConfig().signersContractId.split('.')[0],
    contractName: getConfig().signersContractId.split('.')[1],
    functionName: 'get-signers',
    functionArgs,
  }
  try {
    const signers = []
    const result = await callContractReadOnly(data);
    if (result.value?.value?.length > 0) {
      for (const el of result.value.value) {
        signers.push({
          signer: el.signer.value,
          weight: el.weight.value
        })
      }
    }
    return signers;
  } catch (e) {
    return []
  }
}

export async function getSignersRecent():Promise<any> {
  const poxInfo = await getPoxInfo()
  const currentCycle = poxInfo.current_cycle.id;
  return {
    current: {
      cycle: currentCycle,
      signers: await getSigners(currentCycle)
    },
    previous: {
      cycle: currentCycle - 1,
      signers: await getSigners(currentCycle - 1)
    }
  }
}

export async function stackerdbGetConfig():Promise<StackerDbConfig> {
  const functionArgs = [];
  const data = {
    contractAddress: getConfig().signersContractId.split('.')[0],
    contractName: getConfig().signersContractId.split('.')[1],
    functionName: 'stackerdb-get-config',
    functionArgs,
  }
  try {
    const result = await callContractReadOnly(data);
    const config:StackerDbConfig = {
      chunkSize: result.value.value['chunk-size'].value,
      hintReplicas: result.value.value['hint-replicas'].value,
      maxNeighbors: result.value.value['max-neighbors'].value,
      maxWrites: result.value.value['max-writes'].value,
      writeFreq: result.value.value['write-freq'].value,
    }
    return config;
  } catch (e) { 
  }
  return {} as StackerDbConfig;
}

export async function stackerdbGetSignerSlotsPage(page:number):Promise<Array<any>> {
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(page)))}`];
  const data = {
    contractAddress: getConfig().signersContractId.split('.')[0],
    contractName: getConfig().signersContractId.split('.')[1],
    functionName: 'stackerdb-get-signer-slots-page',
    functionArgs,
  }
  try {
    const signers = []
    const result = await callContractReadOnly(data);
    if (result.value?.value?.length > 0) {
      for (const el of result.value.value) {
        signers.push({
          signer: el.signer.value,
          numSlots: el['num-slots'].value
        })
      }
    }
    return signers;
  } catch (e) {
    return [];
  }
}
