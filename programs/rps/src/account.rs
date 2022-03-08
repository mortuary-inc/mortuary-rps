use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(init, payer = player_one, space = Game::LEN)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,
    
    #[account(
        init,
        seeds = [game.key().as_ref(), b"proceeds"],
        bump,
        payer = player_one,
        token::mint = proceeds_mint,
        token::authority = game,
    )]
    pub proceeds: Account<'info, TokenAccount>,
    pub proceeds_mint: Account<'info, Mint>,
    
    pub admin: AccountInfo<'info>,
    #[account(mut)]
    pub player_one_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}



// #[derive(Accounts)]
// pub struct Connect<'info> {
//     #[account(mut)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     pub user : Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct Reveal<'info> {
//     #[account(mut)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     pub user : Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct Commit<'info> {
//     #[account(mut)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     pub user : Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct Claim<'info> {
//     #[account(mut)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     pub user : Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct Reset<'info> {
//     #[account(mut)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     pub user : Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct Slash<'info> {
//     #[account(mut)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     pub user : Signer<'info>,
// }


#[account]
pub struct Game {
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub amount: u32,
    pub player_one: Pubkey,
    pub player_two: Option<Pubkey>,
    pub player_one_committed: Option<[u8; 32]>,
    pub player_one_revealed: Option<Shape>,
    pub player_two_revealed: Option<Shape>,
    pub stage: Stage,
    pub last_update: i64,
}

impl Game {
    pub const LEN: usize = 8+
     32 + // admin
     32 + // mint
      4 + // amount
     32 + // player 1
     32 + // player 2
     32 + // commit
      1 + // shape
      1 + // shape
      1 + // stage
      8 ; // date
}

// ? bytes
#[derive(AnchorDeserialize, AnchorSerialize, Clone, PartialEq, Copy)]
pub enum Shape {
    Paper = 0,
    Scissor = 1,
    Rock = 2,
}

// ? bytes
#[derive(AnchorDeserialize, AnchorSerialize, Clone, PartialEq)]
pub enum Stage {
    Initialized,
    Commit,
    Reveal,
    Claim,
    Complete,
}
