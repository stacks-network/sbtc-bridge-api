<script lang="ts">
import { openContractCall, type ContractCallRegularOptions } from '@stacks/connect';
import { CONFIG } from '$lib/config'
import { bufferCV, tupleCV
} from '@stacks/transactions';
import { appDetails, getStacksNetwork } from '$lib/stacks_connect';
import { explorerTxUrl } from '$lib/utils';
import { sbtcMiniContracts } from 'sbtc-bridge-lib';
import { sbtcConfig } from '$stores/stores'
import { hex } from '@scure/base';

let txId:string;

const amountToUint8 = (amt:number, size:number) => {
	//P..U64BE(BigInt(amt))
	const buffer = new ArrayBuffer(size);
	const view = new DataView(buffer);
	view.setUint8(0, amt);
	const res = new Uint8Array(view.buffer);
	return res; //hex.decode(bufferToHex(res.buffer))
	//(amt.toString(16).padStart(16, "0"))
}

const getArgs = function () {
	const tupCV = tupleCV({
			version: bufferCV(amountToUint8(6, 1)),
			hashbytes: bufferCV(hex.decode($sbtcConfig.sbtcContractData.nextPegWallet.pubkey)),
		});
  	return [tupCV];
};

const vote = async () => {
	const options:ContractCallRegularOptions = {
		contractAddress: CONFIG.VITE_SBTC_MINI_DEPLOYER,
		contractName: sbtcMiniContracts.pool,
		functionName: 'vote-for-threshold-wallet-candidate',
		functionArgs: getArgs(),
		appDetails: appDetails(),
		network: getStacksNetwork(),
		onFinish: (data:any) => {
			console.log('Stacks Transaction:', data.stacksTransaction);
			txId = data.txId;
			console.log('Raw transaction:', data.txRaw);
		},
	};
	await openContractCall(options);
}

</script>

<div class="flex gap-2 mb-2 items-center justify-center">
	{#if txId}
	<div class="text-base text-white font-extralight">
		<a href={explorerTxUrl(txId)} target="_blank">open in explorer</a>
	</div>
	{:else}
	<div class="text-base text-white font-extralight">
		<button on:click={() => vote()} class="inline-flex items-center gap-x-1.5 bg-primary-01 px-4 py-2 font-normal text-black rounded-xl border border-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 shrink-0">
			Vote now
		</button>
	</div>
	{/if}
</div>

<!--
{#if CONFIG.VITE_NETWORK === "testnet"}
	<Banner
		bannerType={'info'}
		message={'Don\'t have testnet Bitcoin? <a class="underline" href="https://bitcoinfaucet.uo1.net/" target="_blank">Get some to get started!</a>'}
	/>
{/if}
<div class="mt-4">
  <Button on:click={() => toggleNetwork()} class="block w-full md:w-auto md:inline-flex items-center gap-x-1.5 bg-primary-01 px-4 py-2 font-normal text-black rounded-xl border border-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 shrink-0">
  	Switch network
  </Button>
</div>
-->