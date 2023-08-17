<script lang="ts">
import { CONFIG } from '$lib/config';
import { registerToSignTest, registerToSign } from "$lib/sbtc_admin";
import { getAllowanceContractCallers } from '$lib/signers_api'
import Button from "../shared/Button.svelte";
import { onMount } from 'svelte';
import { sbtcConfig } from '$stores/stores'

export let delegationInfo:any;
let untilBlock = 0;
let error:string|undefined;
let amount = 200;
let inited = false;

const registerTest = async () => {
  if (!amount) {
    error = 'Please enter amount';
    return;
  }
  error = undefined;
  await registerToSignTest(resultOf);
}
const register = async () => {
  if (!amount) {
    error = 'Please enter amount';
    return;
  }
  error = undefined;
  const cardinalAddress = $sbtcConfig.keySets[CONFIG.VITE_NETWORK].btcPubkeySegwit0
  await registerToSign(cardinalAddress!, amount, resultOf);
}
const resultOf = async (data:any) => {
  console.log(data)
}
onMount(async () => {
		try {
      untilBlock = ($sbtcConfig.bcInfo?.stacksInfo?.burn_block_height || 0) + 400
			delegationInfo = await getAllowanceContractCallers($sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress);
      if (delegationInfo.untilBlockHeight === 0) delegationInfo = undefined;
      inited = true;
		} catch (err) {
			console.log(err)
		}
	})

</script>

{#if delegationInfo}
<div class="flex flex-col gap-y-5">
      <p>Register to sign transactions to maintain the sBTC protocol</p>
      <div class="flex flex-col gap-y-1">
        <label for="transact-path">Amount to Stack</label>
        <input type="number" id="amount" class="text-black tracking-wide font-extralight rounded-md p-3 h-12 w-full" bind:value={amount}/>
      </div>
      <div class="py-0">
        <Button darkScheme={false} label={'Continue'} target={''} on:clicked={() => register()}/>
      </div>
</div>
{/if}
