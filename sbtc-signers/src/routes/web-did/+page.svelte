<script lang="ts">
import { onMount } from "svelte";
import RegisterIdentityForm from '$lib/components/register-proof/RegisterIdentityForm.svelte'
import Button from '$lib/components/shared/Button.svelte';
import TimeLine from '$lib/components/register-proof/TimeLine.svelte';
import { Tooltip } from 'flowbite-svelte';
import { Icon, InformationCircle } from "svelte-hero-icons"
import JSONTree from 'svelte-json-tree'
import { fetchWebDid } from '$lib/signers_api'

let inited = false;
let errored = false;
let timeLineStatus = 1;
let record:string;
let domainName:string;
let webDid:any;
let didMessage:string;

let componentKey = 0;

const timeLineUpdate = (e:any) => {
	timeLineStatus = e.detail.timeLineStatus;
  if (timeLineStatus === 3) {
    webDid = e.detail.webDid;
    didMessage = 'Web DID found! It verifies: ' + webDid?.verificationMethod[0].blockchainAccountId || ''
  }
	//signature = e.detail.sigData.signature;
	record = e.detail.record;
  //var data = JSON.stringify(record);
  downloadTextFile(record, 'did.json');


  domainName = e.detail.domainName;
	if (timeLineStatus < 0) {
		inited = false;
    	errored = true;
	} else {
		componentKey++;
	}
}
function downloadTextFile(text:string, name:string) {
  const a = document.createElement('a');
  const type = name.split(".").pop();
  a.href = URL.createObjectURL( new Blob([text], { type:`text/${type === "txt" ? "plain" : type}` }) );
  a.download = name;
  a.click();
}

const doClicked = async (event:any) => {
  webDid = await fetchWebDid(domainName);
  if (!webDid || webDid.length === 0) {
    didMessage = 'Unable to determine the domains verification for your stacks address - please try again soon.'
  }
  timeLineStatus = 3;
  componentKey++;
}

onMount(async () => {
  try {
    inited = true;
  } catch(err) {
    errored = true;
  }
})
</script>
<Tooltip class="w-80 !font-extralight !bg-black z-20" triggeredBy="#po-proofs">
  You'll need to add a txt record to the domain so please make sure this is possible.
</Tooltip>

<div class="mt-20 w-full mx-auto md:h-[calc(100vh-180px)] lg:h-[calc(100vh-180px)] flex flex-col justify-center">
	<div class="w-full mx-auto max-w-2xl">
    <div>
      <div class="flex flex-col p-2 gap-10 items-start bg-gray-1000">
        {#key componentKey}<TimeLine {timeLineStatus}/>{/key}
        <div class="mb-5 flex flex-col gap-y-2 w-full border border-gray-700 rounded-lg align-middle  text-sm justify-start px-5">
          <div class="flex w-full mt-5 gap-y-4 align-baseline items-center flex-wrap">
            <div class="grow">
              <span class="text-3xl font-medium">Verify a Signer Using Your DNS Domain</span>
            </div>
            <div id="po-proofs" class="cursor-pointer">
              <Icon src="{InformationCircle}" class="text-white w-6 h-6" mini aria-hidden="true" />
            </div>
          </div>
          {#if inited}
            {#if timeLineStatus === 1}
            <RegisterIdentityForm on:time_line_status_change={timeLineUpdate}/>
            {:else if timeLineStatus === 2}
            <p class="text-lg">Paste the download (did.json) in your web server at;
              <br/><br/>
              <code>https://{domainName}/.well-known/did.json</code>
            </p>
            <div class="bg-white border rounded-lg p-5 text-2xl" style="--json-tree-string-color: blue; --json-tree-font-size: 18px;">
              <JSONTree value={JSON.parse(record)}/>
            </div>
            <div class="my-5"><Button darkScheme={false} label={'Verify'} target={'verify'} on:clicked={doClicked}/></div>
            <!-- <UpdateDnsRecord {record} on:back={() => {timeLineStatus = 1; componentKey++ } }/> -->
            {:else if timeLineStatus === 3}
              <p class="text-lg">Reading did web file from;
                <br/><br/>
                <code>https://{domainName}/.well-known/did.json</code>
              </p>
              {#if webDid}
              <div class="bg-white border rounded-lg p-5 text-2xl" style="--json-tree-string-color: blue; --json-tree-font-size: 18px;">
                <JSONTree value={webDid}/>
              </div>
              {/if}
              <div class="my-5">{didMessage}</div>
              <!-- <UpdateDnsRecord {record} on:back={() => {timeLineStatus = 1; componentKey++ } }/> -->
              {/if}
          {/if}
        </div>
      </div>
      </div>
  </div>
</div>
