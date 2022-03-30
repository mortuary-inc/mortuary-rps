import * as anchor from '@project-serum/anchor';
import { IdlAccounts, Program } from '@project-serum/anchor';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import { keccak_256 } from 'js-sha3';
import { Rps } from '../target/types/rps';


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
    console.log("hash:" + hasher.hex());
    return h;
}

export type GameAccount = IdlAccounts<Rps>['game'];
export type BankConfig = IdlAccounts<Rps>['bankConfig'];

export const RPS_PROGRAM_ID = new web3.PublicKey(
    "mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk"
);

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

export async function start(program: Program<Rps>,
    admin: web3.PublicKey,
    playerOne: web3.Keypair,
    ashMint: web3.PublicKey,
    playerOneAshToken: web3.PublicKey,
    amount: number,
    secret: string,
    shape: Shape,
) {

    let duration = 8 * 60 * 60;
    let game = new web3.Keypair();
    let [proceeds, pbump] = await getProceeds(game.publicKey);
    let hash = expand(secret, shape);

    let tx = await program.rpc.startGame(pbump, new anchor.BN(amount), hash, new anchor.BN(duration), {
        accounts: {
            admin: admin,
            game: game.publicKey,
            playerOne: playerOne.publicKey,
            playerOneTokenAccount: playerOneAshToken,
            proceeds: proceeds,
            proceedsMint: ashMint,
            rent: web3.SYSVAR_RENT_PUBKEY,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [playerOne, game],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");

    return { game: game.publicKey, proceeds: proceeds }
}

export async function match(program: Program<Rps>,
    game: web3.PublicKey,
    playerTwo: web3.Keypair,
    playerTwoAshToken: web3.PublicKey,
    shape: Shape,
) {

    let [proceeds, pbump] = await getProceeds(game);

    let tx = await program.rpc.matchGame(pbump, shape, {
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
    let [config] = await getBankConfigAddress(gameData.mint);
    let [proceeds, pbump] = await getProceeds(game);
    let bankConfig = (await program.account.bankConfig.fetch(config) as unknown) as BankConfig;

    let h = getSecretSmall(secret);
    let tx = await program.rpc.revealGame(pbump, shape, h, {
        accounts: {
            game: game,
            playerOne: playerOne.publicKey,
            playerTwo: gameData.playerTwo,
            playerOneTokenAccount: gameData.playerOneTokenAccount,
            playerTwoTokenAccount: gameData.playerTwoTokenAccount,
            proceeds: proceeds,
            bank: bankConfig.bank,
            config: config,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
        signers: [playerOne],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");
}


// export async function addPrize(program: Program<Draffle>,
//     admin: web3.Keypair,
//     raffle: web3.PublicKey,
//     prizeAmount: number,
//     nftAccount: web3.PublicKey,
//     nftMint: web3.PublicKey,
//     index: number,
// ) {

//     let [prize] = await getPrize(raffle, index);

//     let tx = await program.rpc.addPrize(index, new anchor.BN(prizeAmount),
//         {
//             accounts: {
//                 raffle: raffle,
//                 creator: admin.publicKey,
//                 from: nftAccount,
//                 prize: prize,
//                 prizeMint: nftMint,
//                 systemProgram: SystemProgram.programId,
//                 tokenProgram: TOKEN_PROGRAM_ID,
//                 rent: web3.SYSVAR_RENT_PUBKEY
//             },
//             signers: [admin],
//         });

//     await program.provider.connection.confirmTransaction(tx, "confirmed");
// }


// export async function buyTicket(program: Program<Draffle>,
//     buyer: web3.Keypair,
//     raffle: web3.PublicKey,
//     entrants: web3.PublicKey,
//     buyerAshAccount: web3.PublicKey,
//     count: number,
// ) {

//     let [proceeds] = await getProceeds(raffle);

//     let tx = await program.rpc.buyTickets(count,
//         {
//             accounts: {
//                 raffle: raffle,
//                 entrants: entrants,
//                 proceeds: proceeds,
//                 buyerTokenAccount: buyerAshAccount,
//                 buyerTransferAuthority: buyer.publicKey,
//                 tokenProgram: TOKEN_PROGRAM_ID,
//             },
//             signers: [buyer],
//         });

//     await program.provider.connection.confirmTransaction(tx, "confirmed");
// }

// export async function revealWinners(program: Program<Draffle>,
//     raffle: web3.PublicKey,
// ) {
//     let tx = await program.rpc.revealWinners(
//         {
//             accounts: {
//                 raffle: raffle,
//                 recentBlockhashes: web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
//             },
//             signers: [],
//         });

//     await program.provider.connection.confirmTransaction(tx, "confirmed");
// }


// export async function terminateRaffle(program: Program<Draffle>,
//     raffle: web3.PublicKey,
//     admin: web3.Keypair,
// ) {
//     let tx = await program.rpc.terminateRaffle(
//         {
//             accounts: {
//                 raffle: raffle,
//                 creator: admin.publicKey,
//             },
//             signers: [admin],
//         });

//     await program.provider.connection.confirmTransaction(tx, "confirmed");
// }


// export async function getWinningTicket(program: Program<Draffle>,
//     raffle: web3.PublicKey,) {

//     let raffleAccount = await program.account.raffle.fetch(raffle) as RaffleAccount;
//     let entrantAccount = await program.account.entrants.fetch(raffleAccount.entrants) as EntrantAccount;

//     let winners: { wallet: web3.PublicKey, ticket: number }[] = [];
//     let secret = raffleAccount.randomness as number[];
//     for (let i = 0; i < raffleAccount.totalPrizes; i++) {
//         const rand = expand(secret, i);
//         const windex = rand % entrantAccount.total;
//         winners.push({
//             wallet: entrantAccount.entrants[windex],
//             ticket: windex,
//         });
//     }
//     return winners;
// }


// export async function claimPrize(program: Program<Draffle>,
//     raffle: web3.PublicKey, payer: web3.Keypair, prizeMint: web3.PublicKey, winnerWallet: web3.PublicKey, prizeIndex: number, ticketIndex: number) {

//     let raffleAccount = await program.account.raffle.fetch(raffle) as RaffleAccount;
//     let [prizeAddr] = await getPrize(raffle, prizeIndex);

//     // let prizeInfo = await program.provider.connection.getParsedAccountInfo(prizeAddr);
//     // let data = (prizeInfo.value.data as web3.ParsedAccountData);
//     // let mint = data.parsed.info.mint as web3.PublicKey;

//     let connection = program.provider.connection;
//     let additionalTx: web3.TransactionInstruction[] = [];
//     let signers: web3.Signer[] = [];
//     const prizeTokenAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, prizeMint, winnerWallet);
//     const winnerAtaInfo = await connection.getAccountInfo(prizeTokenAccount);
//     if (!winnerAtaInfo || winnerAtaInfo.lamports <= 0) {
//         let tx = Token.createAssociatedTokenAccountInstruction(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             prizeMint,
//             prizeTokenAccount,
//             winnerWallet,
//             payer.publicKey
//         );
//         additionalTx.push(tx);
//         signers.push(payer);
//     }

//     let tx = await program.rpc.claimPrize(prizeIndex, ticketIndex,
//         {
//             accounts: {
//                 raffle: raffle,
//                 entrants: raffleAccount.entrants,
//                 prize: prizeAddr,
//                 winnerTokenAccount: prizeTokenAccount,
//                 tokenProgram: TOKEN_PROGRAM_ID,
//             },
//             signers: signers,
//             instructions: additionalTx
//         });

//     await program.provider.connection.confirmTransaction(tx, "confirmed");
// }