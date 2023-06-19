<script lang="ts">
import { onMount } from 'svelte';
import SwitchGraphic from './SwitchGraphic.svelte';

onMount(async () => {
})

</script>

<div class="frame27">
  <div class="frame25">
    <SwitchGraphic />
  </div>
  <div class="frame24">
    <span class="text-deposit">Withdraw sBTC</span>
  </div>
</div>
<style>
.frame27 {
  /* Frame 27 */
  width: 106.8%;
  height: 64px;
  /* Inside auto layout */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.frame24 {
  /* Frame 24 */
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  flex: none;
  order: 0;
  flex-grow: 0;
}
.frame25 {
  /* Frame 25 */
  box-sizing: border-box;
  /* Auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
  padding: 8px 12px;
  gap: 4px;
  width: 245px;
  height: 40px;
  /* Gradients/Black */
  background: linear-gradient(126.12deg, #000000 21.1%, #121212 53.58%);
  /* Base/Gray/600 */
  border-width: 0.2px 0px 0.2px 0.2px;
  border-style: solid;
  border-color: #6A6A6A;
  box-shadow: -6px 2px 12px rgba(0, 0, 0, 0.4);
  border-radius: 8px 0px 0px 8px;
}
.text-deposit {
  /* Deposit BTC */
  width: 277px;
  height: 40px;
  /* 4xl/Medium */
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 500;
  font-size: 36px;
  line-height: 40px;
  /* identical to box height, or 111% */
  color: #FFFFFF;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

</style>