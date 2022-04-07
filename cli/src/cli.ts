import { Cluster, clusterApiUrl } from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import * as web3 from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import fs from 'fs';
import rpsIdl from '../../app/src/web3/rps.json';
import { BankConfig, getBankConfigAddress, RPS_PROGRAM_ID } from "../../app/src/web3/rpsHelper";
import { Rps } from "../../app/src/web3/rps";
import { initBank } from "./init";
import { ASH_MINT } from "../../app/src/web3/accounts";

async function run() {
    let network: Cluster = "devnet";
    let args = process.argv.slice(2);
    if (args.length > 0) {
        let n = args[0];
        network = n as Cluster;
    }
    console.log("Will connect to " + network);

    let rpc = "";
    if (network == "mainnet-beta") {
        rpc = "https://api.metaplex.solana.com/";
    } else {
        rpc = clusterApiUrl(network);
    }

    const keypair = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("/home/mathieu/.config/solana/main.json").toString())));
    console.log("Loaded keypair of " + keypair.publicKey);

    const walletWrapper = new anchor.Wallet(keypair);
    const connection = new web3.Connection(rpc, "confirmed");
    const provider = new anchor.Provider(connection, walletWrapper, {});
    const idl = rpsIdl as any;
    const program = new anchor.Program(idl, RPS_PROGRAM_ID, provider) as Program<Rps>;
    //await initBank(program, keypair, ASH_MINT);

    let [bankConfigAddr] = await getBankConfigAddress(ASH_MINT);
    let bankConfig = (await program.account.bankConfig.fetch(bankConfigAddr)) as BankConfig;
    console.log("Bank config: " + bankConfigAddr.toBase58());
    console.log("Bank: " + bankConfig.bank);
    console.log("Bump: " + bankConfig.bump);
    console.log("Mint: " + bankConfig.mint);
    console.log("Tax: " + bankConfig.tax);
}

run().then(() => {
    console.log("done.")
}).catch((e) => {
    console.error(e);
})

