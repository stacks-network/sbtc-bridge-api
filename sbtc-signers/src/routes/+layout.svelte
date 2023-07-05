<script lang="ts">
	import '../app.postcss';
	import "../sbtc.css";
	import Header from "$lib/header/Header.svelte";
	import Footer from "$lib/header/Footer.svelte";
	import { fetchStatelessInfo } from "$lib/signers_api";
	import { fetchSbtcData } from "$lib/bridge_api";
	import { fetchSbtcBalance, userSession, isLegal,isDevnet } from "$lib/stacks_connect";
	import { setConfig } from '$lib/config';
	import { afterNavigate, beforeNavigate, goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount, onDestroy } from 'svelte';
	import { sbtcConfig } from '$stores/stores'
	import type { SbtcContractDataI, KeySet } from 'sbtc-bridge-lib';
	import type { SbtcConfig } from '$types/sbtc_config'
	import { defaultSbtcConfig } from '$lib/sbtc';
	import { COMMS_ERROR } from '$lib/utils.js'
	import { loginStacksJs } from '$lib/stacks_connect'

	export let data:{ sbtcContractData: SbtcContractDataI, keys: KeySet, sbtcWalletAddressInfo: any, btcFeeRates: any } ;
	const unsubscribe = sbtcConfig.subscribe((conf) => {});
	onDestroy(unsubscribe);
	let inited = false;
	let errorReason:string|undefined;

	let componentKey = 0;
	console.log('process.env: ', import.meta.env);
	setConfig('?net=devnet')   //($page.url.search);
	const search = $page.url.search;
	if (!isLegal(location.href)) {
		componentKey++;
		goto('/' + '?net=devnet')
	}
	if (!isDevnet(location.href)) {
		componentKey++;
		goto('/' + '?net=devnet')
	}
	beforeNavigate((nav) => {
		if (!isLegal(nav.to?.route.id || '')) {
			nav.cancel();
			loginStacksJs(initApplication);
			componentKey++;
			return;
		}
		const next = (nav.to?.url.pathname || '') + (nav.to?.url.search || '');
		if (next.indexOf('devnet') === -1) {
			nav.cancel();
			goto(next + '?net=devnet')
		}
		/**
		if (nav.to?.url.search.indexOf('testnet') === -1 && search.indexOf('net=testnet') > -1) {
			nav.cancel();
			goto(next + '?net=testnet')
		} else if (nav.to?.url.search.indexOf('devnet') === -1 && search.indexOf('net=devnet') > -1) {
			nav.cancel();
			goto(next + '?net=devnet')
		}*/
	})
	afterNavigate((nav) => {
		componentKey++;
	})

	const initApplication = async () => {
		let conf = defaultSbtcConfig as SbtcConfig;
		if ($sbtcConfig) {
			conf = $sbtcConfig;
		}
		try {
			data = await fetchSbtcData();
			if (!data) data = {} as any;
			const statelessInfo = await fetchStatelessInfo();
			$sbtcConfig.bcInfo = statelessInfo?.bcInfo;
			$sbtcConfig.sbtcContractData = statelessInfo?.sbtcContractData;
			$sbtcConfig.poxCycleInfo = statelessInfo?.poxCycleInfo;
			conf.loggedIn = false;
			if (userSession.isUserSignedIn()) {
				conf.loggedIn = true;
				await fetchSbtcBalance();
			}
		} catch (err) {
			data = {} as any;
		}
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
	<div class="bg-gray-1000 bg-[url('$lib/assets/bg-lines.png')] bg-cover text-white font-extralight min-h-screen">
		<div class="flex w-full bg-warning-200 justify-center">
			<span class="text-error-700 py-5 font-medium">under construction see <a href="https://brighton-blockchain.gitbook.io/sbtc-bridge/sbtc-signer-dashboard/sbtc-mini-devnet#devnet-wallet-setup" target="_blank">connect your web wallet to devnet?</a></span>
		</div>
		<div>
			{#key componentKey}
			<Header on:init_application={initApplication} />
			{/key}
		</div>
		<div class="flex min-h-[calc(100vh-160px)] mx-auto lg:px-8 align-middle justify-center flex-grow">
			<slot></slot>
		</div>

		<Footer />
	</div>
{/if}
