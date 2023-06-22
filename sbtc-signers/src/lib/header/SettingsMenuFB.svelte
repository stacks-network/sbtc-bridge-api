<script lang="ts">
	import { Dropdown, GradientButton, Chevron } from 'flowbite-svelte'
	import { onMount } from 'svelte';
	import SettingsMenuContent from "./SettingsMenuContent.svelte";

	$: dropdownOpen = false;
	onMount(async () => {
	})

</script>

<GradientButton btnClass="h-12 menu-btn-settings rounded-md w-36 text-center" data-placement="left-start"><span class="inline-flex menu-btn-text-settings flex flex-nowrap text-warning-400"><Chevron>Settings</Chevron></span></GradientButton>

<Dropdown ulClass=""  bind:open={dropdownOpen}>
	<SettingsMenuContent />
</Dropdown>

<style>

</style>
