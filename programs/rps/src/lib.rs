use anchor_lang::prelude::*;
use solana_program::keccak;

use crate::account::*;
use crate::errors::*;

mod account;
mod errors;


#[cfg(not(feature = "devnet"))]
pub mod constants {
    pub const ADMIN: &str = "JAeRnMQAGFgQtM8BCKHX2N94GniMJ5uxb9wHkvbBRtnb"; // change that
}

#[cfg(feature = "devnet")]
pub mod constants {
    pub const ADMIN: &str = "3dJUpmcsD7LYYi11AgcsgcC3soZSqPHqMbtHaHtTKDve"; // test_admin
}

declare_id!("mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk");

#[program]
pub mod rps {

    use anchor_spl::token;

    use super::*;
    
    pub fn start_game(ctx: Context<StartGame>, amount: u32, hash: [u8; 32]) -> Result<()> {
        
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

    pub fn match_game(ctx: Context<MatchGame>, shape: u8) -> Result<()> {
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

        Ok(())
    }

    // after 24h, anyone can stop the game

    // player 1 can cancel if no one join




    //
    //
    // Not used for now
    
    pub fn create_bet(
        ctx: Context<CreateBet>,
        amount: u32,
        tax: u32,
        mint: Option<Pubkey>,
    ) -> Result<()> {

        let bet = &mut ctx.accounts.bet;
        bet.version = 1;
        bet.admin = ctx.accounts.admin.key();
        bet.mint = mint;
        bet.amount = amount;
        bet.tax = tax;

        Ok(())
    }

}
