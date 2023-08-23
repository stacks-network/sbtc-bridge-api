<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
  import { Tooltip } from 'flowbite-svelte';
  import NextPegWalletProposal from "$lib/components/voting/NextPegWalletProposal.svelte";
	import { COMMS_ERROR } from '$lib/utils';
	import { getAllowanceContractCallers, getDelegationInfo } from '$lib/signers_api';
	import { sbtcConfig } from '$stores/stores'
	import { CONFIG } from '$lib/config';

  let inited = false;
	let errorReason:string|undefined;
  let allowance:any;
  let delegation:any;

  onMount(async () => {
		try {
			allowance = await getAllowanceContractCallers($sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress);
			delegation = await getDelegationInfo($sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress);
			
		} catch (err) {
			errorReason = COMMS_ERROR
			console.log(err)
		}
		inited = true;
	})
</script>
    
    <Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-stacks-bh">
      Current bitcoin and stacks block heights respectively.
    </Tooltip>
    <Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-cycle">
      Current pox cycle - click for more infomation.
    </Tooltip>
    
    <div class="flex flex-col gap-y-5">
      <div><NextPegWalletProposal /></div>
    </div>
