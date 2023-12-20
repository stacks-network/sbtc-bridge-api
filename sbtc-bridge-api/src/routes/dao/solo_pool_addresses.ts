import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { c32address } from 'c32check';

export const REGTEST_NETWORK: typeof btc.NETWORK = { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0xc4 };

export function getNet(network:string) {
	let net = btc.TEST_NETWORK;
	if (network === 'devnet') net = REGTEST_NETWORK
	else if (network === 'mainnet') net = btc.NETWORK
	return net;
}

/**
 * See https://github.com/stacksgov/sips/blob/280291b43ba52948c2d1f597f7bf87b49390c19e/sips/sip-015/sip-015-network-upgrade.md?plain=1#L1754
 */
export function soloStackerAddresses (network:string):{ yAddress:string, nAddress:string} {
	const net = getNet(network);
    //const voteYes = new TextEncoder().encode('yes-nakamoto');
    //const voteNo = new TextEncoder().encode('no-nakamoto');
    //00000000000000007965732D6E616B616D6F746F - yes-nakamoto
    //0000000000000000006E6F2D6E616B616D6F746F - no-nakamoto
    const p2shObjY = btc.p2sh({type:'unknown', script: btc.Script.encode(['DUP', 'HASH160', hex.decode('00000000000000007965732D6E616B616D6F746F'), 'EQUALVERIFY', 'CHECKSIG'])}, net)
    const p2shObjN = btc.p2sh({type:'unknown', script: btc.Script.encode(['DUP', 'HASH160', hex.decode('0000000000000000006E6F2D6E616B616D6F746F'), 'EQUALVERIFY', 'CHECKSIG'])}, net)

    const yAddress = p2shObjY.address as string
    const nAddress = p2shObjN.address as string

    return { nAddress, yAddress }
}

export function poolStackerAddresses (network:string):{ yAddress:string, nAddress:string} {
	//ST000000003SCNSJTVK1DDGPTVVMDZW4Y8Y2
	//ST000000000DSQJTVK1DDGPTVVMDWPDT7M9

	//SP000000003SCNSJTVK1DDGPTVVMDW837741
	//SP000000000DSQJTVK1DDGPTVVMDYAQ9C2M

    const addr0 = (network === 'testnet') ? 26 : 22;
    let addr1 = '00000000000000007965732D6E616B616D6F746F'
    const yAddress = c32address(addr0, addr1);
    addr1 = '0000000000000000006E6F2D6E616B616D6F746F'
    const nAddress = c32address(addr0, addr1);
    return { nAddress, yAddress }
}
