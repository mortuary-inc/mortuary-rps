use anchor_lang::prelude::*;

#[error_code]
pub enum RpsCode {
    #[msg(
        "Your combinaison (secret+move) doesn't match what you played when you started the game."
    )]
    HashDontMatch,
    #[msg("Invalid admin account provided.")]
    InvalidAdmin,

    #[msg("Invalid game state (Start) for operation")]
    GameNotStart,
    #[msg("Invalid game state (Match) for operation")]
    GameNotMatch,
    #[msg("Invalid game state (Reveal) for operation")]
    GameNotReveal,
    #[msg("Invalid game state (Claim) for operation")]
    GameNotClaim,
    #[msg("Invalid game state (Complete) for operation")]
    GameNotComplete,
    #[msg("Invalid game state (Cancel) for operation")]
    GameNotCancel,
    #[msg("Invalid account owner")]
    IncorrectOwner,
    #[msg("Numerical Overflow")]
    NumericalOverflow,
    #[msg("Game is expired")]
    GameExpired,
    #[msg("Game is live")]
    GameLive,
}

pub fn assert_owned_by(account: &AccountInfo, owner: &Pubkey) -> Result<()> {
    if account.owner != owner {
        Err(error!(RpsCode::IncorrectOwner))
    } else {
        Ok(())
    }
}
