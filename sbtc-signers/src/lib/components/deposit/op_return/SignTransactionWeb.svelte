<script lang="ts">
import { onMount } from 'svelte';
import { createEventDispatcher } from "svelte";
import { hex, base64 } from '@scure/base';
import type { SigData } from 'sbtc-bridge-lib' 
import { openPsbtRequestPopup } from '@stacks/connect'
import * as btc from '@scure/btc-signer';
import { hexToBytes } from "@stacks/common";
import { sendRawTxDirectBlockCypher } from '$lib/bridge_api';
import { sbtcConfig } from '$stores/stores';
import { explorerBtcAddressUrl, fmtSatoshiToBitcoin } from "$lib/utils";
import type { PegInTransactionI } from '$lib/domain/PegInTransaction';
import type { PegOutTransactionI } from '$lib/domain/PegOutTransaction';
import { savePeginCommit } from '$lib/bridge_api';
import Button from '$lib/components/shared/Button.svelte';

export let piTx: PegInTransactionI|PegOutTransactionI;

const dispatch = createEventDispatcher();
let sigData:SigData;
let currentTx:string;
let errorReason: string|undefined;

const getExplorerUrl = () => {
  return explorerBtcAddressUrl(piTx.pegInData.sbtcWalletAddress)
}

export async function requestSignPsbt() {
  console.log(currentTx);
  openPsbtRequestPopup({
    hex: currentTx,
    appDetails: {
      name: 'My App',
      icon: window.location.origin + '/my-app-logo.svg',
    },
    onFinish(data:any) {
      broadcastTransaction(data.hex);
    },
    onCancel() {
      console.log('User cancelled operation');
      return;
    }
  });
}

const updateTransaction = () => {
  dispatch('update_transaction', { success: true });
}

const btnClass = (bb:boolean) => {
  if ($sbtcConfig.pegIn) {
    return (bb) ? 'mx-2 w-25 btn btn-outline-info' : 'mx-2 w-25 btn btn-info';
  } else {
    return (bb) ? 'mx-2 w-25 btn btn-outline-warning' : 'mx-2 w-25 btn btn-warning';
  }
}

let resp:any;
let broadcasted:boolean;
const broadcastTransaction = async (psbtHex:string) => {
  let errMessage = undefined;
  try {
    const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
    try {
      tx.finalize();
    } catch (err) {
      console.log('finalize error: ', err)
      errorReason = 'Unable to create the transaction - this can happen if your wallet is connected to a different account to the one your logged in with. Try hitting the \'back\` button, switching account in the wallet and trying again?';
      return;
    }
    const txHex = hex.encode(tx.toBytes(true, tx.hasWitnesses));
    currentTx = txHex;
    errorReason = undefined;
    resp = await sendRawTxDirectBlockCypher(txHex);
    console.log('sendRawTxDirectBlockCypher: ', resp);
    if (resp && resp.tx) {

      try {
        if ($sbtcConfig.userSettings.useOpDrop) {
          const peginRequest = piTx.getOpDropPeginRequest()
          await savePeginCommit(peginRequest)
        } else {
          const peginRequest = piTx.getOpReturnPeginRequest()
          peginRequest.btcTxid = resp.tx.hash;
          peginRequest.vout0 = resp.tx.vout[0];
          peginRequest.vout = resp.tx.vout[1];
          await savePeginCommit(peginRequest);
        }
      } catch (err) {
        // duplicate.. ok to ignore
      }
      broadcasted = true;
    } else if (resp && resp.error) {
      errMessage = resp.error;
      broadcasted = false;
      errorReason = resp.error + ' Unable to broadcast transaction - please try hitting \'back\' and refreshing the bitcoin input data.'
    }
  } catch (err:any) {
    console.log('Broadcast error: ', err)
    errorReason = 'Request already being processed with these details - change the amount to send another request.'
    //errorReason = errMessage + '. Unable to broadcast transaction - please try hitting \'back\' and refreshing the bitcoin input data.'
  }
}
onMount(async () => {
	sigData = {
    webWallet: true,
		pegin: $sbtcConfig.pegIn,
		outputsForDisplay: piTx?.getOutputsForDisplay(),
		inputsForDisplay: piTx?.addressInfo.utxos
	}
  if ($sbtcConfig.userSettings.useOpDrop) {
    //testSignReveal(opDrop);
    const tx = piTx?.buildOpDropTransaction();
    currentTx = hex.encode(tx.toPSBT());
  } else {
    currentTx = hex.encode(piTx?.buildOpReturnTransaction().toPSBT());
  }
})
</script>
<div class="frame26">
  <div class="frame28457">
    <div class="text-hint">
      Sign and broadcast your transaction.
      {#if broadcasted}
      <p>Your transaction has been sent to the <a href={getExplorerUrl()} target="_blank" rel="noreferrer">Bitcoin network</a>.</p>
      <p>Once confirmed your sBTC will be minted to your Stacks Wallet. </p>
      {/if}
      {#if errorReason}<div class="text-warning-400"><p>{errorReason}</p></div>{/if}
    </div>
    <div class="frame28454">
      <div class="frame28455">
        <div class="frame25">
          <div class="frame29">
            <div id="address-field" class="text-address">{piTx.pegInData.sbtcWalletAddress}</div>
          </div>
        </div>
        <div class="frame28456">
          <div class="text-amount">
            <span id="amount-field" >{fmtSatoshiToBitcoin(piTx.pegInData.amount)}</span>
          </div>
          
          <div class="text-sats">
            <div>BITCOIN</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame28">
    <Button darkScheme={true} label={'Make changes'} target={'status-check'} on:clicked={updateTransaction}/>
    <Button darkScheme={false} label={'Sign'} target={'back'} on:clicked={requestSignPsbt}/>
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
  width: 100%;
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