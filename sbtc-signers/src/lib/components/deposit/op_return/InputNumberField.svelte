<script lang="ts">
import { createEventDispatcher } from "svelte";
import IntroFill from '$lib/components/shared/IntroFill.svelte';
import { onMount } from 'svelte';

const dispatch = createEventDispatcher();

export let inputData:{
  field: string;
  label: string;
  hint: string;
  value:number;
  resetValue:number|undefined;
}

let value:number = inputData.value;
let reason:string|undefined;

const reset = () => {
  value = inputData.resetValue || 0;
}

const updater = async () => {
  try {
    inputData.value = value;
    dispatch('updated', inputData);
  } catch(err:any) {
    reason = err.message || 'Error - is the address a valid';
  }
}
onMount(async () => {
  reason = undefined;
})

</script>

<div class="input-box">
  <div class="label-box">
    {inputData.label} <span class="pointer"><IntroFill/></span>
  </div>
  <div id={inputData.field} class="input">
    <input type='number' bind:value={value} on:input={() => updater()}>
  </div>
  {#if reason}
  <div class="text-xs text-error-500 grow">
    {reason}
  </div>
  {:else if inputData.hint}
  <div class="grid grid-cols-6">
    <div class="text-hint col-span-5">
      {inputData.hint}
    </div>
    {#if inputData.resetValue}
    <div class="col-span-1 text-hint text-warning-500">
      <a href="/" on:click|preventDefault={() => reset()}>reset</a>
    </div>
    {/if}
  </div>
  {/if}
</div>
<style>
.input-box {
  /* Input field */


  /* Auto layout */

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  height: auto;


  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 0;
  z-index: 0;
}
.label-box {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  height: 24px;


  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 1;
}
.text-hint {
  width: 600px;
  height: 24px;

  /* base/Light */

  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 300;
  font-size: 16px;
  line-height: 24px;
  /* identical to box height, or 150% */


  /* Base/Gray/200 */

  color: #E9E9E9;


  /* Inside auto layout */

  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 1;
}
input {
  box-sizing: border-box;

  /* Auto layout */

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;

  width: 600px;
  height: 48px;

  /* Base/White */

  background: #FFFFFF;
  /* Base/Gray/300 */

  border: 1px solid #CDCDCD;
  border-radius: 12px;

  /* Inside auto layout */

  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;

  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 300;
  font-size: 16px;
  line-height: 24px;
  /* identical to box height, or 150% */


  /* Base/Black */

  color: #000000;


  /* Inside auto layout */

}
</style>