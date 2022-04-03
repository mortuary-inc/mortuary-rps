use std::str::FromStr;

use anchor_lang::prelude::*;
use solana_program::program::invoke_signed;
use solana_program::system_instruction;
use spl_token::instruction::AuthorityType;

use solana_program::keccak;

use crate::account::*;
use crate::errors::*;
mod account;
mod errors;

#[cfg(not(feature = "devnet"))]
pub mod constants {
    pub const ADMIN: &str = "HAjs9EJxN3BZsratYKMnibgKXr84QFWBDtwdnR7qyB7J"; // operation
}

#[cfg(feature = "devnet")]
pub mod constants {
    pub const ADMIN: &str = "3dJUpmcsD7LYYi11AgcsgcC3soZSqPHqMbtHaHtTKDve"; // test_admin
}

declare_id!("mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk");

const PDA_SEED: &[u8] = b"bank";
const WSOL: &str = "So11111111111111111111111111111111111111112";

#[program]
pub mod rps {

    use super::*;

    pub fn init_bank(ctx: Context<InitBank>, _bump: u8) -> Result<()> {
        // only me can create this account
        if ctx.accounts.admin.key().to_string() != constants::ADMIN {
            return Err(error!(RpsCode::InvalidAdmin));
        }

        ctx.accounts.bank_config.version = 1;
        ctx.accounts.bank_config.admin = ctx.accounts.admin.key();
        ctx.accounts.bank_config.bank = ctx.accounts.bank.key();
        ctx.accounts.bank_config.mint = ctx.accounts.bank_mint.key();
        ctx.accounts.bank_config.tax = 12;
        ctx.accounts.bank_config.tax_draw = 0;

        let (pda, _bump_seed) = Pubkey::find_program_address(
            &[ctx.accounts.bank_mint.key().as_ref(), PDA_SEED],
            ctx.program_id,
        );

        let ix = spl_token::instruction::set_authority(
            &spl_token::ID,
            ctx.accounts.bank.to_account_info().key,
            Some(&pda),
            AuthorityType::AccountOwner,
            ctx.accounts.admin.key,
            &[],
        )?;
        solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.bank.to_account_info(),
                ctx.accounts.admin.clone(),
                ctx.accounts.token_program.to_account_info(),
            ],
            &[],
        )?;

        Ok(())
    }

    pub fn start_game(
        ctx: Context<StartGame>,
        amount: u64,
        hash: [u8; 32],
        duration: i64,
    ) -> Result<()> {
        if ctx.accounts.admin.key().to_string() != constants::ADMIN {
            return Err(error!(RpsCode::InvalidAdmin));
        }

        msg!("Start game");

        let game = &mut ctx.accounts.game;
        game.version = 1;
        game.game_id = ctx.accounts.game_id.key();
        game.admin = ctx.accounts.admin.key();
        game.player_one = ctx.accounts.player_one.key();
        game.player_one_committed = Some(hash);
        game.player_one_revealed = None;
        // game.player_two = None;
        game.player_two_revealed = None;
        game.stage = Stage::Start;
        game.amount = amount;
        game.mint = ctx.accounts.proceeds_mint.key();
        game.duration = duration;
        game.player_one_token_account = ctx.accounts.player_one_token_account.key();
        game.player_two_token_account = ctx.accounts.player_one_token_account.key();

        let clock = &ctx.accounts.clock;
        game.last_update = clock.unix_timestamp;

        msg!("Ready to transfer");

        if game.mint == Pubkey::from_str(WSOL).unwrap() {
            // native
            transfer_native(
                game.amount,
                ctx.accounts.player_one.to_account_info(),
                ctx.accounts.game.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                &[],
            )?;
        } else {
            transfer(
                game.amount,
                ctx.accounts.player_one_token_account.to_account_info(),
                ctx.accounts.proceeds.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.player_one.to_account_info(),
                &[],
            )?;
        }

        Ok(())
    }

    pub fn match_game(ctx: Context<MatchGame>, shape: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;

        if game.stage != Stage::Start {
            return Err(error!(RpsCode::GameNotStart));
        }

        let clock = &ctx.accounts.clock;
        if game.last_update + game.duration < clock.unix_timestamp {
            return Err(error!(RpsCode::GameExpired));
        }

        game.player_two = ctx.accounts.player_two.key();
        game.player_two_revealed = Some(shape_from_u8(shape));
        game.player_two_token_account = ctx.accounts.player_two_token_account.key();
        game.stage = Stage::Match;

        game.last_update = clock.unix_timestamp;

        if game.mint == Pubkey::from_str(WSOL).unwrap() {
            // native
            transfer_native(
                game.amount,
                ctx.accounts.player_two.to_account_info(),
                ctx.accounts.game.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                &[],
            )?;
        } else {
            transfer(
                game.amount,
                ctx.accounts.player_two_token_account.to_account_info(),
                ctx.accounts.proceeds.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.player_two.to_account_info(),
                &[],
            )?;
        }

        Ok(())
    }

    pub fn reveal_game(ctx: Context<RevealGame>, shape: u8, secret: [u8; 32]) -> Result<()> {
        let game = &mut ctx.accounts.game;

        if game.stage != Stage::Match {
            return Err(error!(RpsCode::GameNotMatch));
        }

        let mut hasher = keccak::Hasher::default();
        hasher.hash(&secret);
        hasher.hash(&shape.to_le_bytes());

        let control = hasher.result().to_bytes();
        let saved = game.player_one_committed.as_ref().unwrap();
        let it_match = control == *saved;
        if !it_match {
            return Err(error!(RpsCode::HashDontMatch));
        }

        let clock = &ctx.accounts.clock;
        game.player_one_revealed = Some(shape_from_u8(shape));
        game.stage = Stage::Reveal;
        game.last_update = clock.unix_timestamp;

        // if match dispatch gain
        // compute winner
        let p1 = game.player_one_revealed.unwrap();
        let p2 = game.player_two_revealed.unwrap();
        msg!("Player1:{}", shape_to_text(p1));
        msg!("Player2:{}", shape_to_text(p2));
        let winner = match (p1, p2) {
            (Shape::Rock, Shape::Paper) => 2,
            (Shape::Rock, Shape::Scissor) => 1,
            (Shape::Paper, Shape::Rock) => 1,
            (Shape::Paper, Shape::Scissor) => 2,
            (Shape::Scissor, Shape::Rock) => 2,
            (Shape::Scissor, Shape::Paper) => 1,
            _ => 0,
        };

        let mut player1_amount = 0;
        let mut player2_amount = 0;
        let mut bank_amount = 0;

        if winner == 0 {
            msg!("Draw");
            player1_amount = game.amount;
            player2_amount = game.amount;
        } else {
            msg!("Player{} win", winner);
            // distribute to winner + commission
            let player_gain = game
                .amount
                .checked_mul(2)
                .ok_or(RpsCode::NumericalOverflow)?;
            let taxpct = ctx.accounts.config.tax.into();
            let fee = player_gain
                .checked_mul(taxpct)
                .ok_or(RpsCode::NumericalOverflow)?
                .checked_div(100)
                .ok_or(RpsCode::NumericalOverflow)? as u64;
            bank_amount = fee;
            if winner == 1 {
                player1_amount = player_gain
                    .checked_sub(bank_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            } else {
                player2_amount = player_gain
                    .checked_sub(bank_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            }
        }

        let is_native = if game.mint.to_string() == WSOL {
            true
        } else {
            false
        };

        let game_key = game.game_id;
        let (_, nonce) =
            Pubkey::find_program_address(&[b"game".as_ref(), game_key.as_ref()], ctx.program_id);
        let seeds = &[b"game".as_ref(), game_key.as_ref(), &[nonce]];
        let signer_seeds = &[&seeds[..]];

        if is_native {
            let pay = &ctx.accounts.game.to_account_info();
            let snapshot: u64 = pay.lamports();
            **pay.lamports.borrow_mut() = snapshot
                .checked_sub(player1_amount)
                .ok_or(RpsCode::NumericalOverflow)?
                .checked_sub(player2_amount)
                .ok_or(RpsCode::NumericalOverflow)?
                .checked_sub(bank_amount)
                .ok_or(RpsCode::NumericalOverflow)?;
            msg!("Proceed lamport: {}", snapshot);
            if player1_amount > 0 {
                msg!("Sending:{} to player1", player1_amount);
                let p = ctx.accounts.player_one.to_account_info();
                **p.lamports.borrow_mut() = p
                    .lamports()
                    .checked_add(player1_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            }
            if player2_amount > 0 {
                msg!("Sending:{} to player2", player2_amount);
                let p = ctx.accounts.player_two.to_account_info();
                **p.lamports.borrow_mut() = p
                    .lamports()
                    .checked_add(player2_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            }
            if bank_amount > 0 {
                msg!("Sending:{} to bank", bank_amount);
                let p = ctx.accounts.config.to_account_info();
                **p.lamports.borrow_mut() = p
                    .lamports()
                    .checked_add(bank_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            }
        } else {
            if player1_amount > 0 {
                msg!("Sending:{} to player1", player1_amount);
                transfer(
                    player1_amount,
                    ctx.accounts.proceeds.to_account_info(),
                    ctx.accounts.player_one_token_account.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.game.to_account_info(),
                    signer_seeds,
                )?;
            }
            if player2_amount > 0 {
                msg!("Sending:{} to player2", player2_amount);
                transfer(
                    player2_amount,
                    ctx.accounts.proceeds.to_account_info(),
                    ctx.accounts.player_two_token_account.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.game.to_account_info(),
                    signer_seeds,
                )?;
            }
            if bank_amount > 0 {
                msg!(
                    "Sending:{} to bank {}",
                    bank_amount,
                    ctx.accounts.bank.key()
                );
                transfer(
                    bank_amount,
                    ctx.accounts.proceeds.to_account_info(),
                    ctx.accounts.bank.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.game.to_account_info(),
                    signer_seeds,
                )?;
            }
        }

        Ok(())
    }

    // after x duration, anyone can stop the game
    // player 2 win
    pub fn terminate_game(ctx: Context<TerminateGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        if game.stage != Stage::Match {
            return Err(error!(RpsCode::GameNotMatch));
        }

        let clock = &ctx.accounts.clock;
        if game.last_update + game.duration > clock.unix_timestamp {
            return Err(error!(RpsCode::GameLive));
        }

        game.stage = Stage::Terminate;
        game.last_update = clock.unix_timestamp;

        // distribute to player2 + commission
        let player_gain = game
            .amount
            .checked_mul(2)
            .ok_or(RpsCode::NumericalOverflow)?;
        let taxpct = ctx.accounts.config.tax.into();
        let fee = player_gain
            .checked_mul(taxpct)
            .ok_or(RpsCode::NumericalOverflow)?
            .checked_div(100)
            .ok_or(RpsCode::NumericalOverflow)? as u64;
        let bank_amount = fee;
        let player2_amount = player_gain
            .checked_sub(bank_amount)
            .ok_or(RpsCode::NumericalOverflow)?;

        let is_native = if game.mint.to_string() == WSOL {
            true
        } else {
            false
        };

        let game_key = game.game_id;
        let (_, nonce) =
            Pubkey::find_program_address(&[b"game".as_ref(), game_key.as_ref()], ctx.program_id);
        let seeds = &[b"game".as_ref(), game_key.as_ref(), &[nonce]];
        let signer_seeds = &[&seeds[..]];

        if is_native {
            let pay = &ctx.accounts.game.to_account_info();
            let snapshot: u64 = pay.lamports();
            **pay.lamports.borrow_mut() = snapshot
                .checked_sub(player2_amount)
                .ok_or(RpsCode::NumericalOverflow)?
                .checked_sub(bank_amount)
                .ok_or(RpsCode::NumericalOverflow)?;
            if player2_amount > 0 {
                msg!("Sending:{} to player2", player2_amount);
                let p = ctx.accounts.player_two.to_account_info();
                **p.lamports.borrow_mut() = p
                    .lamports()
                    .checked_add(player2_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            }
            if bank_amount > 0 {
                msg!("Sending:{} to bank", bank_amount);
                let p = ctx.accounts.config.to_account_info();
                **p.lamports.borrow_mut() = p
                    .lamports()
                    .checked_add(bank_amount)
                    .ok_or(RpsCode::NumericalOverflow)?;
            }
        } else {
            if player2_amount > 0 {
                msg!("Sending:{} to player2", player2_amount);
                transfer(
                    player2_amount,
                    ctx.accounts.proceeds.to_account_info(),
                    ctx.accounts.player_two_token_account.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.game.to_account_info(),
                    signer_seeds,
                )?;
            }
            if bank_amount > 0 {
                msg!(
                    "Sending:{} to bank {}",
                    bank_amount,
                    ctx.accounts.bank.key()
                );
                transfer(
                    bank_amount,
                    ctx.accounts.proceeds.to_account_info(),
                    ctx.accounts.bank.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.game.to_account_info(),
                    signer_seeds,
                )?;
            }
        }

        Ok(())
    }

    // player 1 can cancel if no one join
    // nothing happen

    // when closing game, save stats to a light weight account
}

pub fn transfer<'a>(
    amount: u64,
    from_account: AccountInfo<'a>,
    to_account: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    authority: AccountInfo<'a>,
    signers_seeds: &[&[&[u8]]],
) -> Result<()> {
    assert_owned_by(&from_account, &spl_token::id())?;
    assert_owned_by(&to_account, &spl_token::id())?;

    let transfer_ix = spl_token::instruction::transfer(
        &spl_token::ID,
        from_account.key,
        to_account.key,
        authority.key,
        &[],
        amount,
    )?;
    solana_program::program::invoke_signed(
        &transfer_ix,
        &[from_account, to_account, authority, token_program],
        signers_seeds,
    )?;

    Ok(())
}

pub fn transfer_native<'a>(
    amount: u64,
    from_native: AccountInfo<'a>,
    to_native: AccountInfo<'a>,
    system_program: AccountInfo<'a>,
    signers_seeds: &[&[&[u8]]],
) -> Result<()> {
    invoke_signed(
        &system_instruction::transfer(from_native.key, to_native.key, amount),
        &[from_native, to_native, system_program],
        signers_seeds,
    )?;

    Ok(())
}
