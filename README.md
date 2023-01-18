# Solana Rock paper scissors

Initialy created for MortuaryInc LoP PvP.
Legions of Primus Battlegrounds is an on-chain player vs player rock-paper-scissors game


## How does it work: 

1. Player 1 creates a game and chooses a currency (spl-token or SOL), a bid, a weapon (Rocket, Plasma, Sniper)
    - Player 1 also have to choose a password to encrypt the weapon on the blockchain
    - Player 1 also have to choose a timer for each round.

2. After X hours, if no-one enter the game, the player 1 can get his bid back

3. If player 2 enter the game, then, player 1 has X hours to end the game. To end the game, player 1 has to provide his secret. The winner get the price. Mortuary get a small % on the win.

4. If player 1, doesn't end the game before X hours, it is possible for the player to end it (and get the price)

## Build, Deploy, Test

Done with anchor
```
anchor build
anchor test
anchor deploy
```
