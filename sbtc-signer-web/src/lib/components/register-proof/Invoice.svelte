<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import Button from '$lib/components/shared/Button.svelte';
import CopyClipboard from '$lib/components/common/CopyClipboard.svelte';
import { makeFlash } from "$lib/stacks_connect";
import { txtRecordPrecis } from "$lib/webdid";

let copied = false;
export let signature:string;
let copiedMsg:string;
const dispatch = createEventDispatcher();

const copy = (ele:string) => {
  let clippy = {
    target: document.getElementById('clipboard')!,
    props: { name: txtRecordPrecis + signature },
  }
  const app = new CopyClipboard(clippy);
  app.$destroy();
  makeFlash(document.getElementById(ele))
  copiedMsg = 'Copied signature'
  copied = true;
}

const goBack = () => {
  dispatch('back');
}

onMount(async () => {
})
</script>
<div id="clipboard"></div>

<div class="">
  <div class="flex items-center">
    <div class="mb-5"><Button darkScheme={false} label={'Back'} target={'goBack'} on:clicked={() => goBack()}/></div>
    <div class="mb-5"><Button darkScheme={true} label={'Copy to Clipboard'} target={'showInvoice'} on:clicked={() => copy('address-field')}/></div>
    {#if copiedMsg}
    <div class="mb-5  rounded-md ">
        <div id="address-field" class="grow text-1xl">{copiedMsg}</div>
    </div>
    {/if}
  </div>
</div>
