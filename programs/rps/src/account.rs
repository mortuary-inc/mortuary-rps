use anchor_lang::{prelude::*};
use anchor_spl::token::{Mint, Token, TokenAccount};
use std::mem::size_of;

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitBank<'info> {
  #[account(
      init,
      payer = admin,
      seeds = [bank_mint.key().as_ref(), b"bank"],
      bump,
      space = 8 + size_of::<BankConfig>())]
  pub bank_config: Account<'info, BankConfig>,
  #[account(signer, mut)]
  pub admin: AccountInfo<'info>,
  #[account(mut)]
  pub bank: Account<'info, TokenAccount>,
  #[account(constraint = bank.mint  == bank_mint.key())]
  pub bank_mint: Account<'info, Mint>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(
        init,
        seeds = [b"game".as_ref(), game_id.key().as_ref()],
        bump,
        payer = player_one, 
        space = Game::LEN
    )]
    pub game: Account<'info, Game>,
    pub game_id: UncheckedAccount<'info>,
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
    pub player_one_token_account: UncheckedAccount<'info>,

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
    #[account(mut)]
    pub player_two_token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}


#[derive(Accounts)]
pub struct RevealGame<'info> {
    #[account(mut, close = player_one)]
    pub game: Account<'info, Game>,
    #[account(mut, constraint = *player_one.key == game.player_one)]
    pub player_one: Signer<'info>,
    #[account(mut, constraint = *player_two.key == game.player_two)]
    pub player_two: UncheckedAccount<'info>,
    #[account(mut, constraint = *player_one_token_account.key == game.player_one_token_account)]
    pub player_one_token_account: UncheckedAccount<'info>,
    #[account(mut, constraint = *player_two_token_account.key == game.player_two_token_account)]
    pub player_two_token_account: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [game.key().as_ref(), b"proceeds"],
        bump,
    )]
    pub proceeds: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = config.bank == *bank.key,
        constraint = config.admin == game.admin,)]
    pub config: Account<'info, BankConfig>,
    #[account(mut)]
    pub bank: UncheckedAccount<'info>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TerminateGame<'info> {
    #[account(mut /*, close = config */)]
    pub game: Account<'info, Game>,
    #[account(mut, constraint = *player_two.key == game.player_two)]
    pub player_two: UncheckedAccount<'info>,
    #[account(mut, constraint = *player_two_token_account.key == game.player_two_token_account)]
    pub player_two_token_account: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [game.key().as_ref(), b"proceeds"],
        bump,
    )]
    pub proceeds: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = config.bank == *bank.key,
        constraint = config.admin == game.admin,)]
    pub config: Account<'info, BankConfig>,
    #[account(mut)]
    pub bank: UncheckedAccount<'info>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}


#[account]
pub struct BankConfig {
    pub version: u8,
    pub admin: Pubkey,
    pub bank: Pubkey,
    pub mint: Pubkey,
    pub tax: u8,
    pub tax_draw: u8,
}


#[account]
pub struct Game {
    pub version: u8,
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub game_id: Pubkey,
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub player_one_token_account: Pubkey,
    pub player_two_token_account: Pubkey,
    pub player_one_committed: Option<[u8; 32]>,
    pub player_one_revealed: Option<Shape>,
    pub player_two_revealed: Option<Shape>,
    pub stage: Stage,
    pub last_update: i64,
    pub duration: i64,
}

impl Game {
    pub const LEN: usize = 32 + 
      1 + // version
     32 + // admin
     32 + // mint
      4 + // amount
     32 + // id
     32 + // player 1
     32 + // player 2
     32 + // player 1 token account
     32 + // player 2 token account
     32 + // commit
      1 + // shape 1
      1 + // shape 2
      1 + // stage
      8 + // date
      8; // duration
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
    Terminate = 3,
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

pub fn shape_to_text(s : Shape) -> &'static str {
    if s == Shape::Paper {
        return "Paper";  
    } 
    if s == Shape::Scissor { return "Scissor"; }
    return "Rock";
}




//
//
// Not used for now
// #[derive(Accounts)]
// pub struct CreateBet<'info> {
//     #[account(init, payer = admin, space = Bet::LEN)]
//     pub bet: Account<'info, Bet>,
//     #[account(mut)]
//     pub admin: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }
