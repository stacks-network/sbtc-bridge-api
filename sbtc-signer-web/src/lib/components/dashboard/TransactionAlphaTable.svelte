<script lang="ts">
import { onMount } from 'svelte';
import { CONFIG } from '$lib/config';
import { sbtcConfig } from '$stores/stores';
import { fetchAlphaEvents, fetchAllAlphaEvents } from '$lib/events_api'
	import TransactionAlphaTableBody from './TransactionAlphaTableBody.svelte';
	import type { SbtcAlphaEvent } from 'sbtc-bridge-lib';
    
  let inited = false;
  let errorReason:string|undefined;
  let filter = 'All';
  let results:Array<SbtcAlphaEvent>;

  const classForFlter = (myFilter:string) => {
    return (myFilter === filter) ? 'text-warning-500' : 'text-white'
  }
  
  const fetchEvents = async (newFilter:string) => {
    filter = newFilter;
    results = await fetchAlphaEvents(0, filter.toLowerCase());
    //peginRequests.sort(compare)
}

  onMount(async () => {
    try {
      results = await fetchAllAlphaEvents();
      //results = await fetchAllAlphaEvents(0, filter.toLowerCase());
      inited = true;
    } catch (err:any) {
        errorReason = err.message;
    }
  })

  </script>
  
  {#if inited}
  <div class="p-5 w-full border border-gray-700 rounded-lg items-center text-gray-400 bg-gray-1000">
    <div>
      <div class="flex justify-between align-baseline items-baseline">
        <div><h1 class="text-3xl">Transactions</h1></div>
        <div class="">
          <span class={classForFlter('all')} on:keydown on:click={() => fetchEvents('all')}>All</span>
          <span class={classForFlter('deposit')} on:keydown on:click={() => fetchEvents('deposit')}>Deposit</span>
          <span class={classForFlter('withdrawal')} on:keydown on:click={() => fetchEvents('withdrawal')}>Withdrawal</span>
          <span class={classForFlter('handoff')} on:keydown on:click={() => fetchEvents('handoff')}>Handoff</span>
        </div>
      </div>
    </div>
    <div><TransactionAlphaTableBody {results} /></div>
  </div>
  {/if}
  {#if errorReason}
  <div class="p-5 flex w-full border border-gray-700 rounded-lg items-center text-gray-400 bg-gray-1000">
    <div><h1 class="text-2xl">{errorReason}</h1></div>
  </div>
{/if}
