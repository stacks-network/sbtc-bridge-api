<script lang="ts">
import Delegate from '$lib/components/stacking/Delegate.svelte';
import { CONFIG } from '$lib/config';

</script>

		<div class="flex flex-col p-10 gap-10 items-start bg-gray-1000 border-[0.5px] border-gray-700 rounded-3xl">
			<div class="w-full flex flex-col gap-10">
				<div>
					<h1 class="text-2xl">Stack and Sign</h1>
				</div>
				<Delegate/>
			</div>
		</div>
