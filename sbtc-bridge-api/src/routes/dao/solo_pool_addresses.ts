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
    let yAddress = '11111111111111X6zHB1bPW6NJxw6'
    let nAddress = '1111111111111117Crbcbt8W5dSU7'
    if (network !== 'mainnet') {
        const p2shObjY = btc.p2sh({type:'unknown', script: btc.Script.encode(['DUP', 'HASH160', hex.decode('00000000000000007965732D6E616B616D6F746F'), 'EQUALVERIFY', 'CHECKSIG'])}, net)
        const p2shObjN = btc.p2sh({type:'unknown', script: btc.Script.encode(['DUP', 'HASH160', hex.decode('0000000000000000006E6F2D6E616B616D6F746F'), 'EQUALVERIFY', 'CHECKSIG'])}, net)
    
        yAddress = p2shObjY.address as string
        nAddress = p2shObjN.address as string
    }

    return { nAddress, yAddress }
}

export function poolStackerAddresses (network:string):{ yAddress:string, nAddress:string} {
    let yAddress = 'SP00000000000003SCNSJTCSE62ZF4MSE'
    let nAddress = 'SP00000000000000DSQJTCSE63RMXHDP'
    if (network !== 'mainnet') {
        const addr0 = (network === 'testnet') ? 26 : 22;
        let addr1 = '00000000000000007965732D6E616B616D6F746F'
        yAddress = c32address(addr0, addr1);
        addr1 = '0000000000000000006E6F2D6E616B616D6F746F'
        nAddress = c32address(addr0, addr1);
    }
    return { nAddress, yAddress }
}
