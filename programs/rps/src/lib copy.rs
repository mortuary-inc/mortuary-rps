// use anchor_lang::prelude::*;
// use solana_program::keccak::hash;

// declare_id!("mrpS6sKBAujMGDi2cC2USJNNGW8BHNLt2uzWYRsQ3Pk");

// // to do
// // how to hash
// // RIGHT STAGE RIGHT USER

// // https://gist.github.com/awcchungster/f865afefcda74d1985c066fa26775a7c
// // one stage paper scissors rock
// // need to find a more efficent way to write assertions than if statements -> could use macros?
// // update account state before sending funds to prevent reentrancy 
// /*
// Key
// Paper - 0
// Scissors - 1
// Rock - 2
// */

// /*
// Conditions to pass a stage
// Connect -> Player 2 joined
// Commit -> Player 2 joined, player 1 & player 2 commit values
// Reveal -> Player 1 & Player 2 reveal values
// Claim -> Winner has taken tokens
// Reset

// anyone know the initial space requirement for a vector (e.g. X + 32*(number of pubkeys stored))? new to rust and couldnt find a good answer
// Using borsh, 4 bytes for the length + N * however much space borsh takes for each element
// */

// #[program]
// pub mod rps {

//     use super::*;

//     pub fn test_hash(_ctx : Context<Misc>, input : String) -> ProgramResult {
//         msg!("input is {}",input);
//         msg!("hash is {:?}",hash(&input.as_bytes()).to_bytes());
//         Err(ProgramError::InvalidArgument)
//     }

//     pub fn initialise_controller(ctx : Context<InitControllerAcc>) -> ProgramResult {
//         let controller_account = &mut ctx.accounts.controller_account;
//         controller_account.player_one = ctx.accounts.user.key();
//         controller_account.player_two = None;
//         controller_account.player_one_committed = None;
//         controller_account.player_two_committed = None;
//         controller_account.player_one_revealed = None;
//         controller_account.player_two_revealed = None;
//         controller_account.stage = Stage::Connect;
//         controller_account.last_relevant_block = None;
//         controller_account.last_loser = None;

//         Ok(())
//     }

//     pub fn connect(ctx : Context<Connect>) -> ProgramResult {
//         let controller_account = &mut ctx.accounts.controller_account;
//         let user = & ctx.accounts.user;
        
//         if controller_account.stage != Stage::Connect {
//             msg!("Cannot connect while not in the connect stage!");
//             return Err(ProgramError::InvalidArgument);
//         }
//         if controller_account.player_two != None {
//             msg!("Game is full.");
//             return Err(ProgramError::InvalidArgument);
//         }
//         // prevent own user from joining since program was not designed with this in mind
//         if user.key() == controller_account.player_one {
//             msg!("You cannot join your own game!");
//             return Err(ProgramError::InvalidInstructionData);
//         }

//         controller_account.player_two = Some(user.key());
//         controller_account.stage = Stage::Commit;
//         controller_account.last_relevant_block = Some(Clock::get().unwrap().unix_timestamp);
//         Ok(())
//     }

//     pub fn commit(ctx : Context<Commit>, hash : [u8; 32]) -> ProgramResult {
//         // sends a hash to the controller
//         let controller_account = &mut ctx.accounts.controller_account;
//         let user = & ctx.accounts.user;

//         if controller_account.stage != Stage::Commit {
//             msg!("Cannot commit while not in the correct stage!");
//             return Err(ProgramError::InvalidArgument);
//         }
//         // had a silly mistake here when i used || instead of && and spent a few hours wondering why it wouldn't work
//         if user.key() != controller_account.player_one && user.key() != controller_account.player_two.unwrap() {
//             msg!("Player is not part of the game.");
//             return Err(ProgramError::InvalidArgument);
//         }

//         if user.key() == controller_account.player_one {
//             controller_account.player_one_committed = Some(hash);
//         } else if user.key() == controller_account.player_two.unwrap() {
//             controller_account.player_two_committed = Some(hash);
//         } else {
//             msg!("Error matching user with player");
//             return Err(ProgramError::InvalidArgument);
//         }

