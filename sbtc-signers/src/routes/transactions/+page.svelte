<script lang="ts">
import { onMount } from 'svelte';
import { addresses } from '$lib/stacks_connect'
import { COMMS_ERROR } from '$lib/utils.js'
import { compare, tsToDate, truncate, explorerBtcTxUrl, explorerBtcAddressUrl } from '$lib/utils'
import { fetchPeginsByStacksAddress, fetchPegins } from '$lib/bridge_api'
import type { PeginRequestI } from 'sbtc-bridge-lib' 
import { goto } from '$app/navigation'
import ExternalLinkIcon from '$lib/components/shared/ExternalLinkIcon.svelte';

// fetch/hydrate data from local storage 
let inited = false;
let peginRequests:Array<PeginRequestI>
let errorReason:string|undefined;
let myDepositsFilter:boolean;

const getReclaimUrl = (pegin:any) => {
    goto('/deposits/' + pegin._id)
}

const fetchDeposits = async (mine:boolean) => {
    myDepositsFilter = mine;
    if (myDepositsFilter) {
        peginRequests = await fetchPeginsByStacksAddress(addresses().stxAddress)
    } else {
        peginRequests = await fetchPegins()
    }
    peginRequests.sort(compare)
}

const fetchByStatus = (status:number) => {
    if (status === 1) {
        return 'not seen';
    } if (status === 2) {
        return 'seen onchain'
    } if (status === 3) {
        return 'revealed'
    }
}

const getTo = (pegin:PeginRequestI):string => {
    if (pegin && pegin.commitTxScript && pegin.commitTxScript.address) {
        return pegin.commitTxScript.address;
    } else {
        return 'unknown';
    }
}

onMount(async () => {
    try {
        await fetchDeposits(true);
        inited = true;
    } catch (err) {
        errorReason = COMMS_ERROR;
    }
})

</script>

