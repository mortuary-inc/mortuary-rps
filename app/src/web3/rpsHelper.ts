import * as anchor from '@project-serum/anchor';
import { IdlAccounts, Program } from '@project-serum/anchor';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import * as web3 from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import { keccak_256 } from 'js-sha3';
import { Rps } from './rps';
import rpsIdl from './rps.json';
import { ASH_MINT, BANK, BANK_CONFIG, WSOL } from './accounts';

export async function getATA(wallet: web3.PublicKey, mint: web3.PublicKey) {
  const adr = await web3.PublicKey.findProgramAddress(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return adr[0];
}

export function expand(secret: string, shape: number) {
  const secretSmall = getSecretSmall(secret);
  const hasher = keccak_256.create();
  hasher.update(secretSmall);
  hasher.update([shape]);
  let h = hasher.digest();
  return h;
}

function hashEquals(h1: number[], h2: number[]) {
  if (h1.length !== h2.length) return false;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) return false;
  }
  return true;
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

export const RPS_PROGRAM_ID = new web3.PublicKey('mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk');

export const leaked_key = web3.Keypair.fromSecretKey(
  Uint8Array.from([
    49, 11, 246, 59, 46, 84, 125, 62, 13, 11, 130, 173, 218, 112, 28, 55, 177, 66, 170, 123, 171,
    59, 161, 136, 127, 234, 132, 17, 181, 129, 38, 121, 7, 36, 48, 121, 211, 149, 118, 43, 174, 82,
    41, 103, 62, 247, 73, 190, 78, 237, 161, 148, 229, 170, 88, 220, 8, 229, 58, 107, 197, 240, 24,
    218,
  ])
);
export const fake_wallet = new anchor.Wallet(leaked_key);

export async function loadRpsProgram(connection: web3.Connection, wallet: AnchorWallet) {
  const provider = new anchor.Provider(connection, wallet, {});
  const idl = rpsIdl as any;
  const program = new anchor.Program(idl, RPS_PROGRAM_ID, provider) as Program<Rps>;
  return program;
}

export async function getGame(gameId: web3.PublicKey) {
  let p = await web3.PublicKey.findProgramAddress(
    [Buffer.from('game'), gameId.toBuffer()],
    RPS_PROGRAM_ID
  );
  return p;
}
export async function getHistory(game: web3.PublicKey) {
  let p = await web3.PublicKey.findProgramAddress(
    [Buffer.from('history'), game.toBuffer()],
    RPS_PROGRAM_ID
  );
  return p;
}
export async function getProceeds(game: web3.PublicKey) {
  let p = await web3.PublicKey.findProgramAddress(
    [game.toBuffer(), Buffer.from('proceeds')],
    RPS_PROGRAM_ID
  );
  return p;
}
export async function getBankConfigAddress(mint: web3.PublicKey) {
  const adr = await web3.PublicKey.findProgramAddress(
    [mint.toBuffer(), Buffer.from('bank')],
    RPS_PROGRAM_ID
  );
  return adr;
}

export enum Shape {
  Paper = 0,
  Scissor = 1,
  Rock = 2,
}

export function shapeToString(shape: Shape) {
  if(shape === Shape.Paper) return "Paper/Plasma";
  if(shape === Shape.Scissor) return "Scissor/Sniper";
  if(shape === Shape.Rock) return "Rock/Rocket";
  return "";
}

