<script lang="ts">
</script>
  
<div class="container">
    <div class="frame14">
        <div class="frame24">
            <h1 class="title">Server Error!</h1>
        </div>
        <div class="frame26">
                <div class="hint">
                <p class="text-hint">
                    Mainnet is not yet fully supported.
                </p>
                <p class="text-hint">
                    Please use the settings menu to switch to testnet.
                </p>
                <p class="text-hint-light">For more info about the sBTC Bridge, check <a class="text-hint-link" href="/faq">the FAQ page.</a></p>
            </div>
        </div>
    </div>
</div>

<style>
.text-hint-link {
    color: #ED693C;
}
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
    gap: 40px;

    height: auto;

    /* Base/Gray/1000 */

    background: #121212;
    /* Base/Gray/700 */

    border: 0.5px solid #616161;
    border-radius: 24px;

    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.frame24 {
    width: auto;
    height: 40px;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.title {
    /* Welcome! */
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
}
.text-hint {
    margin: 5px 0 10px 0;
}
.hint {
    min-width: 400px;
    max-width: 600px;
    height: 172px;
    /* xl/Light */
    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 300;
    font-size: 20px;
    line-height: 28px;
    /* or 140% */
    /* Base/Gray/200 */
    color: #E9E9E9;
    /* Inside auto layout */
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
}
.btn {
    box-sizing: border-box;
    /* Auto layout */
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 16px;
    gap: 4px;
    width: 129px;
    height: 36px;
    /* Gradients/Primary/01 */
    background: linear-gradient(306.12deg, #ED693C 21.1%, #FDC60B 84.08%);
    /* Primary/600 */
    border: 1px solid #DA6137;
    border-radius: 12px;
    /* Inside auto layout */
    flex: none;
    order: 2;
    flex-grow: 0;
}
.btn-text {
    width: 73px;
    height: 20px;

    font-family: 'Circular Std';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    /* identical to box height, or 143% */

    letter-spacing: -0.02em;

    /* Base/Black */

    color: #000000;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
}
.btn-icon {
    width: 20px;
    height: 20px;


    /* Inside auto layout */

    flex: none;
    order: 1;
    flex-grow: 0;
}
</style>
