<script lang="ts">
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import { goto } from "$app/navigation";
import { CONFIG } from '$lib/config';
import Button from '$lib/components/shared/Button.svelte';
import WithdrawFormHeader from './WithdrawFormHeader.svelte';
import InputTextField from './InputTextField.svelte';
import InputNumberField from './InputNumberField.svelte';
import { sbtcConfig } from '$stores/stores'
import PegInTransaction from '$lib/domain/PegInTransaction';
import type { PegInTransactionI } from '$lib/domain/PegInTransaction';
import type { PeginRequestI, PegInData, CommitKeysI } from 'sbtc-bridge-lib' 
import { verifyStacksPricipal, verifyAmount, addresses } from '$lib/stacks_connect';
import { getTestAddresses, sbtcWallets } from 'sbtc-bridge-lib' 
import type { SbtcConfig } from '$types/sbtc_config';
import ScriptHashAddress from './ScriptHashAddress.svelte';
import { makeFlash } from "$lib/stacks_connect";
import { fetchPeginById, savePeginCommit, fetchPeginsByStacksAddress, doPeginScan } from "$lib/bridge_api";
import StatusCheck from "./StatusCheck.svelte";
import ServerError from "../common/ServerError.svelte";

const dispatch = createEventDispatcher();

let piTx:PegInTransactionI;
let pegin:PeginRequestI;

const network = CONFIG.VITE_NETWORK;
let inited = false;
let errored = false;
let componentKey = 0;
let timeLineStatus = 1;
let peginRequest:PeginRequestI;

const input1Data = {
  field: 'address',
  label: 'Stacks or Contract Address',
  hint: 'sBTC will be minted to this account or contract.',
  resetValue: '',
  value: ''
}

const input2Data = {
  field: 'amount',
  label: 'Amount (satoshis)',
  hint: '',
  resetValue: undefined,
  value: 10000
}

const fieldUpdated = async (event:any) => {
  const conf:SbtcConfig = $sbtcConfig;
  const input = event.detail;
  if (input.field === 'address') {
    verifyStacksPricipal(input.value);
    piTx.pegInData.stacksAddress = input.value;
  } else if (input.field === 'amount') {
    verifyAmount(input.value);
    piTx.pegInData.amount = input.value;
  }
  conf.pegInMongoId = undefined;
  conf.pegInTransaction = piTx;
  sbtcConfig.update(() => conf);
  initComponent();
  componentKey++;
}

let txWatcher:NodeJS.Timer;
const startTxWatcher = async () => {
  const mongoId = $sbtcConfig.pegInMongoId;
  if (!mongoId) return;
  txWatcher = setInterval(async function () {
    pegin = await fetchPeginById(mongoId);
    if (pegin.status === 2) {
      timeLineStatus = 3;
      dispatch('time_line_status_change', { timeLineStatus });
      stopTxWatcher()
    }
	}, 60000)
}
const stopTxWatcher = () => {
  if (txWatcher) clearInterval(txWatcher)
}

const doClicked = async (event:any) => {
  const button = event.detail;
  if (button.target === 'showInvoice') {
    try {
      verifyAmount(piTx.pegInData.amount);
      //stopTxWatcher()
      timeLineStatus = 2;
      dispatch('time_line_status_change', { timeLineStatus });
    } catch(err:any) {
      makeFlash(document.getElementById(input2Data.field))
    }
  } else if (button.target === 'back') {
    // Delete the current invoice and start a new one ?
    // const mongoId = $sbtcConfig.pegInMongoId;
    // if (mongoId) {
    // await deletePeginById(mongoId);
    // const conf:SbtcConfig = $sbtcConfig;
    // conf.pegInMongoId = undefined;
    // sbtcConfig.update(() => conf);
    // initComponent()
    timeLineStatus = 1;
    dispatch('time_line_status_change', { timeLineStatus });
  } else if (button.target === 'status-check') {
    await doPeginScan();
    if ($sbtcConfig.pegInMongoId) pegin = await fetchPeginById($sbtcConfig.pegInMongoId);
    timeLineStatus = 3;
    dispatch('time_line_status_change', { timeLineStatus });
  } else if (button.target === 'transaction-history') {
		goto('/transactions')
  }
  //updateConfig();
}

const commitAddresses = ():CommitKeysI => {
  const addrs = addresses()
  const stacksAddress = (piTx && piTx.pegInData?.stacksAddress) ? piTx.pegInData?.stacksAddress : addrs.stxAddress;
  let fromBtcAddress = addrs.cardinal; //$sbtcConfig.peginRequest.fromBtcAddress || addrs.ordinal;
  let sbtcWalletAddress = $sbtcConfig.sbtcContractData.sbtcWalletAddress as string;
  let testAddrs;
  if ($sbtcConfig.userSettings.testAddresses) {
    testAddrs = getTestAddresses(CONFIG.VITE_NETWORK);
  }
  //const xyWebWalletPubKey = hex.decode(addrs.btcPubkeySegwit1);
  //let xOnlyPubKey = hex.encode(xyWebWalletPubKey.subarray(1));
  //const net = (network === 'testnet') ? btc.TEST_NETWORK : btc.NETWORK;
  //const outTr = { type: 'tr', pubkey: hex.decode(addrs.btcPubkeySegwit1) }
  //const addrO = btc.Address(net).encode(outTr);
  //const addrScript = btc.Address(net).decode(addrs.ordinal);
  //if (addrScript.type !== 'tr') throw new Error('Expecting taproot address')
  //const xOnlyPubKey = hex.encode(addrScript.pubkey)
  return {
    fromBtcAddress,
    sbtcWalletAddress,
    revealPub: $sbtcConfig.keys.deposits.revealPubKey, //(testAddrs) ? testAddrs.revealPub : sbtcWallet.pubKey,
    reclaimPub: $sbtcConfig.keys.deposits.reclaimPubKey,
    stacksAddress
  }
}

