import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import * as assert from 'assert';
import { Rps } from '../target/types/rps';
import { ASH_MINT, setAshMint, WSOL } from './accounts';
import { start, Shape, match, reveal, initBank, getBankConfigAddress, terminate, withdraw, loadHistory, recover } from './rpsHelper';
import { airDrop, createAsh, createNft, disableLogging, getBalance, restoreLogging, test_admin_key, transfer } from './utils';

describe("rps basic", () => {

    const provider = anchor.Provider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Rps as Program<Rps>;
    const connection = provider.connection;
    const admin = test_admin_key;
    const ashCreator = web3.Keypair.generate();

    let ashMintToken: Token;
    let ashMintPubkey: web3.PublicKey;
    let bankPubkey: web3.PublicKey;
    let configPubkey: web3.PublicKey;

    let user: web3.Keypair[] = [];

    it('Initialize', async () => {

        // Give admin some SOL
        await Promise.all([
            airDrop(connection, provider.wallet.publicKey, 2),
            airDrop(connection, admin.publicKey, 2),
            airDrop(connection, ashCreator.publicKey, 2),
        ]);

        let promises: Array<Promise<any>> = [];
        for (let i = 0; i < 10; i++) {
            let kp = new web3.Keypair();
            user.push(kp);
            let p = airDrop(connection, kp.publicKey, 2);
            promises.push(p);
        }
        await Promise.all(promises);

        ashMintToken = await createAsh(connection, ashCreator, 1_500_000);
        ashMintPubkey = ashMintToken.publicKey;
        setAshMint(ashMintToken.publicKey);

        await transfer(connection, ashMintPubkey, ashCreator, admin.publicKey, 100_000);
        let ashCreatorAshAccountInfo = await ashMintToken.getOrCreateAssociatedAccountInfo(ashCreator.publicKey);
        let adminAshAccountInfo = await ashMintToken.getOrCreateAssociatedAccountInfo(admin.publicKey);
        assert.equal(ashCreatorAshAccountInfo.amount.toNumber(), 1_400_000);
        assert.equal(adminAshAccountInfo.amount.toNumber(), 100_000);

        let { bank } = await initBank(program, admin, ashMintPubkey);
        bankPubkey = bank.publicKey;

        console.log("bank: " + bankPubkey.toString());

        // give 1000 ash to all user
        promises = [];
        for (let i = 0; i < user.length; i++) {
            let p = transfer(connection, ashMintPubkey, ashCreator, user[i].publicKey, 1000);
            promises.push(p);
        }
        await Promise.all(promises);
    });

    it('Create and match (ash)', async () => {

        let { user: u1, ashATA: u1AshToken, ashAmount: u1AshAmount } = await getUserData(1);
        assert.equal(u1AshAmount, 1000);
        let { user: u2, ashATA: u2AshToken, ashAmount: u2AshAmount } = await getUserData(2);
        assert.equal(u2AshAmount, 1000);

        let bankAsh = await getBankAsh();
        assert.equal(bankAsh, 0);

        // start
        let { game } = await start(program, admin.publicKey, u1, ashMintPubkey, u1AshToken, 100, "u1secret", Shape.Rock, 8 * 60 * 60);
        let u1Ash = await getUserAsh(1);
        assert.equal(u1Ash, 900);

        let rent = await program.provider.connection.getMinimumBalanceForRentExemption(312);
        console.log("rent: " + rent / web3.LAMPORTS_PER_SOL);

        // match
        await match(program, game, ashMintPubkey, u2, u2AshToken, Shape.Paper);
        let u2Ash = await getUserAsh(2);
        assert.equal(u2Ash, 900);

        // reveal
        await reveal(program, game, u1, Shape.Rock, "u1secret");

        // u2 win
        bankAsh = await getBankAsh();
        assert.equal(bankAsh, 10);
        u2Ash = await getUserAsh(2);
        assert.equal(u2Ash, 900 + 190);
    });

    it('Create and match (sol)', async () => {

        let { user: u1 } = await getUserData(1);
        let u1Balance = await getBalance(connection, u1.publicKey);
        console.log("u1 balance: " + u1Balance);
        let { user: u2 } = await getUserData(2);
        let u2Balance = await getBalance(connection, u2.publicKey);
        console.log("u2 balance: " + u2Balance);

        let bankSol = await getConfigBalance();
        console.log("Config balance: " + bankSol);
        assert.ok(bankSol < 0.1);

        // start
        let { game } = await start(program, admin.publicKey, u1, WSOL, null, 0.5, "u1secret", Shape.Rock, 8 * 60 * 60);
        let u1Balance2 = await getBalance(connection, u1.publicKey);
        console.log("u1 balance after: " + u1Balance2 + " / " + (u1Balance - u1Balance2));
        assert.ok(u1Balance - u1Balance2 < 0.51);

        // match
        await match(program, game, WSOL, u2, null, Shape.Paper);
        let u2Balance2 = await getBalance(connection, u2.publicKey);
        console.log("u2 balance after: " + u2Balance2 + " / " + (u2Balance - u2Balance2));
        assert.ok(u2Balance - u2Balance2 < 0.51);

        // reveal
        await reveal(program, game, u1, Shape.Rock, "u1secret");

        // u2 win
        let bankSol2 = await getConfigBalance();
        console.log("Config balance after: " + bankSol2 + " / " + (bankSol2 - bankSol));
        assert.ok(bankSol2 - bankSol >= 0.049);

        let u2Balance3 = await getBalance(connection, u2.publicKey);
        console.log("u2 balance after: " + u2Balance3 + " / " + (u2Balance3 - u2Balance2));
        assert.ok(u2Balance3 - u2Balance2 >= 0.94);
    });

    // User 1 doesn't come back
    it('User 1 drop', async () => {

        let { user: u1, ashATA: u1AshToken } = await getUserData(1);
        let { user: u2, ashATA: u2AshToken, ashAmount: u2AshAmount } = await getUserData(2);
        let { user: u3 } = await getUserData(3);
        let bankAsh = await getBankAsh();

        // start a game that expire after 3s
        let { game } = await start(program, admin.publicKey, u1, ashMintPubkey, u1AshToken, 100, "u1secret", Shape.Rock, 3);

        // match
        await match(program, game, ashMintPubkey, u2, u2AshToken, Shape.Scissor);

        let loggers = disableLogging();
        try {
            await terminate(program, game, u3);
            assert.fail("should not pass here");
        } catch (e) {
            let msg = (e?.error?.errorMessage ?? e.message);
            assert.equal(msg, "Game is live");
        }
        restoreLogging(loggers);

        console.log("sleeping 4s");
        await sleep(5000);

        // reveal
        await terminate(program, game, u3);

        // u2 win
        let bankAsh2 = await getBankAsh();
        let u2AshAmount2 = await getUserAsh(2);
        assert.equal((bankAsh2 - bankAsh), 10);
        assert.equal((u2AshAmount2 - u2AshAmount), 90);
    });

    // Withdraw bank
    it('Withdraw', async () => {

        let { user: u1, ashATA: u1AshToken } = await getUserData(1);
        let { user: u2, ashATA: u2AshToken } = await getUserData(2);

        // SOL game
        let { game } = await start(program, admin.publicKey, u1, WSOL, null, 2, "u1secret", Shape.Rock, 8 * 60 * 60);
        await match(program, game, WSOL, u2, null, Shape.Paper);
        await reveal(program, game, u1, Shape.Rock, "u1secret");
        // ASH game
        let { game: game2 } = await start(program, admin.publicKey, u1, ASH_MINT, u1AshToken, 500, "u1secret", Shape.Rock, 8 * 60 * 60);
        await match(program, game2, ASH_MINT, u2, u2AshToken, Shape.Paper);
        await reveal(program, game2, u1, Shape.Rock, "u1secret");

        // u2 win
        let bankSol = await getConfigBalance();
        let bankAsh = await getBankAsh();
        let adminSol = await getBalance(connection, admin.publicKey);

        await withdraw(program, admin, bankPubkey, ashMintPubkey);

        let bankSol2 = await getConfigBalance();
        let bankAsh2 = await getBankAsh();
        let adminSol2 = await getBalance(connection, admin.publicKey);
        console.log("SOL diff:" + (bankSol2 - bankSol) + " new: " + bankSol2);
        console.log("ASH diff:" + (bankAsh2 - bankAsh))
        console.log("Admin SOL diff:" + (adminSol2 - adminSol) + " new: " + adminSol2);
        assert.ok(bankAsh2 - bankAsh <= 60);
        assert.ok(adminSol2 - adminSol >= 0.1);
    });

    // Check all combinaison
    it('All combinaison', async () => {
        let res = await runGame(1, Shape.Paper, 2, Shape.Paper);
        assert.equal(res, 0);
        res = await runGame(1, Shape.Paper, 2, Shape.Rock);
        assert.equal(res, 1);
        res = await runGame(1, Shape.Paper, 2, Shape.Scissor);
        assert.equal(res, 2);
        res = await runGame(1, Shape.Rock, 2, Shape.Paper);
        assert.equal(res, 2);
        res = await runGame(1, Shape.Rock, 2, Shape.Rock);
        assert.equal(res, 0);
        res = await runGame(1, Shape.Rock, 2, Shape.Scissor);
        assert.equal(res, 1);
        res = await runGame(1, Shape.Scissor, 2, Shape.Paper);
        assert.equal(res, 1);
        res = await runGame(1, Shape.Scissor, 2, Shape.Rock);
        assert.equal(res, 2);
        res = await runGame(1, Shape.Scissor, 2, Shape.Scissor);
        assert.equal(res, 0);
    });


    it('Wrong reveal', async () => {

        let { user: u1, ashATA: u1AshToken } = await getUserData(1);
        let { user: u2, ashATA: u2AshToken } = await getUserData(2);

        // start
        let { game } = await start(program, admin.publicKey, u1, ashMintPubkey, u1AshToken, 20, "asecret", Shape.Paper, 8 * 60 * 60);
        // match
        await match(program, game, ashMintPubkey, u2, u2AshToken, Shape.Scissor);

        let loggers = disableLogging();
        try {
            // reveal
            await reveal(program, game, u1, Shape.Rock, "badsecret");
        } catch (e) {
            let msg = (e?.error?.errorMessage ?? e.message);
            assert.equal(msg, "Your combinaison (secret+weapon) doesn't match what you played when you created the game.");
        }
        restoreLogging(loggers);
    });

    it('Search history', async () => {

        let { user: u9, ashATA: u9AshToken } = await getUserData(9);
        let { user: u3, ashATA: u3AshToken } = await getUserData(3);
        let { user: u4 } = await getUserData(4);

        await Promise.all([
            runGame(9, Shape.Paper, 2, Shape.Rock),
            runGame(2, Shape.Paper, 9, Shape.Rock),
        ]);

        let { game } = await start(program, admin.publicKey, u3, ashMintPubkey, u3AshToken, 10, "chut", Shape.Scissor, 1);
        await match(program, game, ashMintPubkey, u9, u9AshToken, Shape.Rock);
        await sleep(1500);
        await terminate(program, game, u4);

        let history = await loadHistory(program, u9.publicKey);
        assert.equal(history.length, 3);
    });


    // User 1 doesn't come back
    it('Game expired', async () => {

        let { user: u1, ashATA: u1AshToken, ashAmount: u1AshAmount } = await getUserData(1);
        let { user: u2, ashATA: u2AshToken } = await getUserData(2);

        // start a game that expire after 3s
        let { game } = await start(program, admin.publicKey, u1, ashMintPubkey, u1AshToken, 100, "u1secret", Shape.Rock, 3);

        // try cancel before expired
        let loggers = disableLogging();
        try {
            await recover(program, game, u1, u1AshToken);
            assert.fail("should not pass here");
        } catch (e) {
            let msg = (e?.error?.errorMessage ?? e.message);
            assert.equal(msg, "Game is live");
        }
        restoreLogging(loggers);

        let u1AshAmount2 = await getUserAsh(1);
        assert.equal((u1AshAmount2 - u1AshAmount), -100);

        await sleep(4000);

        // match
        loggers = disableLogging();
        try {
            await match(program, game, ashMintPubkey, u2, u2AshToken, Shape.Scissor);
            assert.fail("should not pass here");
        } catch (e) {
            let msg = (e?.error?.errorMessage ?? e.message);
            assert.equal(msg, "Game is expired");
        }
        restoreLogging(loggers);

        // Now can close
        await recover(program, game, u1, u1AshToken);

        // u2 win
        let u1AshAmount3 = await getUserAsh(1);
        assert.equal(u1AshAmount3, u1AshAmount);
    });

    async function runGame(u1Index: number, u1Shape: Shape, u2Index: number, u2Shape: Shape) {
        let { user: u1, ashATA: u1AshToken } = await getUserData(u1Index);
        let { user: u2, ashATA: u2AshToken } = await getUserData(u2Index);

        let u1AshAmount = await getUserAsh(u1Index);
        let secret = "secret" + Math.round(Math.random() * 100);
        let { game: game2 } = await start(program, admin.publicKey, u1, ASH_MINT, u1AshToken, 50, secret, u1Shape, 8 * 60 * 60);
        await match(program, game2, ASH_MINT, u2, u2AshToken, u2Shape);
        await reveal(program, game2, u1, u1Shape, secret);
        let u1AshAmount2 = await getUserAsh(u1Index);
        let diff = u1AshAmount2 - u1AshAmount;
        if (diff == 0) return 0;
        if (diff > 0) return 1;
        return 2;
    }

    async function getUserData(index: number) {
        let u0 = user[index];
        let u0AshToken = await ashMintToken.getOrCreateAssociatedAccountInfo(u0.publicKey);
        return { user: u0, ashATA: u0AshToken.address, ashAmount: u0AshToken.amount.toNumber() };
    }

    async function getUserAsh(index: number) {
        let u0 = user[index];
        let u0AshToken = await ashMintToken.getOrCreateAssociatedAccountInfo(u0.publicKey);
        return u0AshToken.amount.toNumber();
    }
    async function getBankAsh() {
        let u0AshToken = await ashMintToken.getAccountInfo(bankPubkey);
        return u0AshToken.amount.toNumber();
    }
    async function getConfigBalance() {
        let [config] = await getBankConfigAddress(ASH_MINT);
        let b = await getBalance(connection, config);
        return b;
    }
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
});
