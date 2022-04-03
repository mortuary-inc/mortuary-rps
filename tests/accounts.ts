import * as web3 from '@solana/web3.js';


export let WSOL = new web3.PublicKey("So11111111111111111111111111111111111111112");

export let ASH_MINT = new web3.PublicKey('ASHTTPcMddo7RsYHEyTv3nutMWvK8S4wgFUy3seAohja');

export function setAshMint(m: web3.PublicKey) {
    ASH_MINT = m;
}

