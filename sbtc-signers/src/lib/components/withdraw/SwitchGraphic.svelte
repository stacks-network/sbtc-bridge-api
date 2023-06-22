<script lang="ts">
import { onMount } from 'svelte';
import BitcoinIcon from '../shared/BitcoinIcon.svelte';
import ArrowRightIcon from '../shared/ArrowRightIcon.svelte';
import SBtcIcon from '../shared/sBTCIcon.svelte';

onMount(async () => {
})

</script>

<div class="frame29">
  <div class="xframe29">
    <div class="xframe29-1"><SBtcIcon /></div>
    <div class="xframe29-2">sBTC</div>
  </div>
  <div class="xframe"><ArrowRightIcon/></div>
  <div class="xframe29">
    <div class="xframe29-1"><BitcoinIcon /></div>
    <div class="xframe29-2">BTC</div>
  </div>
</div>
<style>
.frame29 {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;

  width: 61px;
  height: 24px;


  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 0;
}
.xframe29 {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  margin-right: 20px;
  width: 61px;
  height: 24px;


  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 0;
}
.frame-middle {
  width: 24px;
  height: 24px;


  /* Inside auto layout */

  flex: none;
  order: 1;
  flex-grow: 0;
}
.frame-middle-1 {
  position: relative;
  width: 20px;
  height: 20px;
  left: 2px;
  top: 2px;
}
.frame30 {
  /* Auto layout */

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;

  width: 68px;
  height: 24px;


  /* Inside auto layout */

  flex: none;
  order: 2;
  flex-grow: 0;
}

.frame29-1 {
  width: 20px;
  height: 20px;


  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 0;
}
.frame29-2 {
  width: 33px;
  height: 24px;

  /* base/Black */

  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 900;
  font-size: 16px;
  line-height: 24px;
  /* identical to box height, or 150% */


  /* Base/White */

  color: #FFFFFF;


  /* Inside auto layout */

  flex: none;
  order: 1;
  flex-grow: 0;
}

</style>