import { ProgramAccount, web3 } from '@project-serum/anchor';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useLocation, useParams } from 'react-router-dom';
import { GameAccount, Shape, getGame } from 'web3/rpsHelper';
import Game from 'components/Game';
import { Tab } from '@headlessui/react';
import { Button } from 'components/Button';
import { ReactComponent as Rocket } from 'assets/rocket.svg';
import { ReactComponent as Plasma } from 'assets/plasma.svg';
import { ReactComponent as Sniper } from 'assets/sniper.svg';
import { useState, useEffect } from 'react';
import styles from './Fight.module.css';
import { fake_wallet, getATA, loadRpsProgram, match, reveal } from '../../web3/rpsHelper';
import { ASH_MINT, SOLANA_RPC_HOST } from '../../web3/accounts';

import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Notification } from '../Notification/Notification';
import Countdown from 'react-countdown';

const Fight = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { id } = useParams() as { id: string };

  const [currentGame, setCurrentGame] = useState<ProgramAccount<GameAccount>>();
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [shape, setShape] = useState<Shape>(Shape.Rock);
  const [isStartStage, setIsStartStage] = useState<boolean>(false);
  const [isGameExpired, setIsGameExpired] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (!wallet || !publicKey) return;
    let connection = new web3.Connection(SOLANA_RPC_HOST);

    const loadGame = async () => {
      const loadingToast = toast.custom(
        <Notification message={`Loading game...`} variant="info" />
      );

      try {
        let program = await loadRpsProgram(connection, wallet);
        let rpsList =
          (await program.account.game.all()) as unknown as ProgramAccount<GameAccount>[];

        const selectedGame = rpsList.find((rps) => rps.publicKey.toBase58() === id);

        //init state
        setCurrentGame(selectedGame);
        setIsStartStage(!!selectedGame?.account.stage['start']);
        setIsInitiator(selectedGame?.account.playerOne.toBase58() === publicKey.toBase58());
        setIsGameExpired(
          Number(new Date()) >
            (Number(selectedGame?.account?.lastUpdate) + Number(selectedGame?.account?.duration)) *
              1000
        );

        toast.dismiss(loadingToast);
        toast.custom(<Notification message={`Game loaded`} variant="success" />);
      } catch {
        toast.dismiss(loadingToast);
        toast.custom(<Notification message={`Failed to load game.`} variant="error" />);
      }
    };

    loadGame();
  }, [id, wallet, publicKey]);

  const handleWeaponChange = (index: Number) => {
    if (index === 0) {
      setShape(Shape.Rock);
    } else if (index === 1) {
      setShape(Shape.Paper);
    } else {
      setShape(Shape.Scissor);
    }
  };

  const handleMatchOrReveal = async () => {
    if (
      !wallet ||
      !publicKey ||
      isGameExpired ||
      (!isStartStage && !currentGame?.account.playerTwoRevealed)
    )
      return;

    let connection = new web3.Connection(SOLANA_RPC_HOST);
    let program = await loadRpsProgram(connection, wallet);

    if (isStartStage) {
      try {
        setIsMatching(true);
        toast.custom(<Notification message={`Matching...`} variant="info" />);

        const playerTwoAshToken = await getATA(publicKey, ASH_MINT);

        const [game] = await getGame(new web3.PublicKey(currentGame?.account.gameId!));

        await match(program, game, currentGame?.account.mint!, publicKey, playerTwoAshToken, shape);
        toast.custom(<Notification message={`Matched!`} variant="success" />);
        setIsMatching(false);
      } catch (e) {
        toast.custom(<Notification message={`Failed to match. ${e}`} variant="error" />);
        setIsMatching(false);
      }
    } else if (
      currentGame?.account.playerTwoRevealed &&
      currentGame?.account.playerOne.toBase58() === publicKey.toBase58() &&
      password
    ) {
      try {
        setIsRevealing(true);
        toast.custom(<Notification message={`Revealing...`} variant="info" />);

        const [game] = await getGame(new web3.PublicKey(currentGame?.account.gameId!));

        await reveal(program, game, publicKey, 'secret');
        toast.custom(<Notification message={`Revealed!`} variant="success" />);
        setIsRevealing(false);
      } catch (e) {
        toast.custom(<Notification message={`Failed to reveal. ${e}`} variant="error" />);
        setIsRevealing(false);
      }
    }
  };

  return (
    <div className="mt-20 text-center m-auto max-w-lg">
      <div className="font-serif text-4xl text-primus-title">
        {isStartStage ? 'ARE YOU READY?' : 'GRACE PERIOD...'}
      </div>
      <div className="font-sans mt-5 text-sm text-primus-copy">Your RPS game has been created.</div>
      <div className="font-sans text-sm text-primus-copy">
        It is time to find a worthy opponent.
      </div>
      {currentGame ? (
        <Game className="mt-5" details={currentGame} simple={true} />
      ) : (
        <Skeleton count={2} />
      )}
      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-2">
        Choose your weapon
      </div>

      {isStartStage ? (
        <Tab.Group defaultIndex={0} onChange={handleWeaponChange}>
          <Tab.List className="h-44 w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
            <Tab
              className={({ selected }) =>
                `bg-rps-bg h-full w-full rounded-3px ${!selected ? '' : 'shadow-border'}`
              }
            >
              <Rocket
                className={`m-auto ${shape === Shape.Rock ? styles.selected : styles.unselected}`}
              />
            </Tab>
            <Tab
              className={({ selected }) =>
                `bg-rps-bg h-full w-full rounded-3px ${
                  !selected ? '' : 'shadow-border text-primus-orange'
                }`
              }
            >
              <Plasma
                className={`m-auto ${shape === Shape.Paper ? styles.selected : styles.unselected}`}
              />
            </Tab>
            <Tab
              className={({ selected }) =>
                `bg-rps-bg h-full w-full rounded-3px ${!selected ? '' : 'shadow-border'}`
              }
            >
              <Sniper
                className={`m-auto ${
                  shape === Shape.Scissor ? styles.selected : styles.unselected
                }`}
              />
            </Tab>
          </Tab.List>
        </Tab.Group>
      ) : (
        <div>Fighting Placeholder</div>
      )}

      {isInitiator && currentGame?.account.playerTwoRevealed && (
        <>
          <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">
            Enter your password
          </div>
          <div className="h-70px w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
            <input
              type="password"
              placeholder="INSERT YOUR PASSWORD HERE"
              className="bg-primus-light-orange px-4 rounded-3px w-full font-serif text-2xl"
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
        </>
      )}

      {!publicKey ? (
        <Button
          variant="cta"
          disabled
          className="opacity-50 cursor-not-allowed bg-primus-dark-grey"
          onClick={() => {}}
        >
          CONNECT WALLET TO FIGHT
        </Button>
      ) : isGameExpired ? (
        <Button
          variant="cta"
          disabled
          className="opacity-50 cursor-not-allowed bg-primus-dark-grey"
          onClick={() => {}}
        >
          EXPIRED
        </Button>
      ) : isStartStage && !isInitiator ? (
        <Button
          variant="cta"
          onClick={handleMatchOrReveal}
          className={`${isMatching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isMatching ? 'MATCHING...' : 'MATCH'}
        </Button>
      ) : (
        <Button
          variant="cta"
          onClick={handleMatchOrReveal}
          className={`${isRevealing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRevealing ? 'REVEALING...' : 'REVEAL NOW'}
        </Button>
      )}
    </div>
  );
};

export default Fight;