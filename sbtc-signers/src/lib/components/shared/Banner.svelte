<script lang="ts">
import CheckIcon from './CheckIcon.svelte'
import CrossIcon from './CrossIcon.svelte'
import { onMount } from 'svelte';
import ExclamationIcon from './ExclamationIcon.svelte';

export let message:string;
export let bannerType = 'warning'
let bannerClassList = 'bg-success-400  badge'
let checked = true;
onMount(async () => {
    if (bannerType === 'warning') {
        bannerClassList = 'bg-warning-400 badge';
        checked = false;
    } else if (bannerType === 'danger') {
        bannerClassList = 'bg-error-400 badge';
        checked = false;
    }
})
</script>

<div class="frame28457">
    <div class="banner">
        <div class={bannerClassList} style="color: #000000;">
            <div class="">{#if checked}<CheckIcon />{:else}<ExclamationIcon />{/if}</div>            
            <div class="text-banner"><slot name="message">{message}</slot></div>
        </div>
    </div>
</div>

<style>
.frame28457 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 16px;

    width: 100%;
    min-height: 48px;


    /* Inside auto layout */

    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;
}
.banner {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px;

    width: 100%;
    min-height: 48px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
.badge {
    /* _Badge base */
    /* Auto layout */
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 12px 16px;
    gap: 8px;
    width: 100%;
    min-height: 48px;
    /* Additional/Success/400
    background: #66D2AE; */
    border-radius: 4px;
    /* Inside auto layout */
    flex: none;
    order: 0;
    flex-grow: 1;
}
.text-banner {
    width: 80%;
    min-height: 24px;

    /* base/Medium */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    /* identical to box height, or 150% */

    text-align: left;

    /* Base/Gray/1000 */

    color: #121212;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
</style>