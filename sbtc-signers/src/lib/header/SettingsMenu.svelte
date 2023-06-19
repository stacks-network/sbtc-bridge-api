<script lang="ts">
	import { onMount } from 'svelte';
	import SettingsMenuContent from "./SettingsMenuContent.svelte";

	export let menuTarget:{ offsetTop: number; offsetLeft: number } | undefined;
	let inited = false;
	let style:string;

	onMount(async () => {
		if (menuTarget && menuTarget.offsetLeft) {
			//style = "position: absolute; top: " + 120 + "; right: " + 120;
			style = "transform: translate3d(" + (menuTarget.offsetLeft - 380) + "px, " + (40 + menuTarget.offsetTop) + "px, 0px); position: absolute; inset: 0px auto auto 0px; margin: 0px; ";
		} else {
			style = "transform: translate3d(" + 623.636 + "px, " + 102.2727 + "px, 0px); position: absolute; inset: 0px auto auto 0px; margin: 0px; ";
		}
		inited = true;
	})
</script>

{#if inited}
<div role="tooltip" tabindex="-1" id="account" 
	class="w-1/2 z-10 bg-black-01 p-4 rounded-md border-warning-500 dark:border-gray-100" 
	data-popper-placement="bottom" 
	{style}>
	<SettingsMenuContent />
</div>
{/if}

<style>
	
</style>
