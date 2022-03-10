use anchor_lang::prelude::*;
use solana_program::keccak::hash;

use crate::account::*;
use crate::errors::*;

mod account;
mod errors;

declare_id!("mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk");

#[program]
pub mod rps {

    use anchor_spl::token;

    use super::*;

    pub fn start_game(ctx: Context<StartGame>, amount: u32, hash : [u8; 32]) -> Result<()> {
        let game = &mut ctx.accounts.game;
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
}