//         // check if we can progress to the next stage
//         if controller_account.player_one_committed == None || 
//         controller_account.player_two_committed == None {
//             msg!("Not all players have committed");
//             return Ok(());
//         }
//         controller_account.stage = Stage::Reveal;
//         controller_account.last_relevant_block = Some(Clock::get().unwrap().unix_timestamp);
//         Ok(())
//     }
//     // we have to check if the value + salt is the correct hash
//     // // not sure if we can pass in a &str since it requires a determined size

//     // take in string as full and get sale and value out of string
//     pub fn reveal(ctx : Context<Reveal>, input : String) -> ProgramResult {
//         let controller_account = &mut ctx.accounts.controller_account;
//         let user = & ctx.accounts.user;
//         let value : u8;
//         msg!("The byte array of input is {:?}",input.as_bytes());
//         match input.as_bytes()[0] {
//             48 => value = 0,
//             49 => value = 1,
//             50 => value = 2,
//             _ => value = 4,
//         }
//         if controller_account.stage != Stage::Reveal {
//             msg!("Cannot reveal while not in the correct stage!");
//             return Err(ProgramError::InvalidArgument);
//         }
//         if user.key() != controller_account.player_one && user.key() != controller_account.player_two.unwrap() {
//             msg!("Player is not part of the game.");
//             return Err(ProgramError::InvalidArgument);
//         }
//         if value >= 3 {
//             msg!("Not a valid shape!");
//             return Err(ProgramError::InvalidArgument);
//         }

//         /*
//                 msg!("input is {}",input);
//         msg!("hash is {:?}",hash(&input.as_bytes()).to_bytes());
//         Err(ProgramError::InvalidArgument)*/
//         let result = hash(&input.as_bytes());
//         msg!("The input is: {:?}",&input);
//         msg!("The hash is: {:?}",result.to_bytes());
//         msg!("P1 HASH : {:?}",controller_account.player_one_committed.unwrap());
//         msg!("P2 HASH : {:?}",controller_account.player_two_committed.unwrap());
//         // turn result into

//         if user.key() == controller_account.player_one {
//             if result.to_bytes() == controller_account.player_one_committed.unwrap() {
//                 if value == 0 {
//                     controller_account.player_one_revealed = Some(Shape::Paper);
//                 } else if value == 1 {
//                     controller_account.player_one_revealed = Some(Shape::Scissor);
//                 } else if value == 2 {
//                     controller_account.player_one_revealed = Some(Shape::Rock);
//                 }
//             } else {
//                 msg!("Incorrect value or salt!");
//                 return Err(ProgramError::InvalidArgument);
//             }
//         } else if user.key() == controller_account.player_two.unwrap() {
//             if result.to_bytes() == controller_account.player_two_committed.unwrap() {
//                 if value == 0 {
//                     controller_account.player_two_revealed = Some(Shape::Paper);
//                 } else if value == 1 {
//                     controller_account.player_two_revealed = Some(Shape::Scissor);
//                 } else if value == 2 {
//                     controller_account.player_two_revealed = Some(Shape::Rock);
//                 }
//             } else {
//                 msg!("Incorrect value or salt!");
//                 return Err(ProgramError::InvalidArgument);
//             }
//         } else {
//             msg!("Not sure what happened here.");
//             return Err(ProgramError::InvalidInstructionData);
//         }

//         if controller_account.player_one_revealed == None || 
//         controller_account.player_two_revealed == None {
//             msg!("Not all players have revealed");
//             return Ok(());
//         }
//         controller_account.stage = Stage::Claim;
//         controller_account.last_relevant_block = Some(Clock::get().unwrap().unix_timestamp);
//         Ok(())
//     }
    
//     pub fn claim(ctx : Context<Claim>) -> ProgramResult {
//         // logic for game
//         let controller_account = &mut ctx.accounts.controller_account;
//         let user = & ctx.accounts.user;
//         let mut winner : bool = true;

//         if controller_account.stage != Stage::Claim {
//             msg!("Cannot claim while not in the correct stage!");
//             return Err(ProgramError::InvalidArgument);
//         }
//         if user.key() != controller_account.player_one && user.key() != controller_account.player_two.unwrap() {
//             msg!("Player is not part of the game.");
//             return Err(ProgramError::InvalidArgument);
//         }

