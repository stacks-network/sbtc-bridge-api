<script lang="ts">
    import { CONFIG } from "$lib/config";
    import { sbtcConfig } from '$stores/stores';
    import { Tooltip } from 'flowbite-svelte';
    import { fmtNumber } from '$lib/utils';
    import { Icon, InformationCircle } from "svelte-hero-icons"
    import type { BlockchainInfo } from 'sbtc-bridge-lib';
    import JSONTree from 'svelte-json-tree'
    import Headlines from "$lib/components/dashboard/Headlines.svelte";
    import TransactionAlphaTable from "$lib/components/dashboard/TransactionAlphaTable.svelte";

    const getNextCycleBurnchainBlock = () => {
      const bcInfo:BlockchainInfo = $sbtcConfig.bcInfo!;
      const firstBC = bcInfo?.poxInfo?.firstBurnchainBlockHeight || 0;
      const numbSinceFirst = (bcInfo?.mainnetTipHeight || 0) - firstBC;
      const cycleLength = bcInfo?.poxInfo.rewardCycleLength || 0;
      const prepareLength = bcInfo?.poxInfo.prepareCycleLength || 0;
      const cycle1 = numbSinceFirst / cycleLength
      const cycle2 = numbSinceFirst / (cycleLength + prepareLength)
      return prepareLength
    }

    </script>
    
    <Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-stacks-bh">
      Current bitcoin and stacks block heights respectively.
    </Tooltip>
    <Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-cycle">
      Current pox cycle - click for more infomation.
    </Tooltip>
    
    <div class="flex flex-col gap-y-5">
      <div><Headlines /></div>
      <div><TransactionAlphaTable /></div>
    </div>
    <!--

        <div>
          <div class="w-full bg-primary-03 p-10 md:p-10 rounded-2xl ">
            <div class="pb-10 w-full flex justify-between align-baseline items-baseline">
              <div class="flex flex-col">
                <div id="po-cycle" class=" text-black inline-block">
                  <span class="font-bold">PoX Cycle:</span> <a href={'/cycles/' + $sbtcConfig.bcInfo?.poxInfo.rewardCycleId} >{$sbtcConfig.bcInfo?.poxInfo.rewardCycleId}</a>
                </div>
                <div id="po-cycle" class=" text-black inline-block">
                  <span class="font-bold">sBTC Window:</span> <a href={'/cycles/' + $sbtcConfig.bcInfo?.sbtcWindow} >{$sbtcConfig.bcInfo?.sbtcWindow}</a>
                </div>
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
              <p class="text-black">Network: {CONFIG.VITE_NETWORK}</p>
              <p class="text-black">Version: {$sbtcConfig.bcInfo?.stacksInfo.server_version}</p>
              <p class="text-black">Liquid supply: {fmtNumber($sbtcConfig.bcInfo?.poxInfo.totalLiquidSupplyUstx, 6)}</p>
              <p class="text-black">Next cycle in: {getNextCycleBurnchainBlock()} blocks</p>
            </div>
          </div>
          <div class="bg-white border rounded-lg p-5 text-2xl my-10" style="--json-tree-string-color: blue; --json-tree-font-size: 18px;">
            <JSONTree value={$sbtcConfig.bcInfo}/>
          </div>
        </div>
    -->
