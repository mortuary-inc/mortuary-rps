import { Program, web3 } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, AccountLayout, Token } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

import { Rps } from "../../app/src/web3/rps";
import { getBankConfigAddress } from "../../app/src/web3/rpsHelper"

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

    console.log("awaiting confirmation " + tx);
    await program.provider.connection.confirmTransaction(tx, "confirmed");

    return { bank: bank }
}
