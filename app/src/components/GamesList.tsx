import { GameAccount } from '../web3/rpsHelper';
import { ProgramAccount } from '@project-serum/anchor';
import Game from './Game';

const GamesList = ({ games }: { games: ProgramAccount<GameAccount>[] }) => (
  <div>
    {games.map((game) => (
      <Game key={game.publicKey.toBase58()} details={game} />
    ))}
  </div>
);

export default GamesList;