export async function withdraw(program: Program<Rps>, admin: web3.Keypair, bank: web3.PublicKey) {
  const adminAshATA = await getATA(admin.publicKey, ASH_MINT);

  let tx = await program.rpc.withdraw({
    accounts: {
      admin: admin.publicKey,
      bank: bank,
      bankConfig: BANK_CONFIG,
      receptor: adminAshATA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    signers: [admin],
  });
}

export async function start(
  program: Program<Rps>,
  admin: web3.PublicKey,
  playerOne: web3.PublicKey,
  mint: web3.PublicKey,
  playerOneAshToken: web3.PublicKey,
  amount: number,
  secret: string,
  shape: Shape,
  duration: number
) {
  let gameId = new web3.Keypair();
  let [game] = await getGame(gameId.publicKey);
  let [proceeds] = await getProceeds(game);
  let hash = expand(secret, shape);

  if (mint.toBase58() === WSOL.toBase58()) {
    playerOneAshToken = await getATA(playerOne, WSOL);
    amount = amount * web3.LAMPORTS_PER_SOL;
  }

  console.log("Playing: " + shapeToString(shape));

  await program.rpc.startGame(new anchor.BN(amount), hash, new anchor.BN(duration), {
    accounts: {
      admin,
      game,
      gameId: gameId.publicKey,
      playerOne,
      playerOneTokenAccount: playerOneAshToken,
      proceeds: proceeds,
      proceedsMint: mint,
      rent: web3.SYSVAR_RENT_PUBKEY,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    signers: [],
  });

  return { game: game, proceeds: proceeds };
}

export async function match(
  program: Program<Rps>,
  game: web3.PublicKey,
  mint: web3.PublicKey,
  playerTwo: web3.PublicKey,
  playerTwoAshToken: web3.PublicKey,
  shape: Shape
) {
  let [proceeds] = await getProceeds(game);

  if (mint.toBase58() == WSOL.toBase58()) {
    playerTwoAshToken = await getATA(playerTwo, WSOL);
  }

  console.log("Playing: " + shapeToString(shape));

  console.log({
    accounts: {
      game: game.toBase58(),
      playerTwo: playerTwo.toBase58(),
      playerTwoTokenAccount: playerTwoAshToken.toBase58(),
      proceeds: proceeds.toBase58(),
      clock: web3.SYSVAR_CLOCK_PUBKEY.toBase58(),
      tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
      systemProgram: SystemProgram.programId.toBase58(),
    },
    signers: [],
  });

  let tx = await program.rpc.matchGame(shape, {
    accounts: {
      game,
      playerTwo,
      playerTwoTokenAccount: playerTwoAshToken,
      proceeds,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    signers: [],
  });
  return tx;
}

export async function reveal(
  program: Program<Rps>,
  game: web3.PublicKey,
  playerOne: web3.PublicKey,
  secret: string
) {
  let gameData = (await program.account.game.fetch(game)) as unknown as GameAccount;
  let [proceeds] = await getProceeds(game);
  let [history] = await getHistory(game);

  let commited = gameData.playerOneCommitted as number[];
  let shape: Shape;
  let test = expand(secret, Shape.Rock);
  if (hashEquals(commited, test)) {
    shape = Shape.Rock;
  } else {
    test = expand(secret, Shape.Paper);
    if (hashEquals(commited, test)) {
      shape = Shape.Paper;
    } else {
      test = expand(secret, Shape.Scissor);
      if (hashEquals(commited, test)) {
        shape = Shape.Scissor;
      } else {
        throw new Error("The password entered doesn't match the one you used to create the game.");
      }
    }
  }
  console.log("Playing: " + shapeToString(shape));

  let h = getSecretSmall(secret);
  let tx = await program.rpc.revealGame(shape, h, {
    accounts: {
      game: game,
      playerOne: playerOne,
      playerTwo: gameData.playerTwo,
      playerOneTokenAccount: gameData.playerOneTokenAccount,
      playerTwoTokenAccount: gameData.playerTwoTokenAccount,
      proceeds: proceeds,
      bank: BANK,
      config: BANK_CONFIG,
      history: history,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    signers: [],
  });
  return tx;
}

// if game as expired, player 1 can come and close it to recover his token
export async function recover(
  program: Program<Rps>,
  game: web3.PublicKey,
  payer: web3.Keypair,
  payerTokenAccount: web3.PublicKey
) {
  let gameData = (await program.account.game.fetch(game)) as unknown as GameAccount;
  let [proceeds] = await getProceeds(game);

  let tx = await program.rpc.recover({
    accounts: {
      payer: payer.publicKey,
      game: game,
      payerTokenAccount: payerTokenAccount,
      proceeds: proceeds,
      config: BANK_CONFIG,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    signers: [payer],
  });
}

// if player doesn't come back after xx seconds, anyone can close the game (p2 win)
export async function terminate(program: Program<Rps>, game: web3.PublicKey, payer: web3.Keypair) {
  let gameData = (await program.account.game.fetch(game)) as unknown as GameAccount;
  let [proceeds] = await getProceeds(game);
  let [history] = await getHistory(game);

  let tx = await program.rpc.terminateGame({
    accounts: {
      payer: payer.publicKey,
      game: game,
      playerTwo: gameData.playerTwo,
      playerTwoTokenAccount: gameData.playerTwoTokenAccount,
      proceeds: proceeds,
      bank: BANK,
      config: BANK_CONFIG,
      history: history,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    signers: [payer],
  });
}

export async function loadHistory(program: Program<Rps>, player: web3.PublicKey) {
  let filter1: web3.MemcmpFilter = {
    memcmp: {
      offset: 8,
      bytes: player.toBase58(),
    },
  };
  let filter2: web3.MemcmpFilter = {
    memcmp: {
      offset: 40,
      bytes: player.toBase58(),
    },
  };
  let [r1, r2] = await Promise.all([
    program.account.gameHistory.all([filter1]),
    program.account.gameHistory.all([filter2]),
  ]);
  let res1 = r1.map((pa) => pa.account as GameHistory);
  let res2 = r2.map((pa) => pa.account as GameHistory);
  return res1.concat(res2);
}
