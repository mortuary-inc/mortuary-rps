import * as anchor from '@project-serum/anchor';
import { IdlAccounts, Program } from '@project-serum/anchor';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import { keccak_256 } from 'js-sha3';
import { Rps } from '../target/types/rps';
import { ASH_MINT, WSOL } from './accounts';
import { getATA } from './utils';


export function expand(secret: string, shape: number) {
    const secretSmall = getSecretSmall(secret);
    const hasher = keccak_256.create();
    hasher.update(secretSmall);
    hasher.update([shape]);
    let h = hasher.digest();
    return h;
}

export function getSecretSmall(secret: string) {
    const hasher = keccak_256.create();
    hasher.update(secret);
    let h = hasher.digest();
    return h;
}

export type GameAccount = IdlAccounts<Rps>['game'];
export type BankConfig = IdlAccounts<Rps>['bankConfig'];
export type GameHistory = IdlAccounts<Rps>['gameHistory'];

export const RPS_PROGRAM_ID = new web3.PublicKey(
    "mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk"
);

export async function getGame(gameId: web3.PublicKey) {
    let p = await web3.PublicKey.findProgramAddress([Buffer.from("game"), gameId.toBuffer()], RPS_PROGRAM_ID)
    return p;
}
export async function getHistory(game: web3.PublicKey) {
    let p = await web3.PublicKey.findProgramAddress([Buffer.from("history"), game.toBuffer()], RPS_PROGRAM_ID)
    return p;
}
export async function getProceeds(game: web3.PublicKey) {
    let p = await web3.PublicKey.findProgramAddress([game.toBuffer(), Buffer.from("proceeds"),], RPS_PROGRAM_ID)
    return p;
}

export async function getBankConfigAddress(mint: web3.PublicKey) {
    const adr = await web3.PublicKey.findProgramAddress([mint.toBuffer(), Buffer.from("bank"),], RPS_PROGRAM_ID)
    return adr;
};


export enum Shape {
    Paper = 0,
    Scissor = 1,
    Rock = 2,
}


