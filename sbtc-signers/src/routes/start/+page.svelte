<script lang="ts">
import { goto } from "$app/navigation";
import { sbtcConfig } from '$stores/stores';
import type { SbtcConfig } from '$types/sbtc_config'
import { Tooltip } from 'flowbite-svelte';
import { fmtNumber } from '$lib/utils';
import { Icon, InformationCircle } from "svelte-hero-icons"

const start = (pegin:boolean) => {
const conf:SbtcConfig = $sbtcConfig;
conf.pegIn = pegin;
sbtcConfig.set(conf);
//(pegin) ? goto('/deposit') : goto('/withdraw');
}
</script>

<Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-bitcoin-bh">
  Current bitcoin block height.
</Tooltip>
<Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-stacks-bh">
  Current stacks block height.
</Tooltip>

<div class="mx-auto flex flex-col justify-center w-full sm:max-w-4xl py-6 px-6 lg:px-8">
  <div class="sm:grid sm:grid-cols-2 sm:gap-10 space-y-10 sm:space-y-0">
    <div>
      <div role="button" tabindex="0" class="w-full bg-primary-03 cursor-pointer p-10 md:p-20 rounded-2xl relative" on:keydown on:click={() => start(true)}>
        <div class="w-full flex justify-between align-baseline items-baseline">
          <div id="po-bitcoin-bh" class="absolute left-5 top-5 text-black inline-block">
            {fmtNumber($sbtcConfig.bcInfo?.stacksInfo?.burn_block_height, 0)}
            <Icon src="{InformationCircle}" class="text-black w-6 h-6 inline-block" mini aria-hidden="true" />
          </div>
          <div id="po-stacks-bh" class="absolute right-5 top-5 text-black inline-block">
            {fmtNumber($sbtcConfig.bcInfo?.stacksInfo?.stacks_tip_height, 0)}
            <Icon src="{InformationCircle}" class="text-black w-6 h-6 inline-block" mini aria-hidden="true" />
          </div>
        </div>
        <div class="text-start">
          <h2 class="text-2xl lg:text-3xl font-semibold text-black">Stacking Stats</h2>
          <h3 class="text-xl md:text-2xl text-gray-1000 font-medium">Liquid Supply: {fmtNumber($sbtcConfig.bcInfo?.poxInfo.totalLiquidSupplyUstx, 6)}</h3>
          <h3 class="text-xl md:text-2xl text-gray-1000 font-medium">Liquid Supply: {$sbtcConfig.bcInfo?.poxInfo.totalLiquidSupplyUstx}</h3>
          <h3 class="text-xl md:text-2xl text-gray-1000 font-medium">Cycle: {$sbtcConfig.bcInfo?.poxInfo.rewardCycleId}</h3>
        </div>
      </div>
    </div>
  </div>
</div>