/**
 * 1. Create or hydrate a deposit object.
 * 2. Check server for an existing invoice correspondng to the hydrated deposit
 */
const initComponent = async () => {
  if (!piTx) {
    if ($sbtcConfig.pegInTransaction) {
      piTx = PegInTransaction.hydrate($sbtcConfig.pegInTransaction);
    } else {
      piTx = await PegInTransaction.create(network, commitAddresses());
    }
  }
  if (!piTx.pegInData) piTx.pegInData = {} as PegInData;
  if (!piTx.pegInData.stacksAddress && addresses().stxAddress) piTx.pegInData.stacksAddress = addresses().stxAddress;
  piTx.pegInData.amount = (piTx.pegInData.amount > 0) ? piTx.pegInData.amount : 0;
  input1Data.value = piTx.pegInData.stacksAddress || '';
  input1Data.resetValue = input1Data.value;
  input2Data.value = piTx.pegInData.amount;
  try {
    peginRequest = piTx.getOpDropPeginRequest();
  } catch (err) {
    piTx.commitKeys = commitAddresses(); // make sure the addresses are all hex encoded and serialisation safe.
    peginRequest = piTx.getOpDropPeginRequest();
  }
  peginRequest.originator = addresses().stxAddress; // retain the sender in case the address in UI changes.
  
  const conf:SbtcConfig = $sbtcConfig;
  if ($sbtcConfig.pegInMongoId) {
    pegin = await fetchPeginById($sbtcConfig.pegInMongoId);
    if (!pegin) {
      conf.pegInMongoId = undefined;
      sbtcConfig.update(() => conf);
      console.log('Unable to fetch - not found');
      location.reload();
    }
    if (pegin.status === 1) {
      timeLineStatus = 2;
    } else if (pegin.status === 2) {
      timeLineStatus = 3;
    }
  } else {
    //if (peginRequest && peginRequest.commitTxScript && peginRequest.commitTxScript.script && peginRequest.commitTxScript.script.length > 0) 
    try {
      const newPegin = await savePeginCommit(peginRequest)
      if (!newPegin) throw new Error('Unable to save - already exists');
      if (newPegin.insertedId) {
        pegin = peginRequest;
        pegin._id = newPegin.insertedId;
      } else {
        pegin = newPegin;
      }     
    } catch(err) {
      const pegins = await fetchPeginsByStacksAddress(peginRequest.originator);
      if (!pegins || pegins.length === 0) throw new Error('Pegin requestion is both found and not found');
      const peginList = pegins.find((p) => p.amount === peginRequest.amount)
      if (peginList) {
        pegin = peginList;
      } else {
        throw new Error('Pegin requestion is both found and not found');
      }
    }
  }
  dispatch('time_line_status_change', { timeLineStatus });
  conf.pegInMongoId = pegin._id
  conf.pegInTransaction = piTx;
  sbtcConfig.update(() => conf);
}

onDestroy(() => {
  stopTxWatcher();
});

onMount(async () => {
  try {
    await initComponent();
    startTxWatcher()
    inited = true;
  } catch(err) {
    dispatch('time_line_status_change', { timeLineStatus: -1 });
    errored = true;
  }
})
</script>

{#if inited}
<div class="frame14">
  <WithdrawFormHeader />
  {#if timeLineStatus === 1}
  {#key componentKey}
  <InputTextField inputData={input1Data} on:updated={fieldUpdated}/>
  <InputNumberField inputData={input2Data} on:updated={fieldUpdated}/>
  <Button darkScheme={false} label={'Show Invoice / QR code'} target={'showInvoice'} on:clicked={doClicked}/>
  {/key}
  {:else if timeLineStatus === 2}
  <ScriptHashAddress peginRequest={pegin} on:clicked={doClicked}/>
  {:else if timeLineStatus === 3}
  <StatusCheck {pegin} on:clicked={doClicked}/>
  {/if}
</div>
{:else if errored}
<ServerError />
{/if}

<style>
.frame14 {
  /* Frame 14 */
  box-sizing: border-box;
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px;
  gap: 24px;
  width: 680px;
  height: auto;
  /* Base/Gray/1000 */
  background: #121212;
  /* Secondary/Blue/400 */
  border: 0.5px solid #ADBCF6;
  border-radius: 24px;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
</style>