export async function initBank(program: Program<Rps>,
    admin: web3.Keypair,
    ashMint: web3.PublicKey,
) {
    let bank = new web3.Keypair();

    let connection = program.provider.connection;
    const createBankAccountIx = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span),
        fromPubkey: admin.publicKey,
        newAccountPubkey: bank.publicKey,
    });
    const initBankAccountIx = Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, ashMint, bank.publicKey, admin.publicKey);
    const [bankConfigPubkey, bump] = await getBankConfigAddress(ashMint);

    let tx = await program.rpc.initBank(bump, {
        accounts: {
            bankConfig: bankConfigPubkey,
            admin: admin.publicKey,
            bank: bank.publicKey,
            bankMint: ashMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [admin, bank],
        instructions: [createBankAccountIx, initBankAccountIx]
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");

    return { bank: bank }
}

export async function withdraw(program: Program<Rps>,
    admin: web3.Keypair,
    bank: web3.PublicKey,
    ashMint: web3.PublicKey) {

    const [bankConfigPubkey] = await getBankConfigAddress(ashMint);
    const adminAshATA = await getATA(admin.publicKey, ashMint);

    let tx = await program.rpc.withdraw({
        accounts: {
            admin: admin.publicKey,
            bank: bank,
            bankConfig: bankConfigPubkey,
            receptor: adminAshATA,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [admin]
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");
}

export async function start(program: Program<Rps>,
    admin: web3.PublicKey,
    playerOne: web3.Keypair,
    mint: web3.PublicKey,
    playerOneAshToken: web3.PublicKey,
    amount: number,
    secret: string,
    shape: Shape,
    duration: number,
) {

    let gameId = new web3.Keypair();
    let [game] = await getGame(gameId.publicKey);
    let [proceeds] = await getProceeds(game);
    let hash = expand(secret, shape);

    if (mint.toBase58() == WSOL.toBase58()) {
        playerOneAshToken = await getATA(playerOne.publicKey, WSOL);
        amount = amount * web3.LAMPORTS_PER_SOL;
    }

    let tx = await program.rpc.startGame(new anchor.BN(amount), hash, new anchor.BN(duration), {
        accounts: {
            admin: admin,
            game: game,
            gameId: gameId.publicKey,
            playerOne: playerOne.publicKey,
            playerOneTokenAccount: playerOneAshToken,
            proceeds: proceeds,
            proceedsMint: mint,
            rent: web3.SYSVAR_RENT_PUBKEY,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [playerOne],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");

    return { game: game, proceeds: proceeds }
}

export async function match(program: Program<Rps>,
    game: web3.PublicKey,
    mint: web3.PublicKey,
    playerTwo: web3.Keypair,
    playerTwoAshToken: web3.PublicKey,
    shape: Shape,
) {

    let [proceeds] = await getProceeds(game);

    if (mint.toBase58() == WSOL.toBase58()) {
        playerTwoAshToken = await getATA(playerTwo.publicKey, WSOL);
    }

    let tx = await program.rpc.matchGame(shape, {
        accounts: {
            game: game,
            playerTwo: playerTwo.publicKey,
            playerTwoTokenAccount: playerTwoAshToken,
            proceeds: proceeds,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [playerTwo],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");
}

export async function reveal(program: Program<Rps>,
    game: web3.PublicKey,
    playerOne: web3.Keypair,
    shape: Shape,
    secret: string,
) {

    let gameData = (await program.account.game.fetch(game) as unknown) as GameAccount;
    let [config] = await getBankConfigAddress(gameData.mint.toBase58() == WSOL.toBase58() ? ASH_MINT : gameData.mint);
    let [proceeds] = await getProceeds(game);
    let bankConfig = (await program.account.bankConfig.fetch(config) as unknown) as BankConfig;
    let [history] = await getHistory(game);

    let h = getSecretSmall(secret);
    let tx = await program.rpc.revealGame(shape, h, {
        accounts: {
            game: game,
            playerOne: playerOne.publicKey,
            playerTwo: gameData.playerTwo,
            playerOneTokenAccount: gameData.playerOneTokenAccount,
            playerTwoTokenAccount: gameData.playerTwoTokenAccount,
            proceeds: proceeds,
            bank: bankConfig.bank,
            config: config,
            history: history,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [playerOne],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");
}

// if game as expired, player 1 can come and close it to recover his token
export async function recover(program: Program<Rps>,
    game: web3.PublicKey, payer: web3.Keypair, payerTokenAccount: web3.PublicKey,
) {

    let gameData = (await program.account.game.fetch(game) as unknown) as GameAccount;
    let [config] = await getBankConfigAddress(gameData.mint.toBase58() == WSOL.toBase58() ? ASH_MINT : gameData.mint);
    let [proceeds] = await getProceeds(game);

    let tx = await program.rpc.recover({
        accounts: {
            payer: payer.publicKey,
            game: game,
            payerTokenAccount: payerTokenAccount,
            proceeds: proceeds,
            config: config,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [payer],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");
}

// if player doesn't come back after xx seconds, anyone can close the game (p2 win)
export async function terminate(program: Program<Rps>,
    game: web3.PublicKey, payer: web3.Keypair,
) {

    let gameData = (await program.account.game.fetch(game) as unknown) as GameAccount;
    let [config] = await getBankConfigAddress(gameData.mint.toBase58() == WSOL.toBase58() ? ASH_MINT : gameData.mint);
    let [proceeds] = await getProceeds(game);
    let bankConfig = (await program.account.bankConfig.fetch(config) as unknown) as BankConfig;
    let [history] = await getHistory(game);

    let tx = await program.rpc.terminateGame({
        accounts: {
            payer: payer.publicKey,
            game: game,
            playerTwo: gameData.playerTwo,
            playerTwoTokenAccount: gameData.playerTwoTokenAccount,
            proceeds: proceeds,
            bank: bankConfig.bank,
            config: config,
            history: history,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [payer],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");
}


export async function loadHistory(program: Program<Rps>,
    player: web3.PublicKey,
) {
    let filter1: web3.MemcmpFilter = {
        memcmp: {
            offset: 8,
            bytes: player.toBase58(),
        }
    }
    let filter2: web3.MemcmpFilter = {
        memcmp: {
            offset: 40,
            bytes: player.toBase58(),
        }
    }
    let [r1, r2] = await Promise.all([
         program.account.gameHistory.all([filter1]),
         program.account.gameHistory.all([filter2]),
    ]);
    let res1 = r1.map((pa) => pa.account as GameHistory);
    let res2 = r2.map((pa) => pa.account as GameHistory);
    return res1.concat(res2);
}