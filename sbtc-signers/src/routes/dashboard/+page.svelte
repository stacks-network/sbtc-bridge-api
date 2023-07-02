<script lang="ts">
    import { goto } from "$app/navigation";
    import { sbtcConfig } from '$stores/stores';
    import type { SbtcConfig } from '$types/sbtc_config'
    import { Tooltip } from 'flowbite-svelte';
    import { fmtNumber } from '$lib/utils';
    import { Icon, InformationCircle } from "svelte-hero-icons"
    import { a_primary } from '$lib/css_utils';
    import JSONTree from 'svelte-json-tree'

    const start = (pegin:boolean) => {
    const conf:SbtcConfig = $sbtcConfig;
    sbtcConfig.set(conf);
    //(pegin) ? goto('/deposit') : goto('/withdraw');
    }
    </script>
    
    <Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-stacks-bh">
      Current bitcoin and stacks block heights respectively.
    </Tooltip>
    <Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-cycle">
      Current pox cycle - click for more infomation.
    </Tooltip>
    
    <div class="mx-auto flex flex-col justify-start w-full sm:max-w-4xl py-6 px-6 lg:px-8">
      <div class="sm:grid sm:grid-cols-1 sm:gap-2 space-y-2 sm:space-y-0">
        <div>
          <div role="button" tabindex="0" class="w-full bg-primary-03 cursor-pointer p-10 md:p-10 rounded-2xl relative" on:keydown on:click={() => start(true)}>
            <div class="pb-10 w-full flex justify-between align-baseline items-baseline">
              <div id="po-cycle" class=" text-black inline-block">
                <a class={a_primary} href={'/cycles/' + $sbtcConfig.bcInfo?.poxInfo.rewardCycleId} >Cycle {$sbtcConfig.bcInfo?.poxInfo.rewardCycleId}</a>
              </div>
              <div class="flex gap-x-2 justify-between align-baseline items-baseline">
                <div id="po-bitcoin-bh" class=" text-black inline-block">
                  {fmtNumber($sbtcConfig.bcInfo?.stacksInfo?.burn_block_height, 0)}
                </div>
                <div class=" text-black inline-block">
                  /
                </div>
                <div class=" text-black inline-block">
                  {fmtNumber($sbtcConfig.bcInfo?.stacksInfo?.stacks_tip_height, 0)}
                </div>
                <div id="po-stacks-bh" class=" text-black inline-block">
                  <Icon src="{InformationCircle}" class="text-black w-6 h-6 inline-block" mini aria-hidden="true" />
                </div>
              </div>
            </div>
            <div class="text-start">
              <h2 class="mb-5 text-2xl lg:text-2xl font-semibold text-black">General Info</h2>
              <p class="text-black">Version: {$sbtcConfig.bcInfo?.stacksInfo.server_version}</p>
              <p class="text-black">Liquid Supply: {fmtNumber($sbtcConfig.bcInfo?.poxInfo.totalLiquidSupplyUstx, 6)}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white border rounded-lg p-5 text-2xl my-10" style="--json-tree-string-color: blue; --json-tree-font-size: 18px;">
        <JSONTree value={$sbtcConfig.bcInfo}/>
      </div>
    </div>
