import * as anchor from '@project-serum/anchor';
import * as web3 from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { IdlAccounts, Program } from '@project-serum/anchor';
import { SystemProgram } from '@solana/web3.js';
import { Rps } from '../target/types/rps';
import { getATA } from './utils';
import { keccak_256 } from 'js-sha3';

// Output is only u32, so can be a number
export function expand(randomValue: number[], n: number): number {
    const hasher = keccak_256.create();
    hasher.update(new Uint8Array(randomValue));
    hasher.update(new anchor.BN(n).toArrayLike(Buffer, 'le', 4));
    return new anchor.BN(hasher.digest().slice(0, 4), 'le').toNumber();
}

// export type RaffleAccount = IdlAccounts<Draffle>['raffle'];
// export type EntrantAccount = IdlAccounts<Draffle>['entrants'];

export const RPS_PROGRAM_ID = new web3.PublicKey(
    "mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk"
);

// export async function getProceeds(raffle: web3.PublicKey) {
//     let p = await web3.PublicKey.findProgramAddress([raffle.toBuffer(), Buffer.from("proceeds"),], DRAFFLE_PROGRAM_ID)
//     return p;
// }
// export async function getPrize(raffle: web3.PublicKey, index: number) {
//     let indexBuf = Buffer.alloc(4)
//     indexBuf.writeUIntLE(index, 0, 4);
//     let p = await web3.PublicKey.findProgramAddress([raffle.toBuffer(), Buffer.from("prize"), indexBuf,], DRAFFLE_PROGRAM_ID)
//     return p;
// }

export async function initialize(program: Program<Rps>,
    initiator: web3.Keypair,
) {

    let tx = await program.rpc.initialiseController({
        accounts: {
            controllerAccount: initiator.publicKey,
            user: initiator.publicKey,
            systemProgram: SystemProgram.programId,
        },
        signers: [initiator],
    });

    await program.provider.connection.confirmTransaction(tx, "confirmed");

    return { k: initiator.publicKey }
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