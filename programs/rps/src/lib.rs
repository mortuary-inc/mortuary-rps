use anchor_lang::prelude::*;
use solana_program::keccak::hash;

use crate::account::*;

mod account;

declare_id!("mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk");

#[program]
pub mod rps {

    use anchor_spl::token;

    use super::*;

    // pub fn test_hash(_ctx : Context<Misc>, input : String) -> ProgramResult {
    //     msg!("input is {}",input);
    //     msg!("hash is {:?}",hash(&input.as_bytes()).to_bytes());
    //     Err(ProgramError::InvalidArgument)
    // }

    pub fn start_game(ctx: Context<StartGame>, amount: u32) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        game.admin = ctx.accounts.admin.key();
        game.player_one = ctx.accounts.player_one.key();
        // game.player_one_committed
        game.player_one_revealed = None;
        game.player_two = None;
        game.player_two_revealed = None;
        game.stage = Stage::Initialized;
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
}
