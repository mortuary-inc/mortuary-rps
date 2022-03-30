import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';
import * as assert from 'assert';
import { Rps } from '../target/types/rps';
import { start, Shape, match, reveal, initBank } from './rpsHelper';
import { airDrop, createAsh, createNft, disableLogging, restoreLogging, test_admin_key, transfer } from './utils';


describe("rps basic", () => {

    const provider = anchor.Provider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Rps as Program<Rps>;
    const connection = provider.connection;
    const admin = test_admin_key;
    const ashCreator = web3.Keypair.generate();

    let ashMintToken: Token;
    let ashMintPubkey: web3.PublicKey;

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

        await transfer(connection, ashMintPubkey, ashCreator, admin.publicKey, 100_000);
        let ashCreatorAshAccountInfo = await ashMintToken.getOrCreateAssociatedAccountInfo(ashCreator.publicKey);
        let adminAshAccountInfo = await ashMintToken.getOrCreateAssociatedAccountInfo(admin.publicKey);
        assert.equal(ashCreatorAshAccountInfo.amount.toNumber(), 1_400_000);
        assert.equal(adminAshAccountInfo.amount.toNumber(), 100_000);

        await initBank(program, admin, ashMintPubkey);

        // give 1000 ash to all user
        promises = [];
        for (let i = 0; i < user.length; i++) {
            let p = transfer(connection, ashMintPubkey, ashCreator, user[i].publicKey, 1000);
            promises.push(p);
        }
        await Promise.all(promises);
    });

    it('Create', async () => {

        let { user: u0, ashATA: u0AshToken, ashAmount: u0AshAmount } = await getUserData(0);
        assert.equal(u0AshAmount, 1000);
        let { user: u1, ashATA: u1AshToken, ashAmount: u1AshAmount } = await getUserData(1);
        assert.equal(u1AshAmount, 1000);

        // start
        let { game } = await start(program, admin.publicKey, u0, ashMintPubkey, u0AshToken, 100, "u1secret", Shape.Rock);
        let { ashAmount: u0AshAmount2 } = await getUserData(0);
        assert.equal(u0AshAmount2, 900);

        // match
        await match(program, game, u1, u1AshToken, Shape.Paper);
        let { ashAmount: u1AshAmount2 } = await getUserData(1);
        assert.equal(u1AshAmount2, 900);

        // reveal
        await reveal(program, game, u0, Shape.Rock, "u1secret");

        // let { raffle, entrants } = await createRaffle(program, admin, ashMintPubkey, Date.now() + 60000, 2, 10);

        // let { mint: nftMint, ata: nftAccount } = await createNft(connection, nftCreator, admin.publicKey);

        // await addPrize(program, admin, raffle, 1, nftAccount, nftMint, 0);

        // // u0 buy 1

        // await buyTicket(program, u0, raffle, entrants, u0AshToken, 1);

        // let { ashAmount: u0AshAmountP } = await getUserData(0);
        // assert.equal(u0AshAmountP, 1000 - 2);

        // // u1 & u2 buy
        // for (let i = 1; i < 3; i++) {
        //     let { user: ui, ashATA: uiAshToken } = await getUserData(0);
        //     await buyTicket(program, ui, raffle, entrants, uiAshToken, 1);
        // }

        // //only for test - terminate now
        // await terminateRaffle(program, raffle, admin);

        // // anyone can reveal
        // await revealWinners(program, raffle);

        // let winners = await getWinningTicket(program, raffle);
        // assert.equal(winners.length, 1);

        // let winner0 = winners[0];

        // let all = [user[0], user[1], user[2]];
        // let winner = all.find((u) => u.publicKey.equals(winner0.wallet));
        // let looser = all.filter((u) => !u.publicKey.equals(winner0.wallet));

        // let loggers = disableLogging();
        // try {
        //     await claimPrize(program, raffle, admin, nftMint, looser[0].publicKey, 0, winner0.ticket);
        //     assert.fail("should not pass here");
        // } catch (e) {
        //     assert.equal(true, true);
        // }
        // restoreLogging(loggers);

        // await claimPrize(program, raffle, admin, nftMint, winner.publicKey, 0, winner0.ticket);
        // assert.equal(true, true);

    });


    async function getUserData(index: number) {
        let u0 = user[index];
        let u0AshToken = await ashMintToken.getOrCreateAssociatedAccountInfo(u0.publicKey);

        return { user: u0, ashATA: u0AshToken.address, ashAmount: u0AshToken.amount.toNumber() };
    }
});
