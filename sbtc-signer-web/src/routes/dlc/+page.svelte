<script lang="ts">
  import { Icon, ArrowSmallRight } from "svelte-hero-icons"
  import { CONFIG } from '$lib/config';
  import { a_primary } from '$lib/css_utils';
</script>

<div class="mx-auto flex flex-col justify-start w-full sm:max-w-4xl py-6 px-6 lg:px-8">
  <div class="sm:grid sm:grid-cols-1 sm:gap-2 space-y-2 sm:space-y-0">
    <div class="flex flex-col p-10 gap-6 items-start bg-gray-1000 border-[0.5px] border-gray-700 rounded-3xl">
      <h1 class="text-4xl font-normal">Welcome!</h1>
      <div>
        <p class="mb-3 ">
            The <strong>sBTC Signer's</strong> dashboard is developed and maintained by the Stacks Community.
        </p>
        <p class="mb-3">
            Our goal is to display the sBTC signing data to provide transparency 
            on signer activity and a health check on the sBTC Protocol.
        </p>
        <p class="mb-3">
          Owner's of DNS domains can vouch for individual Signers 
          by registering a <a class={a_primary} href="/web-did">did-web</a> document and serving it from their
          web server.<br/><br/>
          This feature requires digital signatures and therefore connection to a Stacks Web Wallet. 
          <a class={a_primary} href="/wallet">Don’t have a wallet?</a>
        </p>
        <p class="mb-3">
            Related applications;
        </p>
        <ul>
            <li>For deposits and withdrawals visit the <a class={a_primary} href={CONFIG.VITE_URI_BRIDGE}>sBTC Bridge</a>.</li>
            <li>For signer voting visit <a class={a_primary} href={CONFIG.VITE_URI_BRIDGE}>sBTC Signer Management Console</a>.</li>
        </ul>
      </div>
      <div class="flex items-center gap-2">
        <a href="/dashboard" class="inline-flex items-center gap-x-1.5 bg-primary-01 px-4 py-2 font-normal text-black rounded-xl border border-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50" role="button">
          Open dashboard
          <Icon src="{ArrowSmallRight}" mini class="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </a>

        <a href="/faq" class="inline-flex items-center gap-x-1.5 bg-transparent px-4 py-2 font-normal text-white rounded-xl border border-transparent hover:bg-white/[8%] focus:bg-white/[16%] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50" role="button">
          Learn more
        </a>
      </div>
    </div>
  </div>
</div>
