<script lang="ts">
import { onMount } from "svelte";
import Invoice from "./Invoice.svelte";

export let signature:string;

onMount(async () => {
})
</script>
<div id="clipboard"></div>

<div class="p-3 gap-y-8 w-full align-baseline items-start md:items-end">
  <div class="flex w-full my-5 gap-y-4 align-baseline items-center flex-wrap">
    <div class="grow">
      <span class="text-2xl font-medium">Step 2: Copy the data and paste into a TXT record</span>
    </div>
  </div>
  <Invoice {signature} on:back/>
</div>
