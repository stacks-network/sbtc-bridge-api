<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Toggle } from 'flowbite-svelte'
	import { InformationCircle, Icon } from "svelte-hero-icons"
  import { Tooltip } from 'flowbite-svelte';
	import { sbtcConfig } from '$stores/stores';
	import type { SbtcConfig } from '$types/sbtc_config';
	import Currencies from '$lib/components/settings/Currencies.svelte';
	import Addresses from '$lib/components/settings/Addresses.svelte';
	import Networks from '$lib/components/settings/Networks.svelte';
	import type { ExchangeRate } from 'sbtc-bridge-lib';

	const toggleSettings = (arg:string) => {
		const conf:SbtcConfig = $sbtcConfig;
		if (arg === 'txmode') conf.userSettings.useOpDrop = !conf.userSettings.useOpDrop;
		if (arg === 'debug') conf.userSettings.debugMode = !conf.userSettings.debugMode;
		if (arg === 'testAddresses') conf.userSettings.testAddresses = !conf.userSettings.testAddresses;
		if (arg === 'cryptoFirst') conf.userSettings.currency.cryptoFirst = !conf.userSettings.currency.cryptoFirst;
		sbtcConfig.update(() => conf);
	}

	onMount(async () => {
		if (typeof $sbtcConfig.userSettings === 'undefined') {
			$sbtcConfig.userSettings = {
				useOpDrop: false,
				debugMode: false,
				testAddresses: false,
				currency: {
					cryptoFirst: false,
					myFiatCurrency: { currency: 'USD'} as ExchangeRate,
					denomination: 'bitcoin'
				}
			}
		}
		if (typeof $sbtcConfig.userSettings.currency === 'undefined') {
			$sbtcConfig.userSettings.currency = {
				cryptoFirst: false,
				myFiatCurrency: 'USD',
				denomination: 'bitcoin'
			}
		}
		sbtcConfig.update(() => $sbtcConfig);
	})
</script>

<svelte:head>
  <title>sBTC Bridge - Settings</title>
  <meta name="description" content="The sBTC Bridge
  provides a non-custodial, permissionless way to move Bitcoin into and out of the Stacks Blockchain." />
</svelte:head>

<Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-network">
  Testnet refers to a test version of the real blockchain. On the other hand, mainnet is the live version of the blockchain network used for real transactions.
</Tooltip>
<Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-opdrop">
  OP_DROP means you can deposit from any wallet but takes a bit longer. OP_RETURN allows you to deposit/withdraw
  more quickly using your Stacks Bitcoin wallet!
</Tooltip>

<div class="md:w-full sm:w-full mx-auto flex flex-col justify-center px-6 lg:px-8 py-6">
  <div class="max-w-4xl">
    <div class="p-10 gap-6 items-start bg-gray-1000 border-[0.5px] border-gray-700 rounded-3xl">
      <h1 class="text-4xl font-normal">Settings</h1>

      <div class="bg-gray-1000 text-white">
        <div class="border-b border-gray-900/50 pt-6 pb-8">
          <Networks />
        </div>

        <div class="border-b border-gray-900/50 pt-6 pb-8">
          <Currencies />
        </div>

        <div class=" border-gray-900/50 pt-6 ">
          <Addresses />
        </div>

      </div>
    </div>
  </div>
</div>
