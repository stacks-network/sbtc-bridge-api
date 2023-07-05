<script lang="ts">
import { delegate } from "$lib/sbtc_admin";
import { getDelegationInfo } from '$lib/signers_api'
import Button from "../shared/Button.svelte";
import { onMount } from 'svelte';
import { sbtcConfig } from '$stores/stores'
import JSONTree from 'svelte-json-tree'

let untilBlock = 0;
let error:string|undefined;
let stxAddress:string|undefined;
let delegationInfo:any;
let inited = false;

const allowDelegate = async () => {
  if (!stxAddress) {
    error = 'Please enter the amount, stacks address and bitcoin transaction';
    return;
  }
  error = undefined;
  await delegate(resultOfDelegate, untilBlock);
}
const resultOfDelegate = async (data:any) => {
  console.log(data)
}
onMount(async () => {
		try {
      stxAddress = $sbtcConfig.addressObject.stxAddress
      untilBlock = ($sbtcConfig.bcInfo?.stacksInfo?.burn_block_height || 0) + 400
			delegationInfo = await getDelegationInfo($sbtcConfig.addressObject.stxAddress);
      inited = true;
		} catch (err) {
			console.log(err)
		}
	})

</script>

{#if delegationInfo}
<JSONTree value={delegationInfo}/>
{:else}
<div class="flex flex-col gap-y-5">
      <p>Allow the sBTC Stacking Pool to stacks on your behalf</p>
      <div class="flex flex-col gap-y-1">
        <label for="transact-path">Your Address</label>
        <input readonly type="text" id="stxAddress" class="text-black tracking-wide font-extralight rounded-md p-3 h-12 w-full" bind:value={stxAddress}/>
      </div>
      <div class="flex flex-col gap-y-1">
        <label for="transact-path">Until block</label>
        <input type="number" id="untilBlock" class="text-black tracking-wide font-extralight rounded-md p-3 h-12 w-full" bind:value={untilBlock}/>
      </div>
      <div class="py-0">
        <Button darkScheme={false} label={'Delegate'} target={''} on:clicked={() => allowDelegate()}/>
      </div>
</div>
{/if}
