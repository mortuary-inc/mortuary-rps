use anchor_lang::prelude::*;
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

const PDA_SEED: &[u8] = b"pda";

#[program]
pub mod rps {

    use anchor_spl::token::{self};

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
        _bump: u8,
        amount: u64,
        hash: [u8; 32],
        duration: i64,
    ) -> Result<()> {
        if ctx.accounts.admin.key().to_string() != constants::ADMIN {
            return Err(error!(RpsCode::InvalidAdmin));
        }

        let game = &mut ctx.accounts.game;
        game.version = 1;
        game.admin = ctx.accounts.admin.key();
        game.player_one = ctx.accounts.player_one.key();
        game.player_one_committed = Some(hash);
        game.player_one_revealed = None;
        game.player_two = None;
        game.player_two_revealed = None;
        game.stage = Stage::Start;
        game.amount = amount;
        game.mint = ctx.accounts.proceeds_mint.key();
        game.duration = duration;
        
        let clock = &ctx.accounts.clock;
        game.last_update = clock.unix_timestamp;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.player_one_token_account.to_account_info(),
                    to: ctx.accounts.proceeds.to_account_info(),
                    authority: ctx.accounts.player_one.to_account_info(),
                },
            ),
            amount.into(),
        )?;

        Ok(())
    }

    pub fn match_game(ctx: Context<MatchGame>, _bump: u8, shape: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;

        if game.stage != Stage::Start {
            return Err(error!(RpsCode::GameNotStart));
        }

        game.player_two = Some(ctx.accounts.player_two.key());
        game.player_two_revealed = Some(shape_from_u8(shape));
        game.stage = Stage::Match;

        let clock = &ctx.accounts.clock;
        game.last_update = clock.unix_timestamp;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.player_two_token_account.to_account_info(),
                    to: ctx.accounts.proceeds.to_account_info(),
                    authority: ctx.accounts.player_two.to_account_info(),
                },
            ),
            game.amount.into(),
        )?;

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
        if winner == 0 {
            msg!("Draw");
            // distribute back (+commission optionnel)
        } else {
            msg!("Player{} win", winner);
            // distribute to winner + commission
        }

        Ok(())
    }

    // after x duration, anyone can stop the game
    // player 2 win

    // player 1 can cancel if no one join
    // nothing happen

    // pub fn send_back_ash<'a>(
    //     ash_amount: u64,
    //     program_id: &Pubkey,
    //     pda_seed: &[u8],
    //     bank_account: AccountInfo<'a>,
    //     ash_account: AccountInfo<'a>,
    //     pda: AccountInfo<'a>,
    //     token_program: AccountInfo<'a>,
    // ) -> ProgramResult {
    //     let (_pda, bump_seed) = Pubkey::find_program_address(&[pda_seed], program_id);
    //     let seeds = &[&pda_seed[..], &[bump_seed]];

    //     let transfer_ix = spl_token::instruction::transfer(
    //         &spl_token::ID,
    //         bank_account.key,
    //         ash_account.key,
    //         pda.key,
    //         &[],
    //         ash_amount,
    //     )?;
    //     solana_program::program::invoke_signed(
    //         &transfer_ix,
    //         &[bank_account, ash_account, pda, token_program],
    //         &[&seeds[..]],
    //     )?;

    //     Ok(())
    // }

    //
    //
    // Not used for now
    // pub fn create_bet(
    //     ctx: Context<CreateBet>,
    //     amount: u32,
    //     tax: u32,
    //     mint: Option<Pubkey>,
    // ) -> Result<()> {
    //     let bet = &mut ctx.accounts.bet;
    //     bet.version = 1;
    //     bet.admin = ctx.accounts.admin.key();
    //     bet.mint = mint;
    //     bet.amount = amount;
    //     bet.tax = tax;

    //     Ok(())
    // }
}