//         // research how to pass values back to react page
//         if controller_account.player_one_revealed.unwrap() == controller_account.player_two_revealed.unwrap() {
//             msg!("Draw");
//             controller_account.stage = Stage::Complete;
//             return Ok(());
//         } else if controller_account.player_one_revealed.unwrap() == Shape::Paper {
//             if controller_account.player_two_revealed.unwrap() == Shape::Scissor {
//                 msg!("Player 2 Wins");
//                 winner = true;
//             } else {
//                 msg!("Player 1 Wins");
//                 winner = false;
//             }
//         } else if controller_account.player_one_revealed.unwrap() == Shape::Scissor {
//             if controller_account.player_two_revealed.unwrap() == Shape::Rock {
//                 msg!("Player 2 Wins");
//                 winner = true;
//             } else {
//                 msg!("Player 1 Wins");
//                 winner = false;
//             }
//         } else if controller_account.player_one_revealed.unwrap() == Shape::Rock {
//             if controller_account.player_two_revealed.unwrap() == Shape::Paper {
//                 msg!("Player 2 Wins");
//                 winner = true;
//             } else {
//                 msg!("Player 1 Wins");
//                 winner = false;
//             }
//         }
//         if winner == false {
//             controller_account.last_loser = Some(controller_account.player_two.unwrap());
//         } else {
//             controller_account.last_loser = Some(controller_account.player_one);
//         }
//         controller_account.stage = Stage::Complete;
//         Ok(())
//     }

//     pub fn reset(ctx : Context<Reset>) -> ProgramResult {
//         // require that we are in stage complete
//         let controller_account = &mut ctx.accounts.controller_account;
//         let user = & ctx.accounts.user;

//         if controller_account.stage != Stage::Complete {
//             msg!("Cannot reset while not in the correct stage!");
//             return Err(ProgramError::InvalidArgument);
//         }
//         if user.key() != controller_account.player_one && user.key() != controller_account.player_two.unwrap() {
//             msg!("Player is not part of the game.");
//             return Err(ProgramError::InvalidArgument);
//         }

//         controller_account.player_two = None;
//         controller_account.player_one_committed = None;
//         controller_account.player_two_committed = None;
//         controller_account.player_one_revealed = None;
//         controller_account.player_one_revealed = None;
//         controller_account.stage = Stage::Connect;
//         controller_account.last_relevant_block = None;
//         Ok(())
//     }

//     // opponent takes too long, look at blockheight and reset all
//     // let the slasher take the funds and then 
//     // check if wallet owns account, otherwise create new account -> create new function
//     pub fn slash(ctx : Context<Slash>) -> ProgramResult {
//         // 5 minutes until slash
//         let controller_account = &mut ctx.accounts.controller_account;
//         let user = & ctx.accounts.user;
        
//         if user.key() != controller_account.player_one && user.key() != controller_account.player_two.unwrap() {
//             msg!("Player is not part of the game.");
//             return Err(ProgramError::InvalidArgument);
//         }
//         // not sure unwrap works here
//         //600 second / 0.4 = 6000/4 = 1250
//         if Clock::get().unwrap().unix_timestamp - controller_account.last_relevant_block.unwrap() >= 1250 {
//             // we are sure they have timed out
//             match controller_account.stage {
//                 Stage::Commit => {
//                     // player is not funding account -> reset

//                     // sends funds back to player who has committed a value
//                     // p1 has not committed, p2 has not committed, p1 & p2 not committted
//                     if controller_account.player_one_committed == None && controller_account.player_two_committed == None {
//                         if user.key() == controller_account.player_one {
//                             controller_account.last_loser = Some(controller_account.player_two.unwrap());
//                         } else {
//                             controller_account.last_loser = Some(controller_account.player_one);
//                         }
//                     } else if controller_account.player_one_committed == None {
//                         // sends to player two
//                         controller_account.last_loser = Some(controller_account.player_one);
//                     } else if controller_account.player_two_committed == None {
//                         // send to player one
//                         controller_account.last_loser = Some(controller_account.player_two.unwrap());
//                     }

//                     controller_account.player_two = None;
//                     controller_account.player_one_committed = None;
//                     controller_account.player_two_committed = None;
//                     controller_account.player_one_revealed = None;
//                     controller_account.player_one_revealed = None;
//                     controller_account.stage = Stage::Connect;
//                     controller_account.last_relevant_block = None;

