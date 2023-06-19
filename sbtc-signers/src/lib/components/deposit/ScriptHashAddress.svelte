<script lang="ts">
import { onMount } from 'svelte';
import QrCode from "svelte-qrcode"
import { fmtSatoshiToBitcoin } from '$lib/utils'
import Button from '$lib/components/shared/Button.svelte';
import FileIcon from '$lib/components/shared/FileIcon.svelte';
import CopyClipboard from '$lib/components/common/CopyClipboard.svelte';
import { makeFlash } from "$lib/stacks_connect";
import type { PeginRequestI } from 'sbtc-bridge-lib' 

export let peginRequest:PeginRequestI;
// NB Its possible the user paid a different amount to the amount they entered in the UI - ths takes the on chain amount first
let amount = 0;
let copied = false;

const copy = (ele:string) => {
  let nameProp = fmtSatoshiToBitcoin(amount);
  if (ele === 'address-field' && peginRequest.commitTxScript) nameProp = peginRequest.commitTxScript.address || '';
  let clippy = {
    target: document.getElementById('clipboard')!,
    props: { name: nameProp },
  }
  const app = new CopyClipboard(clippy);
  app.$destroy();
  makeFlash(document.getElementById(ele))
  copied = true;
}

const paymentUri = () => {
  let uri = 'bitcoin:' + peginRequest.commitTxScript!.address
  uri += '?amount=' + fmtSatoshiToBitcoin(amount)
  uri += '&label=' + encodeURI('Wrap BTC to mint sBTC on Stacks')
  return uri
}
onMount(async () => {
  if (!peginRequest) throw new Error('No pegin request')
  amount = ((peginRequest.status === 2) ? peginRequest.vout?.value : peginRequest.amount) || 0;
})
</script>
<div id="clipboard"></div>

<div class="frame26">
  <div class="frame28457">
    <div class="text-hint">Scan this QR code or copy the address and amount into your Bitcoin wallet to send Bitcoin.</div>
    <div class="frame28454">
      <div class="frame-qr">
        <QrCode value={paymentUri()} padding={'40px'} color={'#000'} background={'#fff'} size={300} />
      </div>
      <div class="frame28455">
        <div class="frame25">
          <div class="frame29">
            <div id="address-field" class="text-address">{peginRequest.commitTxScript?.address}</div>
            <div class="icon-file pointer" on:keydown on:click={() => copy('address-field')}><FileIcon /></div>
          </div>
        </div>
        <div class="frame28456">
          <div class="text-amount ">
            <span id="amount-field"  class="">{fmtSatoshiToBitcoin(amount)}</span>
            <span class="amount-selector pointer" on:keydown on:click={() => copy('amount-field')}><FileIcon /></span>
          </div>
          
          <div class="text-sats">
            <div>BITCOIN</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame28">
    <Button darkScheme={true} label={'Make changes'} target={'back'} on:clicked/>
    <Button darkScheme={false} label={'Check status'} target={'status-check'} on:clicked/>
  </div>
</div>

<style>
.frame26 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;
  width: auto;
  height: auto;
  /* Inside auto layout */
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}
.frame28457 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: auto;
  height: auto;
  /* Insie auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.text-hint {
  /* Hint text */
  width: auto;
  height: auto;
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
  flex-grow: 0;
}
.frame28454 {
  box-sizing: border-box;
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px;
  gap: 16px;
  width: auto;
  height: 156px;
  /* Gradients/Gray */
  background: linear-gradient(126.12deg, #121212 44.07%, #404040 89.82%);
  /* Base/Gray/400 */
  border: 0.3px solid #A5A5A5;
  box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
  padding-right: 6px;
}
.frame-qr {
  box-sizing: border-box;
  width: 132px;
  height: 132px;
  /* Base/White */
  background: #FFFFFF;
  /* Base/Gray/600 */
  border: 1px solid #6A6A6A;
  border-radius: 6px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.frame28455 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0px;
  width: auto;
  height: 132px;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 1;
}
.frame28 {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 205px;
  height: 36px;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
.frame25 {
  box-sizing: border-box;
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  gap: 4px;
  width: auto;
  height: 36px;
  /* Base/Black */
  background: #000000;
  /* Base/Gray/600 */
  border: 1px solid #6A6A6A;
  border-radius: 6px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}
.frame28456 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 163px;
  height: 96px;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
.frame29 {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: auto;
  height: 20px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 1;
}
.text-address {
  width: auot;
  height: 16px;
  /* xs/Medium */
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  /* identical to box height, or 133% */
  /* Base/White */
  color: #FFFFFF;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.icon-file {
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
.text-amount {
  width: 400px;
  height: 70px;
  /* 6xl/Black */
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 900;
  font-size: 60px;
  line-height: 60px;
  /* identical to box height, or 100% */
  color: #FFFFFF;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.amount-selector {
  position: relative;
  top: -50px;
  left: 434px;
}
.text-sats {
  width: 100%;
  height: auto;
  /* 3xl/Light */
  font-family: 'Circular Std';
  font-style: normal;
  font-weight: 300;
  font-size: 30px;
  line-height: 36px;
  /* identical to box height, or 120% */
  color: #FFFFFF;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
</style>