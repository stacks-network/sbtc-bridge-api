<script lang="ts">
import ChevronDown from "$lib/components/shared/ChevronDown.svelte";
import ChevronUp from "$lib/components/shared/ChevronUp.svelte";

let componentKey = 0;

const toggleAnswer = (index:number) => {
    questions[index].hidden = !questions[index].hidden
}
const toggleAll = () => {
    questions.map((q) => q.hidden = (componentKey % 2) === 1)
    componentKey++;
}
let questions = [
    {
        hidden: true,
        question: 'What is the purpose of the sBTC Signers Portal?',
        answer: 'This portal pulls data related to the sBTC signing process into a single place to provide transparency on signer activity and a health check on the sBTC Protocol.'
    },
    {
        hidden: true,
        question: 'What is sBTC?',
        answer: 'sBTC is Bitcoin wrapped in a token on the Stacks Blockchain.'
    },
    {
        hidden: true,
        question: 'Why convert my Bitcoin to sBTC?',
        answer: 'sBTC can be used in many ways on the Stacks Blockchain in DeFi protocols and NFT marketplaces or governance protocols. sBTC is more flexible and incurs lower transaction fees to use. '
    },
    {
        hidden: true,
        question: 'Can I get Bitcoin back from my sBTC?',
        answer: 'Yes - this is a decentralised two way bridge between the Bitcoin and Stacks Blockchains.'
    },
    {
        hidden: true,
        question: 'Where can I find out more about the sBTC Bridge and Signers Portal?',
        answer: 'For more info about the sBTC Bridge, check <a class="text-faq-link" href="/faq">the FAQ page.</a>'
    }
]
</script>
<div class="container">
    <div class="frame14">
        <div class="frame27">
            <span class="pointer title" on:keydown on:click={() => toggleAll()}>Frequently Asked Questions</span>
        </div>
        {#key componentKey}
        {#each questions as q, i}
        <div class="frame3">
            <div class="frame3-1">
                <div class="pointer faq-question" on:keydown on:click={() => toggleAnswer(i)}>
                    <span class="faq-question-title">{q.question}</span>
                    <span class="faq-question-hanndle">
                        {#if !q.hidden}
                            <ChevronDown />
                        {:else}
                            <ChevronUp />
                        {/if}
                    </span>
                </div>
                {#if !q.hidden}
                <div id={'answer-' + i} class="faq-answer">{@html q.answer}</div>
                {/if}
            </div>
        </div>
        {/each}
        {/key}
    </div>
</div>
<style>
.container {
    /* Container */
    /* Auto layout */
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px;
    width: 100%;
    height: auto;
    /* Inside auto layout */
    flex: none;
    order: 0;
    flex-grow: 0;
}
.frame14 {
/* Frame 14 */


    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 40px;
    gap: 48px;

    width: 100%;
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
    /* Frame 27 */


    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 12px;

    width: 100%;
    height: 40px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
.frame3 {
    /* Frame 3 */


    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 16px;

    width: 100%;
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
.title {
    /* Frequently Asked Questions */


    width: auto;
    height: 40px;

    /* 4xl/Medium */

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 500;
    font-size: 36px;
    line-height: 40px;
    /* identical to box height, or 111% */


    color: #FFFFFF;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;

}

.frame3-1 {
    /* Frame 1 */


    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px 0px 20px;
    gap: 24px;

    width: 100%;
    height: auto;

    /* Base/Gray/900 */

    border-bottom: 1px solid #404040;

    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}


.faq-question {
    /* Frame 28475 */


    /* Auto layout */

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
    gap: 8px;

    width: 100%;
    height: 48px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
.faq-question-title {
    /* What is the purpose of this bridge? */


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
.faq-answer {
    width: 682px;
    height: auto;
    /* xl/Light */
    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 300;
    font-size: 20px;
    line-height: 28px;
    /* or 140% */
    color: #FFFFFF;
    /* Inside auto layout */
    flex: none;
    order: 1;
    flex-grow: 0;
}
</style>