{#if inited}
<div class="container">
    <div class="frame14">
        <div class="frame27"><span class="text-frame27">Transaction History</span></div>
        <div class="frame3">
            <div class="frame1"><span class="text-frame1">Deposits</span></div>
            <div class="table">
                <table class="table-auto">
                    <thead class="">
                      <tr class="">
                        <th>Amount sats</th>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                        <th>TxId</th>
                        <th>Status</th>
                        <th class="details-head">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {#each peginRequests as pegin}
                    {#if pegin.status >= 0}
                    <tr class="row">
                        <td>{#if pegin.status === 1}{pegin.amount}{:else}{pegin.amount}{/if}</td>
                        <td>{tsToDate(pegin.updated)}</td>
                        <td><a href={explorerBtcAddressUrl(pegin.fromBtcAddress)} target="_blank" rel="noreferrer">{truncate(pegin.fromBtcAddress)}</a></td>
                        <td><a href={explorerBtcAddressUrl(getTo(pegin))} target="_blank" rel="noreferrer">{truncate(pegin.commitTxScript?.address)}</a></td>
                        <td>
                            {#if !pegin.btcTxid}-{:else}
                                <a title="show in explorer" class="external" href={explorerBtcTxUrl(pegin.btcTxid)} target="_blank" rel="noreferrer">{truncate(pegin.btcTxid, 6)} <ExternalLinkIcon/></a>
                            {/if}
                        </td>
                        <td class="">
                            {#if pegin.status === 1}<span class="status status-1">pending</span>
                            {:else if pegin.status === 2}<span class="status status-2">committed</span>
                            {:else if pegin.status === 3}<span class="status status-3">reclaimed</span>
                            {:else if pegin.status === 4}<span class="status status-4">revealed</span>
                            {:else}{pegin.status}
                            {/if}
                        </td>
                        <td class="details"><a href="/" on:click|preventDefault={() => getReclaimUrl(pegin)}>View details</a></td>
                    </tr>
                    {/if}
                    {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px;

    width: 80%;
    height: auto;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.frame14 {
    box-sizing: border-box;
    /* Auto layout */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 40px;
    gap: 48px;
    height: auto;
    /* Base/Gray/1000 */
    background: #121212;
    /* Base/Gray/800 */
    border: 0.4px solid #535353;
    border-radius: 24px;
    /* Inside auto layout */
    flex: none;
    order: 0;
    flex-grow: 1;
}
.frame27 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 12px;

    width: 80%;
    height: 40px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
.text-frame27 {
    width: 540px;
    height: 36px;

    /* 3xl/Medium */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 500;
    font-size: 30px;
    line-height: 36px;
    /* identical to box height, or 120% */


    color: #FFFFFF;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}

.frame3 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 8px;

    width: auto;
    height: auto;

    /* Base/Gray/1000 */

    background: #121212;
    border-radius: 24px;

    /* Inside auto layout */

    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;
}
.frame1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px 0px 20px;
    gap: 8px;

    width: auto;
    height: 56px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.text-frame1 {
    width: auto;
    height: 36px;

    /* 3xl/Medium */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 500;
    font-size: 30px;
    line-height: 36px;
    /* identical to box height, or 120% */


    color: #FFFFFF;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
table {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;

    width: auto;
    height: auto;

    border-radius: 8px;

    /* Inside auto layout */

    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;
}
thead {
    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 0px;
    gap: 40px;

    width: auto;
    height: 44px;

    /* Base/Gray/200 */

    border-bottom: 1px solid #E9E9E9;

    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
    margin-bottom: 20px;
}
.top {
    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 0px;
    gap: 40px;

    width: 1200px;
    height: 44px;

    /* Base/Gray/200 */

    border-bottom: 1px solid #E9E9E9;

    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
.headings {
    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 0px;
    gap: 40px;

    width: 1200px;
    height: 44px;

    /* Base/Gray/200 */

    border-bottom: 1px solid #E9E9E9;

    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
th {
    width: 168px;
    height: 20px;
    text-align: start;

    /* sm/Black */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 900;
    font-size: 14px;
    line-height: 20px;
    /* identical to box height, or 143% */


    /* Main/White */

    color: #FFFFFF;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
td {
    width: 160px;
    height: 24px;

    /* base/Light */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 300;
    font-size: 16px;
    line-height: 24px;
    /* identical to box height, or 150% */


    /* Main/White */

    color: #FFFFFF;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.row {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    gap: 10px;

    width: auto;
    height: 38px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.status {
    box-sizing: border-box;
    text-transform: capitalize;
    padding: 2px 6px;
    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 450;
    font-size: 14px;
    line-height: 20px;
    /* identical to box height, or 143% */
    text-align: center;
    /* Base/Gray/200 */
    /* Inside auto layout */
}

.status-1 {
    border: 1px solid #E9E9E9;
    border-radius: 16px;
    color: #E9E9E9;
}
.status-2 {
    border: 1px solid #FEDB63;
    border-radius: 16px;
    color: #FEDB63;
}
.status-3 {
    border: 1px solid #66D2AE;
    border-radius: 16px;
    color: #66D2AE;
}
.status-4 {
    border: 1px solid #66D2AE;
    border-radius: 16px;
    color: #66D2AE;
}
.details {
    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    /* identical to box height, or 143% */

    text-align: right;

    /* Primary/500 */

    color: #ED693C;


    /* Inside auto layout */

    flex: none;
    order: 6;
    flex-grow: 0;
}
.details-head {
    width: 160px;
    height: 20px;

    /* sm/Black */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 900;
    font-size: 14px;
    line-height: 20px;
    /* identical to box height, or 143% */

    text-align: right;

    /* Main/White */

    color: #FFFFFF;


    /* Inside auto layout */

    flex: none;
    order: 6;
    flex-grow: 0;
}
.external {
    white-space: nowrap;
    font-size: smaller;
}
</style>