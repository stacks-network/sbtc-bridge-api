<script lang="ts">
import { CONFIG } from '$lib/config';
import { isCoordinator } from '$lib/sbtc_admin.js'
import Item from './Item.svelte';
import NavButton from './NavButton.svelte';
import { addresses } from '$lib/stacks_connect'
import SettingsMenuContent from "./SettingsMenuContent.svelte";

const coordinator = isCoordinator(addresses().stxAddress)
export let hidden:boolean;
export let showMenu:boolean;

</script>
{#if hidden && showMenu}
<div class="w-1/2 z-10 bg-black-01 p-4 border rounded-md bg-white-100 absolute top-20 right-16">
	<div class="pb-5 border-b">
		<Item label={'sBTC Bridge'} target={CONFIG.VITE_URI_BRIDGE}/>
		<Item label={'History'} target={'/transactions'}/>
		<Item label={'FAQ'} target={'/faq'}/>
		{#if coordinator}<Item label={'Admin'} target={'/admin'}/>{/if}
	</div>
	<div class="py-5">
		<SettingsMenuContent />
	</div>
</div>
{:else if !hidden}
<div class="flex flex-row flex-grow order-1">
	<Item label={'sBTC Bridge'} target={CONFIG.VITE_URI_BRIDGE}/>
	<Item label={'History'} target={'/transactions'}/>
	<Item label={'FAQ'} target={'/faq'}/>
	{#if coordinator}<Item label={'Admin'} target={'/admin'}/>{/if}
</div>
{/if}
<style>
</style>
