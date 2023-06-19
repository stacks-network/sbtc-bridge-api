<script lang="ts">
	import '../app.postcss';
	import "../sbtc.css";
	import Header from "$lib/header/Header.svelte";
	import Footer from "$lib/header/Footer.svelte";
	import { fetchSbtcBalance, userSession, isLegal } from "$lib/stacks_connect";
	import { fetchSbtcData, fetchPoxInfo, fetchCurrentFeeRates, fetchKeys } from "$lib/bridge_api";
	import { setConfig } from '$lib/config';
	import { beforeNavigate, goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount, onDestroy } from 'svelte';
	import { sbtcConfig } from '$stores/stores'
	import type { SbtcContractDataI, KeySet } from 'sbtc-bridge-lib';
	import type { SbtcConfig } from '$types/sbtc_config'
	import { defaultSbtcConfig } from '$lib/sbtc';
	import { COMMS_ERROR } from '$lib/utils.js'
	import { loginStacksJs } from '$lib/stacks_connect'

    let componentKey = 0;

	console.log('process.env: ', import.meta.env);
	setConfig($page.url.search);
	const search = $page.url.search;
	beforeNavigate((nav) => {
		if (!isLegal(nav.to?.route.id || '')) {
			nav.cancel();
			loginStacksJs(initApplication);
			return;
		}
		const next = (nav.to?.url.pathname || '') + (nav.to?.url.search || '');
			if (!nav.to?.route.id && nav.to?.url.href) {
				location.replace(nav.to?.url.href)
			}
			if (nav.to?.url.search.indexOf('testnet') === -1 && search.indexOf('net=testnet') > -1) {
			nav.cancel();
			goto(next + '?net=testnet')
		}
		componentKey++;
	})
	export let data:SbtcContractDataI;
	export let bcInfo:BlockchainInfo|undefined;
	const unsubscribe = sbtcConfig.subscribe((conf) => {});
	onDestroy(unsubscribe);
	//setUpMicroStacks();
	//setUpStacksJs();
	let inited = false;
	let errorReason:string|undefined;

	const initApplication = async () => {
		let conf = defaultSbtcConfig as SbtcConfig;
		if ($sbtcConfig) {
			conf = $sbtcConfig;
		}
		try {
			data = await fetchSbtcData();
			if (!data) data = defaultSbtcConfig.sbtcContractData;
			$sbtcConfig.sbtcContractData = data
			const keys:KeySet = await fetchKeys();
			conf.keys = keys;
			$sbtcConfig.bcInfo = await fetchPoxInfo();
			conf.loggedIn = false;
			if (userSession.isUserSignedIn()) {
				conf.loggedIn = true;
				await fetchSbtcBalance();
			}
		} catch (err) {
			console.log(err)
			data = defaultSbtcConfig.sbtcContractData;
		}
		if (!$sbtcConfig.btcFeeRates) $sbtcConfig.btcFeeRates = await fetchCurrentFeeRates();
		conf.sbtcContractData = data;
		sbtcConfig.update(() => conf);
	}

	onMount(async () => {
		try {
			await initApplication();
			//await tick();
		} catch (err) {
			errorReason = COMMS_ERROR
			console.log(err)
		}
		inited = true;
	})
</script>

{#if inited}
<div class="min-h-screen background flex flex-col justify-between text-white font-thin">
	<div class="h-20 w-screen px-20 ">
		{#key componentKey}
		<Header on:init_application={initApplication}></Header>
		{/key}
	</div>
	<div class="flex justify-center items-start">
		<slot></slot>
	</div>
	<div class="h-20 w-screen px-20">
		<Footer></Footer>
	</div>
</div>
{/if}
