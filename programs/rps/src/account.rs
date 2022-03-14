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

#[derive(Accounts)]
pub struct MatchGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_two: Signer<'info>,

    #[account(
        mut,
        seeds = [game.key().as_ref(), b"proceeds"],
        bump,
    )]
    pub proceeds: Account<'info, TokenAccount>,
    // pub proceeds_mint: Account<'info, Mint>,

    // pub admin: AccountInfo<'info>,
    #[account(mut)]
    pub player_two_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}


#[derive(Accounts)]
pub struct RevealGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}


#[account]
pub struct Bet {
    pub version: u8,
    pub admin: Pubkey,
    pub mint: Option<Pubkey>,
    pub amount: u32,
    pub tax: u32,
}

impl Bet {
    pub const LEN: usize = 32 + 
      1 + // version
     32 + // admin
     32 + // mint
      4 + // amount
      4;  // tax
}

#[account]
pub struct Game {
    pub version: u8,
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
    pub const LEN: usize = 32 + 
      1 + // version
     32 + // admin
     32 + // mint
      4 + // amount
     32 + // player 1
     32 + // player 2
     32 + // commit
      1 + // shape
      1 + // shape
      1 + // stage
      8; // date
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, PartialEq, Copy)]
pub enum Shape {
    Paper = 0,
    Scissor = 1,
    Rock = 2,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, PartialEq)]
pub enum Stage {
    Start = 0,
    Match = 1,
    Reveal = 2,
    Claim = 3,
    Complete = 4,
    Cancel = 5,
}

// pub fn shape_as_u8(s: &Shape) -> u8 {
//     *s as u8
// }

pub fn shape_from_u8(s: u8) -> Shape {
    let r = match s {
        0 => Shape::Paper,
        1 => Shape::Scissor,
        _ => Shape::Rock,
    };
    r
}




//
//
// Not used for now
#[derive(Accounts)]
pub struct CreateBet<'info> {
    #[account(init, payer = admin, space = Bet::LEN)]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}