//                     return Ok(());
//                 },
//                 Stage::Reveal => {
//                     // one player is not revealing -> sent to revealed player
//                     if controller_account.player_one_revealed == None && controller_account.player_two_revealed == None {
//                         // sends to user who called
//                         if user.key() == controller_account.player_one {
//                             controller_account.last_loser = Some(controller_account.player_two.unwrap());
//                         } else {
//                             controller_account.last_loser = Some(controller_account.player_one);
//                         }
//                     } else if controller_account.player_one_revealed == None {
//                         // sends to player two
//                         controller_account.last_loser = Some(controller_account.player_one);
//                     } else if controller_account.player_two_revealed == None {
//                         // send to player one
//                         controller_account.last_loser = Some(controller_account.player_two.unwrap());
//                     }

//                     controller_account.player_two = None;
//                     controller_account.player_one_committed = None;
//                     controller_account.player_two_committed = None;
//                     controller_account.player_one_revealed = None;
//                     controller_account.player_one_revealed = None;
//                     controller_account.stage = Stage::Connect;
//                     controller_account.last_relevant_block = None;

//                     return Ok(());
//                 },
//                 Stage::Claim => {
//                     // winner has not claimed -> user who calls takes funds
//                     if user.key() == controller_account.player_one {
//                         controller_account.last_loser = Some(controller_account.player_two.unwrap());
//                     } else {
//                         controller_account.last_loser = Some(controller_account.player_one);
//                     }
//                     controller_account.player_two = None;
//                     controller_account.player_one_committed = None;
//                     controller_account.player_two_committed = None;
//                     controller_account.player_one_revealed = None;
//                     controller_account.player_one_revealed = None;
//                     controller_account.stage = Stage::Connect;
//                     controller_account.last_relevant_block = None;

//                     return Ok(());
//                 },
//                 _ => {
//                     msg!("Player 2 has not joined. Unable to slash");
//                     return Err(ProgramError::InvalidArgument);
//                 }
//             }
//         }
//         Ok(())
//     }

//     /*
//     pub fn initialise_queue(ctx : Context<InitQueueAcc>) -> ProgramResult {
//         Ok(())
//     }
//     pub fn join_queue(ctx : Context<JoinQueue>) {
//         Ok(())
//     }
//     pub fn connect_queue(ctx : Context<ConnectQueue>) {
//         Ok(())
//     }
//     */
// }

// // SINCE THE CONTEXT ARE THE SAME YOU ONLY NEED ONE CONTEXT!!!

// #[derive(Accounts)]
// pub struct InitControllerAcc<'info> {
//     #[account(init, payer = user, space = 200)]
//     pub controller_account : Account<'info,ControllerAccount>,
//     #[account(mut)]
//     pub user : Signer<'info>,
//     pub system_program : Program<'info,System>,
// }

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

// #[derive(Accounts)]
// pub struct Misc {}

// // 3 * 32 (pubkey) + 2 * 32 (sha) + 2 * 1 (shape) + 8 (i64) + 1 (stage) + 8 (serilisation)
// // safe is 200?
// #[account]
// pub struct ControllerAccount {
//     // owner is player 1 -> no option since constant
//     pub player_one : Pubkey,
//     pub player_two : Option<Pubkey>,
//     pub player_one_committed : Option<[u8; 32]>,
//     pub player_two_committed : Option<[u8; 32]>,
//     pub player_one_revealed : Option<Shape>,
//     pub player_two_revealed : Option<Shape>,
//     pub stage : Stage,
//     pub last_relevant_block : Option<i64>,
//     pub last_loser : Option<Pubkey>,
// }
// // ? bytes
// #[derive(AnchorDeserialize,AnchorSerialize,Clone,PartialEq,Copy)]
// pub enum Shape {
//     Paper = 0,
//     Scissor = 1,
//     Rock = 2,
// }

// // ? bytes
// #[derive(AnchorDeserialize,AnchorSerialize,Clone,PartialEq)]
// pub enum Stage {
//     Connect,
//     Commit,
//     Reveal,
//     Claim,
//     Complete,
// }

