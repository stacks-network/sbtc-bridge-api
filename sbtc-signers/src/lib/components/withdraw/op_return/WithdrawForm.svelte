<script lang="ts">
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import { goto } from "$app/navigation";
import { CONFIG } from '$lib/config';
import Button from '$lib/components/shared/Button.svelte';
import DepositFormHeader from './WithdrawFormHeader.svelte';
import InputTextField from './InputTextField.svelte';
import InputNumberField from './InputNumberField.svelte';
import { sbtcConfig } from '$stores/stores'
import PegInTransaction from '$lib/domain/PegInTransaction';
import type { PegInTransactionI } from '$lib/domain/PegInTransaction';
import type { PeginRequestI, PegInData, CommitKeysI } from 'sbtc-bridge-lib' 
import { verifyStacksPricipal, verifyAmount, addresses } from '$lib/stacks_connect';
import { getTestAddresses, sbtcWallets } from 'sbtc-bridge-lib' 
import type { SbtcConfig } from '$types/sbtc_config';
import { makeFlash } from "$lib/stacks_connect";
import { fetchPeginById, doPeginScan } from "$lib/bridge_api";
import StatusCheck from "./StatusCheck.svelte";
import ServerError from "$lib/components/common/ServerError.svelte";
import { bitcoinBalanceFromMempool } from '$lib/utils'
import SignTransactionWeb from "./SignTransactionWeb.svelte";
import Banner from '$lib/components/shared/Banner.svelte';

const dispatch = createEventDispatcher();

let piTx:PegInTransactionI;
let pegin:PeginRequestI;
let balanceMsg = false;

const network = CONFIG.VITE_NETWORK;
let inited = false;
let errored = false;
let componentKey = 0;
let timeLineStatus = 1;
let peginRequest:PeginRequestI;

const input0Data = {
  field: 'btcAddress',
  label: 'Your Bitcoin Address',
  hint: 'Bitcoin will be sent from this account so it needs to cover the amount and tx fees.',
  resetValue: '',
  value: ''
}

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
const updateTransaction = () => {
  timeLineStatus = 1;
  dispatch('time_line_status_change', { timeLineStatus });
}

const doClicked = async (event:any) => {
  const button = event.detail;
  if (button.target === 'continue') {
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
  piTx = await PegInTransaction.create(network, commitAddresses());
  if (!piTx.pegInData) piTx.pegInData = {} as PegInData;
  const userBalance = $sbtcConfig.addressObject;
  if (!userBalance) throw new Error('Address data is missing ')
  if (!piTx.pegInData.stacksAddress && userBalance.stxAddress) piTx.pegInData.stacksAddress = userBalance.stxAddress;
  piTx.calculateFees(1);
  piTx.pegInData.amount = bitcoinBalanceFromMempool(userBalance?.cardinalInfo) - piTx.fee;
  if (piTx.pegInData.amount < 0) {
    piTx.pegInData.amount = 0;
    balanceMsg = true
  }
  input0Data.value = userBalance?.cardinal || '';
  input0Data.resetValue = userBalance?.cardinal || '';
  input0Data.hint = '';
  input1Data.value = piTx.pegInData.stacksAddress || '';
  input1Data.resetValue = input1Data.value;
  input2Data.value = piTx.pegInData.amount;
  input2Data.hint = 'Balance: ' + piTx.maxCommit() + ' sats - amount is adjusted for gas fees of ' + piTx.fee + ' sats';
  try {
    peginRequest = piTx.getOpDropPeginRequest();
  } catch (err) {
    piTx.commitKeys = commitAddresses(); // make sure the addresses are all hex encoded and serialisation safe.
    peginRequest = piTx.getOpDropPeginRequest();
  }
  peginRequest.originator = addresses().stxAddress; // retain the sender in case the address in UI changes.
  const conf:SbtcConfig = $sbtcConfig;
  dispatch('time_line_status_change', { timeLineStatus });
  conf.pegInTransaction = piTx;
  sbtcConfig.update(() => conf);
}

onDestroy(() => {
  stopTxWatcher();
});

onMount(async () => {
  try {
    await initComponent();
    //startTxWatcher()
    inited = true;
  } catch(err) {
    dispatch('time_line_status_change', { timeLineStatus: -1 });
    errored = true;
  }
})
</script>

{#if inited}
<div class="frame14">
  <DepositFormHeader />
  {#if timeLineStatus === 1}
  {#key componentKey}
  <InputTextField inputData={input0Data} on:updated={fieldUpdated}/>
  {#if balanceMsg}
  <Banner bannerType={'danger'} message={'Please transfer some BTC to your Web Wallet (above address) to continue or switch tx mode back to op_drop in settings '} />
  {:else}
  <InputTextField inputData={input1Data} on:updated={fieldUpdated}/>
  <InputNumberField inputData={input2Data} on:updated={fieldUpdated}/>
  <Button darkScheme={false} label={'Continue'} target={'continue'} on:clicked={doClicked}/>
  {/if}
  {/key}
  {:else if timeLineStatus === 2}
  <SignTransactionWeb {piTx} on:update_transaction={updateTransaction}/>
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
  border: 0.5px solid #b68f08;
  border-radius: 24px;
  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
</style>

