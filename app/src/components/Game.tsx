import { Link } from 'react-router-dom';
import FightButton from './FightButton';
import Countdown from 'react-countdown';
import { truncateAddress } from '../lib/utils';
import { ProgramAccount } from '@project-serum/anchor';
import { GameAccount } from 'web3/rpsHelper';
import { WSOL } from '../web3/accounts';

const ItemContent = ({
  header,
  value,
}: {
  header: string;
  value: string | React.ComponentElement<Countdown, any>;
}) => (
  <div className="flex flex-col justify-center">
    <span className="text-xxs text-item-title text-left">{header}</span>
    <span className="text-sm text-left">{value}</span>
  </div>
);

const Game = ({
  details,
  simple,
  className,
}: {
  details: ProgramAccount<GameAccount>;
  simple?: Boolean;
  className?: string;
}) => {
  const { gameId, mint, amount, playerOne, duration } = details.account;

  const isSol = mint.toBase58() === WSOL.toBase58();
  const isList = !simple ?? true;
  return (
    <div
      key={gameId.toBase58()}
      className={`${
        !isList ? 'py-2 px-4' : ''
      } bg-item-background p-5px rounded-3px flex flex-row justify-between shadow-primus mb-5px ${className}`}
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
            date={Number(details.account.lastUpdate) + Number(duration) * 1000}
            renderer={({ hours, minutes, seconds }) => {
              return (
                <div>
                  {hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
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
      {isList && (
        <Link
          to={{
            pathname: `/games/${gameId.toBase58()}`,
            state: {
              details,
            },
          }}
        >
          <FightButton />
        </Link>
      )}
    </div>
  );
};

export default Game;
