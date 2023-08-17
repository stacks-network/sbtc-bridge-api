<script lang="ts">
  import { onMount } from 'svelte';
  import { sbtcConfig } from '$stores/stores'

  let deposits:any;
  let withdrawals:any;
  let inited = false;

  onMount(async () => {
    deposits = $sbtcConfig.dashboard.sumRequests.find((o) => o._id === '3C')
    if (!deposits) deposits = $sbtcConfig.dashboard.sumRequests[0]
    withdrawals = $sbtcConfig.dashboard.sumRequests.find((o) => o._id === '3E')
    if (!withdrawals) withdrawals = $sbtcConfig.dashboard.sumRequests[1]
    inited = true;
  })
  </script>
  
  {#if inited}
  <div class="mt-10 mb-5">
    <div class="flex justify-end">
      <div>
        <span class="text-warning-500 mr-10">Last 7 days</span>
        <span class="text-white mr-10">Last 30 days</span>
        <span class="text-white mr-2">All-time</span>
      </div>
    </div>
  </div>
  <div class="flex w-full border border-gray-700 rounded-lg items-center text-gray-400 bg-gray-1000">
    <div class="flex w-1/4 ps-3 align-baseline items-center border-r  border-gray-900">
      <div class="flex grow align-baseline items-center ps-1">
          <div class="flex flex-col py-3">
            <div class="ps-2 text-sm pb-2">Current cycle</div>
            <div class="ps-2 text-lg"><span class="text-white">{$sbtcConfig.bcInfo?.poxInfo.rewardCycleId}</span> blocks</div>
        </div>
      </div>
    </div>
    <div class="flex w-1/4 ps-3 align-baseline items-center border-r border-gray-900">
      <div class="flex grow align-baseline items-center ps-1">
          <div class="flex flex-col py-3">
            <div class="ps-2 text-sm pb-2">Deposits</div>
            <div class="ps-2 text-lg"><span class="text-white">{deposits.count}</span></div>
        </div>
      </div>
    </div>
    <div class="flex w-1/4 ps-3 align-baseline items-center border-r border-gray-900">
      <div class="flex grow align-baseline items-center ps-1">
          <div class="flex flex-col py-3">
            <div class="ps-2 text-sm pb-2">Withdrawals</div>
            <div class="ps-2 text-lg"><span class="text-white">{withdrawals.count}</span></div>
        </div>
      </div>
    </div>
    <div class="flex w-1/4 ps-3 align-baseline items-center">
      <div class="flex grow align-baseline items-center ps-1">
          <div class="flex flex-col py-3">
            <div class="ps-2 text-sm pb-2">sBTC Balance (sats)</div>
            <div class="ps-2 text-lg"><span class="text-white">{deposits.total - withdrawals.total}</span></div>
        </div>
      </div>
    </div>
  </div>
  {/if}

