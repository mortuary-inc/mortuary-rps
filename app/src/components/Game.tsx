import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import FightButton from './FightButton';
import Countdown from 'react-countdown';
import { truncateAddress } from '../lib/utils';
import { ProgramAccount } from '@project-serum/anchor';
import { GameAccount } from 'web3/rpsHelper';
import { WSOL } from '../web3/accounts';
import RevealButton from './RevealButton';

export const ItemContent = ({
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
  share,
}: {
  details: ProgramAccount<GameAccount>;
  simple?: Boolean;
  className?: string;
  share?: Boolean;
}) => {
  const { publicKey } = useWallet();
  const { mint, amount, playerOne, duration, lastUpdate, stage, playerTwo, playerTwoRevealed } =
    details.account;

  const isSol = mint.toBase58() === WSOL.toBase58();
  const isList = !simple ?? true;
  return (
    <div
      key={details.publicKey.toBase58()}
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
            date={(Number(lastUpdate) + Number(duration)) * 1000}
            renderer={({ hours, minutes, seconds }) => {
              return hours + minutes + seconds > 0 ? (
                <div>
                  {hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
                </div>
              ) : (
                'Expired'
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
            pathname: `/games/${details.publicKey.toBase58()}`,
          }}
        >
          {playerOne.toBase58() === publicKey?.toBase58() && stage['match'] ? (
            <RevealButton />
          ) : (
            <FightButton
              isCreator={
                playerOne.toBase58() === publicKey?.toBase58() ||
                (playerTwo?.toBase58() === publicKey?.toBase58() && playerTwoRevealed)
              }
            />
          )}
        </Link>
      )}
    </div>
  );
};

export default Game;
