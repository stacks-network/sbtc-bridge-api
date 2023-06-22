<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Brand from './Brand.svelte'
	import Items from './Items.svelte'
	import { sbtcConfig } from '$stores/stores';
	import type { SbtcConfig } from '$types/sbtc_config';
	import { goto } from "$app/navigation";
	import { smbp } from '$lib/utils'
	import { loginStacksJs } from '$lib/stacks_connect'
	import { logUserOut } from '$lib/stacks_connect'
	import SettingsMenuFB from './SettingsMenuFB.svelte'
	import NavButton from './NavButton.svelte';
	import AccountMenuFB from "./AccountMenuFB.svelte";

	const dispatch = createEventDispatcher();

	$: outerWidth = 0
	$: innerWidth = 0
	$: outerHeight = 0
	$: innerHeight = 0
    $: hidden = innerWidth < smbp;
	let showSettingsMenu = false;
	let showAccountMenu = false;
	let menuTarget:{ offsetTop: number; offsetLeft: number } | undefined;
	let componentKey = 0;
	let showMenu = false

	const navAction = (evt:any) => {
		const details = evt.detail;
		if (details.action === 'settings') {
			openSettingsMenu(details.menuTarget)
		} else if (details.action === 'account') {
			openAccountMenu(details.menuTarget)
		} else if (details.action === 'connect') {
			doLogin()
		}
	} 
	const doLogout = () => {
		logUserOut(); 
		showSettingsMenu = false;
		showAccountMenu = false;
		menuTarget = undefined;
		sbtcConfig.update((conf:SbtcConfig) => {
			conf.loggedIn = false;
			conf.addressObject = undefined;
			return conf;
		});
		goto('/')
	}

	const toggle = () => {
		showMenu = !showMenu
	}

	const doLogin = async () => {
		menuTarget = undefined;
		showSettingsMenu = false;
		showAccountMenu = false;
		const res = await loginStacksJs(doLoginAfter);
		console.log(res)
	}

	const doLoginAfter = async (result:boolean) => {
		if (result) dispatch('init_application', { from: 'header' });
	}

	const openSettingsMenu = (pos:{ offsetTop: number; offsetLeft: number }) => {
		showAccountMenu = false;
		if (menuTarget) {
			menuTarget = undefined;
			showSettingsMenu = false;
		} else {
			menuTarget = pos;
			console.log(menuTarget)
			showSettingsMenu = true;
		}
		componentKey++;
	}

	const openAccountMenu = (pos:{ offsetTop: number; offsetLeft: number }) => {
		showSettingsMenu = false;
		if (showAccountMenu) {
			menuTarget = undefined;
			showAccountMenu = false;
		} else {
			menuTarget = pos;
			console.log(menuTarget)
			showAccountMenu = true;
		}
		componentKey++;
	}

</script>
<div class="h-20 flex flex-nowrap justify-around items-center">
	<div class={(!hidden) ? 'w-1/6 flex flex-row' : 'w-1/6 flex flex-row flex-grow'}>
		<Brand />
	</div>
	<div class="flex flex-nowrap gap-3 order-2">
		{#if !hidden}
			<SettingsMenuFB  on:clicked={navAction}/>
		{/if}
		{#if $sbtcConfig.loggedIn}
		<!--<NavButton label={'My Account'} target={'account'} on:clicked={navAction}/>-->
		<AccountMenuFB {menuTarget} on:init_logout={() => doLogout()}/>
		{:else}
		<NavButton label={'Connect Wallet'} target={'connect'} on:clicked={navAction}/>
		{/if}
	</div>
	{#if !hidden}
	<Items {showMenu} {hidden} on:clicked={navAction}/>
	{:else}
		<Items {showMenu} {hidden} on:clicked={navAction}/>
		<div class="flex order-3">
			<button on:click={toggle} type="button" class="focus:outline-none whitespace-normal m-0.5 rounded-lg focus:ring-2 p-1.5 focus:ring-gray-400  hover:bg-gray-900 dark:hover:bg-gray-600 ml-3" aria-label="Open main menu">
				<span class="sr-only">Open main menu</span>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 shrink-0" aria-label="bars 3" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
				</svg>
			</button>
		</div>
	{/if}
	<!--
	{#key componentKey}
	{#if showSettingsMenu}<SettingsMenuFB/>{/if}
	{#if showAccountMenu}<AccountMenu on:init_logout={() => doLogout()}/>{/if}
	{/key}
	-->
</div>
<svelte:window bind:innerWidth bind:outerWidth bind:innerHeight bind:outerHeight />

<style>


</style>