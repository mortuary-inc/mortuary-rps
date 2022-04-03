import * as anchor from '@project-serum/anchor';
import * as web3 from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program } from '@project-serum/anchor';
import { SystemProgram } from '@solana/web3.js';

export async function airDrop(connection: web3.Connection, who: web3.PublicKey, amount: number) {
    let balance = await connection.getBalance(who);
    if (balance > amount) return;

    await connection.confirmTransaction(
        await connection.requestAirdrop(who, 2 * amount * web3.LAMPORTS_PER_SOL),
        "confirmed"
    );
}

export async function getATA(wallet: web3.PublicKey, mint: web3.PublicKey) {
    const adr = await web3.PublicKey.findProgramAddress([wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], ASSOCIATED_TOKEN_PROGRAM_ID)
    return adr[0];
}


export async function createAsh(connection: web3.Connection, ashCreator: web3.Keypair, quantity: number) {
    let ashMintToken = await Token.createMint(
        connection,
        ashCreator, // fee payer
        ashCreator.publicKey, // mintAuthority
        ashCreator.publicKey, // freezeAuthority
        0,
        TOKEN_PROGRAM_ID);

    // Create a $ASH account for admin and mint some token in it
    let adminAshAccount = await ashMintToken.createAssociatedTokenAccount(ashCreator.publicKey);
    await ashMintToken.mintTo(
        adminAshAccount,
        ashCreator.publicKey,
        [ashCreator],
        quantity
    );
    return ashMintToken;
}

export async function transfer(connection: web3.Connection, mint: web3.PublicKey, owner: web3.Keypair, destination: web3.PublicKey, amount: number) {
    let token = new Token(connection, mint, TOKEN_PROGRAM_ID, owner);
    var fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(owner.publicKey);
    var toTokenAccount = await token.getOrCreateAssociatedAccountInfo(destination);
    let res = await token.transfer(fromTokenAccount.address, toTokenAccount.address, owner, [], amount);
    return toTokenAccount;
}

export async function createNft(connection: web3.Connection, feePayer: web3.Keypair, owner: web3.PublicKey) {
    let authority = new web3.Keypair();
    let mint = await Token.createMint(
        connection,
        feePayer, // fee payer
        authority.publicKey, // mintAuthority
        authority.publicKey, // freezeAuthority
        0,
        TOKEN_PROGRAM_ID);
    let account = await mint.createAssociatedTokenAccount(owner);
    await mint.mintTo(
        account,
        authority.publicKey,
        [authority],
        1
    );
    mint.setAuthority(mint.publicKey, null, 'MintTokens', authority.publicKey, [authority]);
    return {
        token: mint,
        mint: mint.publicKey,
        ata: account
    };
}

export function disableLogging() {
    let consoleErr = console.error;
    let consoleLog = console.log;
    console.error = function () { };
    console.log = function () { };
    return [consoleErr, consoleLog]
}
export function restoreLogging(fns: Array<Function>) {
    console.error = fns[0] as any;
    console.log = fns[1] as any;
}

export const test_admin_key = web3.Keypair.fromSecretKey(
    Uint8Array.from([157, 23, 85, 183, 189, 94, 185, 169, 230, 161, 24, 115, 10, 14, 166, 254, 143, 209, 66, 16, 55, 118, 116, 170, 153, 173, 250, 195, 15, 75, 209, 89, 39, 4, 12, 31, 181, 223, 236, 78, 167, 236, 89, 242, 25, 201, 60, 173, 161, 138, 98, 135, 85, 239, 13, 47, 140, 54, 88, 134, 166, 200, 167, 167])
);


export async function getBalance(connection: web3.Connection, wallet: web3.PublicKey) {
    let balance = await connection.getBalance(wallet, "confirmed");
    return balance / web3.LAMPORTS_PER_SOL;
}
