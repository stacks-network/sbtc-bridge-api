<script lang="ts">
import { createEventDispatcher } from "svelte";

export let darkScheme:boolean;
export let label:string;
export let target:string;

let btnId="menu-btn";
let btnTextId="menu-btn-text";
let btnClass="menu-btn" + ' btn';
let btnTextClass="menu-btn-text";

if (darkScheme) {
  btnClass="menu-btn-dark" + ' btn';
  btnTextClass="menu-btn-text-dark";
}

const dispatch = createEventDispatcher();

const doClicked = (event:any) => {
	const menuTarget = { offsetTop: event.target.offsetTop, offsetLeft: event.target.offsetLeft };
	dispatch('clicked', { target, menuTarget });
}

</script>
<div id={btnId} class={btnClass}>
	<span id={btnTextId} class={btnTextClass + ' whitespace-nowrap '} on:keydown on:click={(event) => doClicked(event)}>
		{label}
	</span>
</div>

<style>
.btn {
	cursor: pointer;
}
.menu-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 4px;
  width: auto;
  height: 36px;
  background: linear-gradient(306.12deg, #ED693C 21.1%, #FDC60B 84.08%);
  border: 1px solid #DA6137;
  border-radius: 12px;
}

.menu-btn-text {
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.02em;
  color: #000000;
}
.menu-btn-dark {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 4px;
  width: 107px;
  height: 36px;
  background: #000000;
  border-radius: 12px;
	border: 1px solid #FEDB63;
}
.menu-btn-text-dark {
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  /* identical to box height, or 143% */

  letter-spacing: -0.02em;

  /* Gradients/Primary/02 */

  background: linear-gradient(126.12deg, #ED693C 11.8%, #FEDB63 72.43%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

</style>
