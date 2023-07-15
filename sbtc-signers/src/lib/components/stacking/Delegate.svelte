<script lang="ts">
import { CONFIG } from '$lib/config';
import { allowDelegate, revokeDelegate } from "$lib/sbtc_admin";
import { getAllowanceContractCallers } from '$lib/signers_api'
import Button from "../shared/Button.svelte";
import { onMount } from 'svelte';
import { sbtcConfig } from '$stores/stores'
import RegisterToSign from './RegisterToSign.svelte';

let untilBlock = 0;
let bbHeight = $sbtcConfig.bcInfo?.stacksInfo?.burn_block_height || 0;
let error:string|undefined;
let stxAddress:string|undefined;
let delegationInfo:any;
let inited = false;

const revoke = async () => {
  if (!stxAddress) {
    error = 'Please enter the amount, stacks address and bitcoin transaction';
    return;
  }
  error = undefined;
  await revokeDelegate(resultOfDelegate);
}
const canRegister = () => {
  if (delegationInfo) {
    return delegationInfo.untilBlockHeight > bbHeight
  }
  return false;
}
const allow = async () => {
  if (!stxAddress) {
    error = 'Please enter the amount, stacks address and bitcoin transaction';
    return;
  }
  error = undefined;
  await allowDelegate(resultOfDelegate, untilBlock);
}
const resultOfDelegate = async (data:any) => {
  console.log(data)
}
onMount(async () => {
		try {
      stxAddress = $sbtcConfig.addressObject.stxAddress
      untilBlock = bbHeight + 10000
			delegationInfo = await getAllowanceContractCallers($sbtcConfig.addressObject.stxAddress);
      if (delegationInfo.untilBlockHeight === 0) delegationInfo = undefined;
      inited = true;
		} catch (err) {
			console.log(err)
		}
	})

</script>

{#if inited}

{#if canRegister() }
<div>
  <div class="pb-5">
    {CONFIG.VITE_SBTC_DEPLOYER + '.' + CONFIG.VITE_SBTC_CONTRACTS.pool}
  </div>
  <div class="pb-5">
    Stacking Contract has permission until {delegationInfo.untilBlockHeight}, 
    another { delegationInfo.untilBlockHeight - bbHeight} blocks.
    <a href="/" on:click|preventDefault={() => revoke()}>Revoke permission</a>.
  </div>
  <RegisterToSign {delegationInfo}/>
</div>
{:else}
<div class="flex flex-col gap-y-5">
  {#if delegationInfo}
  <div class="pb-5">
    Permission expired { bbHeight - delegationInfo.untilBlockHeight} blocks ago
  </div>
  {/if}
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
        <Button darkScheme={false} label={'Delegate'} target={''} on:clicked={() => allow()}/>
      </div>
</div>
{/if}
{/if}
