<script lang="ts">
import { onMount } from 'svelte';
import { CONFIG } from '$lib/config';
import { explorerBtcAddressUrl, explorerBtcTxUrl, explorerTxUrl } from '$lib/utils';
import { sbtcConfig } from '$stores/stores';
import { fetchAlphaEvents } from '$lib/events_api'
import { satsToBitcoin, tsToDate, truncate, fmtNumber } from 'sbtc-bridge-lib'
import ArrowUpRight from '$lib/components/shared/ArrowUpRight.svelte';
import type { SbtcAlphaEvent, payloadType } from 'sbtc-bridge-lib';

import { goto } from '$app/navigation';

  export let results:Array<SbtcAlphaEvent>;
  let inited = false;
  let errorReason:string|undefined;
  let filter = 'All';

  const getType = (pegin:SbtcAlphaEvent) => {
    return (pegin.payloadData.payload?.opcode === '3E') ? 'Withdrawal' : 'Deposit'

  }

  const openEvent = async (pegin:SbtcAlphaEvent) => {
      goto('/dashboard/events/' + pegin.bitcoinTxid)
  }

  onMount(async () => {
    try {
      results = await fetchAlphaEvents(0, filter.toLowerCase());
        inited = true;
    } catch (err:any) {
        errorReason = err.message;
    }
  })

  </script>
  
        <div class="">
            <div class="w-full">
                <div class="table-auto">
                    <div class="w-full border-b my-10">
                      <div class="text-white text-sm grid grid-cols-4 lg:grid-cols-6 gap-2 flex-nowrap font-semibold justify-evenly content-start">
                        <div style="white-space: nowrap;">Amount</div>
                        <div class="hidden lg:flex">Type</div>
                        <div>Reveal</div>
                        <div class="hidden lg:flex">Sender</div>
                        <div class="hidden lg:flex">Block height</div>
                        <div class="text-end">Actions</div>
                      </div>
                    </div>
                    <div>
                    {#each results as pegin}
                    <div class="text-gray-800 text-sm w-full grid grid-cols-4 lg:grid-cols-6 gap-2 justify-evenly content-start">
                        <div class="flex"><div class="w-[60px]">{fmtNumber(pegin.payloadData.payload?.amountSats) || 0}</div> sats</div>
                        <div class="hidden lg:flex">{getType(pegin)}</div>
                        <div class="hidden lg:flex ">
                          <div class="sm:pe-2 md:pe-5"><a href={explorerBtcTxUrl(pegin.bitcoinTxid)} target="_blank" rel="noreferrer">Reveal tx</a></div>
                          <div class=""><ArrowUpRight class="h-4 w-4 text-white" target={explorerBtcAddressUrl(pegin.bitcoinTxid)} /></div>
                        </div>
                        <div class="flex">
                            <div class="sm:pe-2 md:pe-5 w-[100px]"><a class="" href={explorerTxUrl(pegin.txid)} target="_blank" rel="noreferrer">{truncate(pegin.payloadData.payload?.stacksAddress)}</a></div>
                            <div class=""><ArrowUpRight class="h-4 w-4 text-white" target={explorerTxUrl(pegin.txid)} /></div>
                        </div>
                        <div class="hidden lg:flex">{fmtNumber(pegin.payloadData.burnBlockHeight)}</div>
                        <div class="text-end"><a class="text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 hover:underline" href="/" on:click|preventDefault={() => openEvent(pegin)}>View</a></div>
                    </div>
                    {/each}
                    </div>
                </div>
                
            </div>
        </div>
