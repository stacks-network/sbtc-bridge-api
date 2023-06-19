<script lang="ts">
import { CONFIG } from '$lib/config';
import { goto } from "$app/navigation";
import { GradientButton } from 'flowbite-svelte'

const launchApp = () => {
    goto('/start?net=' + CONFIG.VITE_NETWORK)
}
</script>
<div class="max-w-screen-sm mx-10 p-5 border rounded-lg ">
    <div class="">
        <h1 class="text-4xl mb-3">Welcome!</h1>
        <p class="mb-3 ">
            This is the public <strong>sBTC Signer Portal</strong> developed by the Stacks community.
        </p>
        <p class="mb-3">
            This portal pulls data related to the sBTC signing process into a single place
            to provide transparency on signer activity and a health check on the sBTC Protocol.
        </p>
        <p class="mb-3">
            Signers can connect their real world identity via DNS and Social proofs to add 
            further credibility to the protocol. 
            This feature requires digital signatures and therefore connection to a Stacks Web Wallet. 
            <a class="text-hint-link" href="/wallet">Don’t have a wallet?</a>
        </p>
        <p class="mb-3">
            If you're looking to deposit or withdraw sBTC please visit the <a class="text-warning-700" href={CONFIG.VITE_URI_BRIDGE}>sBTC Bridge</a>.
        </p>

        <p class="mb-3">For more info about the sBTC Signer Portal, check <a class="text-warning-700" href="/faq">the FAQ page.</a></p>
        <GradientButton on:keydown on:click={() => launchApp()} btnClass="h-12 menu-btn-account rounded-md w-36 text-center" data-placement="left-start">
            <span class="inline-flex menu-btn-text-account flex-nowrap text-warning-400"><span class=" px-3">Launch app</span>
                <svg class="self-center" width="15" height="15" viewBox="0 0 10 8"  xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.28411 3.87507H6.98992H1.45825C1.4251 3.87507 1.39331 3.88824 1.36986 3.91168C1.34642 3.93512 1.33325 3.96692 1.33325 4.00007C1.33325 4.03322 1.34642 4.06501 1.36986 4.08845C1.39331 4.1119 1.4251 4.12507 1.45825 4.12507H6.98992H8.28411L7.32608 4.99519L5.52775 6.62853L5.52751 6.62874C5.51512 6.63998 5.50512 6.65359 5.49808 6.66877C5.49105 6.68395 5.48713 6.70039 5.48657 6.7171C5.486 6.73382 5.4888 6.75049 5.49479 6.76611C5.50078 6.78172 5.50985 6.79598 5.52146 6.80803C5.52146 6.80803 5.52146 6.80803 5.52146 6.80803L8.28411 3.87507ZM8.28411 3.87507L7.32608 3.00494M8.28411 3.87507L7.32608 3.00494M7.32608 3.00494L5.52775 1.37161L5.52751 1.37139M7.32608 3.00494L5.52751 1.37139M5.52751 1.37139C5.51513 1.36016 5.50512 1.34655 5.49808 1.33136C5.49105 1.31618 5.48713 1.29975 5.48657 1.28303C5.486 1.26631 5.4888 1.24965 5.49479 1.23403C5.50079 1.21841 5.50985 1.20415 5.52146 1.1921C5.53306 1.18005 5.54697 1.17045 5.56235 1.16388C5.57773 1.1573 5.59427 1.15388 5.611 1.15381C5.62773 1.15374 5.6443 1.15704 5.65974 1.16349C5.67517 1.16995 5.68915 1.17944 5.70085 1.19139L5.70924 1.19997L5.71803 1.20813L8.62998 3.91209C8.64112 3.92333 8.65003 3.93659 8.65622 3.95117L5.52751 1.37139ZM8.65623 3.95117C8.6628 3.96664 8.66619 3.98327 8.66619 4.00007C8.66619 4.01687 8.6628 4.0335 8.65623 4.04896V3.95117ZM8.65622 4.04896C8.65003 4.06355 8.64112 4.07681 8.62998 4.08805L8.65622 4.04896Z" fill="white" stroke="black"/>
                </svg>
    
            </span>
        </GradientButton>
    </div>
</div>
