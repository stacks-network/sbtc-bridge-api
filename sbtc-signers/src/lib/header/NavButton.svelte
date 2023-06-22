<script lang="ts">
import { createEventDispatcher } from "svelte";

export let label:string;
export let target:string;

let btnId="menu-btn-" + target;
let btnTextId="menu-btn-text-" + target;
let btnClass="px-5 py-1 flex flex-nowrap rounded-lg  flex menu-btn-" + target + ' btn';
let btnTextClass="menu-btn-text-" + target;

const dispatch = createEventDispatcher();

const doClicked = (event:any) => {
	const menuTarget = { offsetTop: event.target.offsetTop, offsetLeft: event.target.offsetLeft };
	dispatch('clicked', { action: target, menuTarget });
}

</script>
<div id={btnId} class={btnClass}>
	<span id={btnTextId} class={btnTextClass + ' whitespace-nowrap '} on:keydown on:click={(event) => doClicked(event)}>
		{label}
		{#if target === 'settings'}
		<svg class="inline-block" width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M9.42602 1.4428L5.17822 5.94046C5.15517 5.96403 5.12767 5.9828 5.09732 5.99571C5.06639 6.00885 5.03313 6.01563 4.99953 6.01563C4.96593 6.01563 4.93266 6.00885 4.90174 5.99571C4.87138 5.9828 4.84389 5.96403 4.82084 5.94046L0.573036 1.4428L0.573051 1.44278L0.569843 1.43945C0.5239 1.39169 0.498795 1.32765 0.500045 1.2614C0.501295 1.19515 0.528798 1.1321 0.57651 1.08611L0.229535 0.726113L0.57619 1.08642C0.623943 1.04048 0.687983 1.01537 0.754236 1.01662C0.819795 1.01786 0.882215 1.0448 0.928072 1.09159L4.6356 5.02697L4.99953 5.41327L5.36346 5.02697L9.07346 1.08897L9.07353 1.08903L9.07987 1.08203C9.10235 1.05725 9.12957 1.03724 9.15993 1.02317C9.19029 1.0091 9.22316 1.00127 9.2566 1.00014C9.29004 0.999013 9.32336 1.00461 9.3546 1.01659C9.38584 1.02858 9.41435 1.04671 9.43845 1.06992C9.46255 1.09313 9.48175 1.12094 9.4949 1.1517C9.50806 1.18246 9.5149 1.21555 9.51504 1.24901C9.51517 1.28247 9.50858 1.31561 9.49567 1.34648C9.48276 1.37734 9.46378 1.40531 9.43987 1.4287L9.43281 1.43561L9.42602 1.4428Z" fill="white" stroke="url(#paint0_linear_3556_1643)"/>
			<defs>
			<linearGradient id="paint0_linear_3556_1643" x1="-1.61111" y1="3.50781" x2="3.08358" y2="9.21229" gradientUnits="userSpaceOnUse">
			<stop stop-color="#ED693C"/>
			<stop offset="0.9036" stop-color="#FEDB63"/>
			</linearGradient>
			</defs>
		</svg>
		{:else if target === 'account'}
		<svg class="inline-block" width="11" height="9" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M9.42602 1.4428L5.17822 5.94046C5.15517 5.96403 5.12767 5.9828 5.09732 5.99571C5.06639 6.00885 5.03313 6.01563 4.99953 6.01563C4.96593 6.01563 4.93266 6.00885 4.90174 5.99571C4.87138 5.9828 4.84389 5.96403 4.82084 5.94046L0.573036 1.4428L0.573051 1.44278L0.569843 1.43945C0.5239 1.39169 0.498795 1.32765 0.500045 1.2614C0.501295 1.19515 0.528798 1.1321 0.57651 1.08611L0.229535 0.726113L0.57619 1.08642C0.623943 1.04048 0.687983 1.01537 0.754236 1.01662C0.819795 1.01786 0.882215 1.0448 0.928072 1.09159L4.6356 5.02697L4.99953 5.41327L5.36346 5.02697L9.07346 1.08897L9.07353 1.08903L9.07987 1.08203C9.10235 1.05725 9.12957 1.03724 9.15993 1.02317C9.19029 1.0091 9.22316 1.00127 9.2566 1.00014C9.29004 0.999013 9.32336 1.00461 9.3546 1.01659C9.38584 1.02858 9.41435 1.04671 9.43845 1.06992C9.46255 1.09313 9.48175 1.12094 9.4949 1.1517C9.50806 1.18246 9.5149 1.21555 9.51504 1.24901C9.51517 1.28247 9.50858 1.31561 9.49567 1.34648C9.48276 1.37734 9.46378 1.40531 9.43987 1.4287L9.43281 1.43561L9.42602 1.4428Z" fill="white" stroke="black"/>
		</svg>
		{:else if target === 'connect'}
		<svg class="inline-block" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M16.5 8.5C16.5 8.00272 16.3025 7.52581 15.9508 7.17417C15.5992 6.82254 15.1223 6.625 14.625 6.625H11.5C11.5 7.28804 11.2366 7.92393 10.7678 8.39277C10.2989 8.86161 9.66304 9.125 9 9.125C8.33696 9.125 7.70107 8.86161 7.23223 8.39277C6.76339 7.92393 6.5 7.28804 6.5 6.625H3.375C2.87772 6.625 2.40081 6.82254 2.04917 7.17417C1.69754 7.52581 1.5 8.00272 1.5 8.5M16.5 8.5V13.5C16.5 13.9973 16.3025 14.4742 15.9508 14.8258C15.5992 15.1775 15.1223 15.375 14.625 15.375H3.375C2.87772 15.375 2.40081 15.1775 2.04917 14.8258C1.69754 14.4742 1.5 13.9973 1.5 13.5V8.5M16.5 8.5V6M1.5 8.5V6M16.5 6C16.5 5.50272 16.3025 5.02581 15.9508 4.67417C15.5992 4.32254 15.1223 4.125 14.625 4.125H3.375C2.87772 4.125 2.40081 4.32254 2.04917 4.67417C1.69754 5.02581 1.5 5.50272 1.5 6M16.5 6V3.5C16.5 3.00272 16.3025 2.52581 15.9508 2.17417C15.5992 1.82254 15.1223 1.625 14.625 1.625H3.375C2.87772 1.625 2.40081 1.82254 2.04917 2.17417C1.69754 2.52581 1.5 3.00272 1.5 3.5V6" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		{/if}
    <span>
		</span>
	</span>
</div>

<style>
.btn {
	cursor: pointer;
}
.menu-btn-account {
  background: linear-gradient(306.12deg, #ED693C 21.1%, #FDC60B 84.08%);
  border: 1px solid #DA6137;
}

.menu-btn-text-account {
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.02em;
  color: #000000;
}

.menu-btn-settings {
  background: #000000;
	border: 1px solid #FEDB63;
}
.menu-btn-text-settings {
  background: linear-gradient(126.12deg, #ED693C 11.8%, #FEDB63 72.43%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.menu-btn-text-connect {
  color: #000000;
}
.menu-btn-connect {
  background: linear-gradient(306.12deg, #ED693C 21.1%, #FDC60B 84.08%);
  border: 1px solid #DA6137;
  border-radius: 12px;
}
</style>
