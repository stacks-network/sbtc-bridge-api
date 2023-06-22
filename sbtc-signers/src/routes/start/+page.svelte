<script lang="ts">
import { goto } from "$app/navigation";
import { sbtcConfig } from '$stores/stores';
import type { SbtcConfig } from '$types/sbtc_config'
import { smbp } from '$lib/utils'

const start = (pegin:boolean) => {
	const conf:SbtcConfig = $sbtcConfig;
	conf.pegIn = pegin;
	sbtcConfig.set(conf);
	(pegin) ? goto('/deposit') : goto('/withdraw');
}
$: innerWidth = 0
$: containerClass = (innerWidth < smbp) ? 'container' : 'container-down';

</script>
<div class="w-screen grid sm:grid-cols-1 md:grid-cols-1 gap-4 items-center justify-items-center ">
    <div class="p-5  text-black rounded-lg background-chev-up aspect-video w-4/5 h-5/5 cursor-pointer bg-gray-200" on:keydown on:click={() => start(true)}>
        <div class="p-5 flex items-baseline">
            <div class="text-3xl ">Reward Cycle: </div>
            <div class="text-3xl grow text-end">{$sbtcConfig.bcInfo?.cycle}</div>
        </div>
        <div class="p-5 flex items-baseline">
            <div class="text-1xl ">Bitcoin Heigh: </div>
            <div class="text-1xl grow text-end">{$sbtcConfig.bcInfo?.mainnetTipHeight}</div>
        </div>
    </div>
</div>
<svelte:window bind:innerWidth />

<style>
</style>
