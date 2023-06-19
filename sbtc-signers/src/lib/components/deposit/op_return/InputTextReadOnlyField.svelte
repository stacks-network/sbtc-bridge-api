<script lang="ts">
	import { createEventDispatcher } from "svelte";
import IntroFill from '$lib/components/shared/IntroFill.svelte';
import { onMount } from 'svelte';

const dispatch = createEventDispatcher();

export let inputData:{
  field: string;
  label: string;
  hint: string;
  value:string;
  resetValue:string|undefined;
}

let value:string = inputData.value;
let reason:string|undefined;
let readonly = 'readonly'
const reset = () => {
  value = inputData.resetValue || '';
  reason = undefined
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
  //(<HTMLInputElement | null>document.getElementById("input-field"))?.readOnly = true;

  //const el = document.getElementById("input-field");
  //if (el && typeof el === "object") el.readOnly = true;
  reason = undefined;
})

</script>

<div class="input-box">
  <div class="label-box">
    {inputData.label} <span class="pointer"><IntroFill/></span>
  </div>
  <div class="input">
    <input readonly id="input-field" type='text' bind:value={value} on:input={() => updater()}>
  </div>
  {#if reason}
  <div class="text-hint flex"><div class="text-xs text-error-500 grow">{reason}</div></div>
  {:else if inputData.hint && inputData.hint.length > 0}
  <div class="text-hint flex"><div class=" grow">{inputData.hint}</div></div>
  {/if}
    {#if reason || (inputData.resetValue && inputData.resetValue !== inputData.value)}
    <div class=" text-warning-500 text-right">
      <a href="/" on:click|preventDefault={() => reset()}>reset</a>
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
  width: 100%;
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

  background: #CDCDCD;
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