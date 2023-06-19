<script lang="ts">
import { onMount } from 'svelte';

export let timeLineStatus = 1;

onMount(async () => {
})


</script>

<div class="frame15">
  <div class="frame28477">
    <div class="list-item">
      <div class={(timeLineStatus === 1) ? 'ellipse-on' : 'ellipse-off'}></div>
      <div class="text-hint">Amount</div>
    </div>
  </div>
  <div class="frameO1">
    <div class="vector1"><svg width="21" height="64" viewBox="0 0 21 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.666504 -1.6001L20.6665 31.9999L0.666504 65.5999" stroke="#ADBCF6" stroke-width="0.5" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
  <div class="frame28477 frame28480">
    <div class="list-item">
      <div class={(timeLineStatus === 2) ? 'ellipse-on' : 'ellipse-off'}></div>
      <div class="text-hint">Send</div>
    </div>
  </div>
  <div class="frameO1 frameO3">
    <div class="vector1"><svg width="21" height="64" viewBox="0 0 21 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.666504 -1.6001L20.6665 31.9999L0.666504 65.5999" stroke="#ADBCF6" stroke-width="0.5" stroke-linejoin="round"/>
      </svg>
    </div>  
  </div>
  <div class="frame28477 frame28481">
    <div class="list-item">
      <div class={(timeLineStatus === 3) ? 'ellipse-on' : 'ellipse-off'}></div>
      <div class="text-hint">Confirmation</div>
    </div>
  </div>          
</div>
<style>
.frame15 {
  /* Frame 15 */
  box-sizing: border-box;
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 40px;
  gap: 24px;
  height: 64px;
  /* Base/Gray/1000 */
  background: #121212;
  /* Secondary/Blue/400 */
  border: 0.5px solid #ADBCF6;
  border-radius: 24px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
  width: 100%
}
.frame28477 {
  /* Frame 28477 */
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  gap: 10px;
  width: 153.33px;
  height: 64px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 1;
}
.frameO1 {
  /* Frame */
  width: 22px;
  height: 64px;
  opacity: 0.8;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
.frame28480 {
  order: 2;
}
.frameO3 {
  order: 3;

}
.frame28481 {
  order: 4;
}
.vector1 {
  /* Vector */
  height: 64px;
  /* Secondary/Blue/400 */
  border: 0px solid #ADBCF6;
}
.list-item {
  /* Frame 28480 */
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 77px;
  height: 24px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.ellipse-on {
  /* Ellipse 7 */
  width: 8px;
  height: 8px;
  /* Secondary/Blue/500 */
  background: #7F97F1;
  box-shadow: 0px 0px 4px #121212, 0px 0px 4px 4px #475587;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.ellipse-off {
  /* Ellipse 7 */
  width: 8px;
  height: 8px;
  /* Secondary/Blue/500 */
  background: #fff;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.text-hint {
  /* Hint text */
  width: 57px;
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
  order: 1;
  flex-grow: 0;
}
</style>