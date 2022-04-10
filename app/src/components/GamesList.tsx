import { Link } from 'react-router-dom';
import { GameAccount } from '../web3/rpsHelper';
import FightButton from './FightButton';
import Countdown from 'react-countdown';
import { WSOL } from '../web3/accounts';
import { truncateAddress } from '../lib/utils';
import { ProgramAccount } from '@project-serum/anchor';

const ItemContent = ({
  header,
  value,
}: {
  header: string;
  value: string | React.ComponentElement<Countdown, any>;
}) => (
  <div className="flex flex-col justify-center">
    <span className="text-xxs text-item-title">{header}</span>
    <span className="text-sm">{value}</span>
  </div>
);

const GamesList = ({ games }: { games: ProgramAccount<GameAccount>[] }) => (
  <div>
    {games.map((game) => {
      const { gameId, mint, amount, playerOne, duration } = game.account;

      const isSol = mint.toBase58() === WSOL.toBase58();
      const isList = true;
      return (
        <div
          key={gameId.toBase58()}
          className="bg-item-background p-5px rounded-3px flex flex-row justify-between shadow-primus mb-5px"
        >
          {isList &&
            (isSol ? (
              <img className="rounded-3px" src={require('../assets/sol.png').default} alt="sol" />
            ) : (
              <img className="rounded-3px" src={require('../assets/ash.png').default} alt="ash" />
            ))}
          <ItemContent
            header={'TIME'}
            value={
              <Countdown
                date={Number(game.account.lastUpdate) + Number(duration) * 1000}
                renderer={({ hours, minutes, seconds }) => {
                  return (
                    <div>
                      {hours}:{minutes}:{seconds}
                    </div>
                  );
                }}
              />
            }
          />
          <ItemContent header={'CURRENCY'} value={`${isSol ? '$SOL' : '$ASH'}`} />
          <ItemContent
            header={'BID'}
            value={isSol ? (Number(amount) / 1000000000).toFixed(2) : Number(amount).toString()}
          />
          <ItemContent header={'PLAYER 1'} value={truncateAddress(playerOne.toBase58())} />
          <Link to={`/games/${gameId.toBase58()}`}>
            <FightButton />
          </Link>
        </div>
      );
    })}
  </div>
);

export default GamesList;
