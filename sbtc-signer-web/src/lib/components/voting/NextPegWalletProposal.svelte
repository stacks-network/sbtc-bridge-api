<script lang="ts">
  import { onMount } from 'svelte';
  import { sbtcConfig } from '$stores/stores'
	import { truncate } from 'sbtc-bridge-lib';
	import VoteNow from './VoteNow.svelte';

  let deposits:any;
  let withdrawals:any;
  let inited = false;

  onMount(async () => {
    inited = true;
  })
  </script>
  
  {#if inited}
  <div class="flex w-full border border-gray-700 rounded-lg items-center text-gray-400 bg-gray-1000">
    <div class="flex w-1/2 ps-3 align-baseline items-center border-r  border-gray-900">
      <div class="flex grow align-baseline items-center ps-1">
          <div class="flex flex-col py-3">
            <div class="text-sm pb-2">Current peg wallet</div>
            <div class="text-lg"><span class="text-white">{truncate($sbtcConfig.sbtcContractData.currentPegWallet.address)}</span></div>
        </div>
      </div>
    </div>
    <div class="flex w-1/2 ps-3 align-baseline items-center border-r border-gray-900">
      <div class="flex grow align-baseline items-center ps-1">
          <div class="flex flex-col py-3">
            <div class="text-sm pb-2">Next peg wallet</div>
            <div class="text-lg"><span class="text-white">{truncate($sbtcConfig.sbtcContractData.nextPegWallet.address, 10)}</span></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flex w-full border border-gray-700 rounded-lg items-center text-gray-400 bg-gray-1000">
    <div class="text-white gap-y-5 my-5 flex w-full flex-col ps-3 align-baseline items-start border-r  border-gray-900">
      <p class="text-lg pb-2">If you're happy for this to be the next cycles wallet addres please vote now</p>
      <VoteNow />
    </div>
  </div>
  {/if}

