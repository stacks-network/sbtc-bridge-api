<script lang="ts">
	import '../app.postcss';
	import "../sbtc.css";
	import Header from "$lib/header/Header.svelte";
	import Footer from "$lib/header/Footer.svelte";
	import { setConfig } from '$lib/config';
	import { page } from "$app/stores";
	import { onMount, onDestroy } from 'svelte';
	import { sbtcConfig } from '$stores/stores'
	import type { SbtcContractDataI, KeySet } from 'sbtc-bridge-lib';
	import type { SbtcConfig } from '$types/sbtc_config'
	import { defaultSbtcConfig } from '$lib/sbtc';
	import { COMMS_ERROR } from '$lib/utils.js'
	import { initApplication, isLegal, loginStacksJs } from "$lib/stacks_connect";
	import Bootstrap from '$lib/components/settings/Bootstrap.svelte';
	import { beforeNavigate, goto } from '$app/navigation';

	const unsubscribe = sbtcConfig.subscribe((conf) => {});
	onDestroy(unsubscribe);
	let inited = false;
	let errorReason:string|undefined;

	let componentKey = 0;
	console.log('process.env: ', import.meta.env);
	setConfig('?net=devnet')   //($page.url.search);

	const initApp = async () => {
		await initApplication(($sbtcConfig) ? $sbtcConfig : defaultSbtcConfig as SbtcConfig, undefined);
	}

	if (!isLegal(location.href)) {
		//componentKey++;
		loginStacksJs(initApp, $sbtcConfig)
		goto('/' + '?net=devnet')
	}
	if (location.href.indexOf('devnet') === -1) {
		//componentKey++;
		goto('/' + '?net=devnet')
	}
	beforeNavigate((nav) => {
		if (!isLegal(nav.to?.route.id || '')) {
			nav.cancel();
			loginStacksJs(initApplication, $sbtcConfig);
			//componentKey++;
			return;
		}
		const next = (nav.to?.url.pathname || '') + (nav.to?.url.search || '');
		if (next.indexOf('devnet') === -1) {
			nav.cancel();
			goto(next + '?net=devnet', { invalidateAll: true, replaceState: false })
			//window.onbeforeunload = null;
		}
	})
	/**
	afterNavigate((nav) => {
		componentKey++;
	})
	*/

	onMount(async () => {
		try {
			await initApp();
			
		} catch (err) {
			errorReason = COMMS_ERROR
			console.log(err)
		}
		inited = true;
	})
</script>

{#if inited}
	<div class="bg-black bg-cover text-white font-extralight min-h-screen">
		<div>
			{#key componentKey}
			<Header on:init_application={initApp} />
			{/key}
		</div>
		{#if $sbtcConfig.sbtcContractData.protocolOwner?.value}<div><Bootstrap /> </div>{/if}
		<div class="flex min-h-[calc(100vh-160px)] mx-auto lg:px-8 align-middle justify-center flex-grow">
			<div class="mx-auto flex flex-col justify-start w-full sm:max-w-4xl py-6 px-6 lg:px-8">
				<div class="sm:grid sm:grid-cols-1 sm:gap-2 space-y-2 sm:space-y-0">
					<slot></slot>
				</div>
			</div>
		</div>
		<Footer />
	</div>
{/if}
