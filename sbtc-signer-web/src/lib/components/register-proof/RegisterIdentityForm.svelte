<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import Button from '$lib/components/shared/Button.svelte';
import InputTextField from './InputTextField.svelte';
import { makeFlash } from '$lib/stacks_connect';
import { dnsValidate } from '$lib/utils'
import FileIcon from '$lib/components/shared/FileIcon.svelte';
import { sbtcConfig } from '$stores/stores'
import EditIcon from '$lib/components/shared/EditIcon.svelte';
import { truncate } from 'sbtc-bridge-lib'
import CopyClipboard from '$lib/components/common/CopyClipboard.svelte';
import { getDidWeb } from "$lib/webdid";
import { verifyStacksPricipal } from "$lib/stacks_connect";
import { fetchWebDid } from '$lib/signers_api'
import { CONFIG } from '$lib/config'

const dispatch = createEventDispatcher();
let mine = true;
let copied = false;
let errored:string|undefined;

let inited = true;
let componentKey = 0;
let timeLineStatus = 1;
let message:string|undefined;

const input0Data = {
  field: 'message',
  label: 'Domain Name',
  hint: 'no http(s) colons or slashes - just the raw domain name',
  placeholder: 'www.my_doman.com',
  resetValue: '',
  value: ''
}

const input1Data = {
  field: 'stacks-address',
  label: 'Stacks Address',
  hint: undefined,
  placeholder: 'my stacks address',
  resetValue: $sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress,
  value: $sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress
}

const fieldUpdated = async (event:any) => {
  const input = event.detail;
  if (input.field === 'stacks-address') {
    try {
      verifyStacksPricipal(input.value)
    } catch (err) {
      makeFlash(document.getElementById(input.field))
    }
  } else {
    if (dnsValidate(input0Data.value)) {
      const webDid = await fetchWebDid(input0Data.value);
      if (webDid && typeof webDid === 'object') {
        dispatch('time_line_status_change', { timeLineStatus: 3, webDid, domainName: input0Data.value });
      }
    }
  }
}
const copy = (ele:string) => {
    let clippy = {
      target: document.getElementById('clipboard')!,
      props: { name: ele },
    }
    const app = new CopyClipboard(clippy);
    app.$destroy();
    makeFlash(document.getElementById(ele))
    copied = true;
  }

const getAddress = (full:boolean):string => {
    if (full) {
      return $sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress;
    }
    try {
      return truncate($sbtcConfig.keySets[CONFIG.VITE_NETWORK].stxAddress, 10).toUpperCase();
    } catch (err) {
      return 'not connected'
    }
  }

const doClicked = async (event:any) => {
  errored = undefined
  try {
    verifyStacksPricipal(input1Data.value)
  } catch (err:any) {
    makeFlash(document.getElementById(input1Data.field));
    errored = err.message;
  }

  if (!input0Data.value) {
    const ele = document.getElementById(input0Data.field);
    makeFlash(ele);
    errored = 'domain name is required';
  }
  if (!dnsValidate(input0Data.value)) {
    const ele = document.getElementById(input0Data.field);
    makeFlash(ele);
    errored = 'domain name is required';
  }
  if (errored) return;

  const record = getDidWeb(input0Data.value, input1Data.value)
  timeLineStatus = 2;
  dispatch('time_line_status_change', { timeLineStatus, record, domainName: input0Data.value });

  //await signSip18Message(async function(sigData:any) {
  //  dispatch('time_line_status_change', { timeLineStatus, sigData });
  //}, input0Data.value);
}

onMount(async () => {
  try {
    inited = true;
  } catch(err) {
    dispatch('time_line_status_change', { timeLineStatus: -1 });
  }
})
</script>

{#if !inited}
<div class="text-2xl text-warning-700 py-10 px-5">Fetching data.. won't be long</div>
{:else}
  <div class="flex w-full my-5 gap-y-4 align-baseline items-center flex-wrap">
    <div class="grow">
      <h1 class="text-2xl font-medium">Step 1: Who to Verify</h1>
      <p class="text-1xl font-medium">Enter the doman name of the verifier and the stacks address of the signer (to be verified)</p>
    </div>
  </div>
  {#key componentKey}
    <div class="mb-5">
      <InputTextField readonly={false} inputData={input0Data} on:updated={fieldUpdated}/>
    </div>
    <div class="mb-0 flex items-center text-gray-300 px-1 gap-x-2 rounded-md ">
      {#if mine}
      <InputTextField readonly={true} inputData={input1Data} on:updated={fieldUpdated}/>
      {:else}
      <InputTextField readonly={false} inputData={input1Data} on:updated={fieldUpdated}/>
      {/if}
    </div>
    <div class="mb-5 flex justify-end text-gray-300 px-1 gap-x-0 rounded-md ">
      <EditIcon  on:clicked={() => {mine = !mine}} class={' h-4 w-4 text-white'}/>
      <FileIcon on:clicked={() => {copy('stacks-address')}} class={' h-5 w-5 text-white'}/>
    </div>

    <div class="mb-5"><Button darkScheme={false} label={'Download'} target={'showInvoice'} on:clicked={doClicked}/></div>
  {/key}
{/if}
