import * as anchor from '@project-serum/anchor';
import { IdlAccounts, Program } from '@project-serum/anchor';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import { keccak_256 } from 'js-sha3';
import { Rps } from '../target/types/rps';


export let WSOL = new web3.PublicKey("So11111111111111111111111111111111111111112");

export let ASH_MINT = new web3.PublicKey('ASHTTPcMddo7RsYHEyTv3nutMWvK8S4wgFUy3seAohja');

export function setAshMint(m: web3.PublicKey) {
    ASH_MINT = m;
}

export async function getBalance(connection: web3.Connection, wallet: web3.PublicKey) {
    let balance = await connection.getBalance(wallet, "confirmed");
    return balance / web3.LAMPORTS_PER_SOL;
}

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: web3.PublicKey = new web3.PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export async function getAssociatedTokenAddress(
    walletAddress: web3.PublicKey,
    tokenMintAddress: web3.PublicKey
): Promise<web3.PublicKey> {
    return (await web3.PublicKey.findProgramAddress(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    ))[0];
}