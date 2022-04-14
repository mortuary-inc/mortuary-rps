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
import { fake_wallet, getATA, loadRpsProgram, match } from '../../web3/rpsHelper';
import { ASH_MINT, SOLANA_RPC_HOST } from '../../web3/accounts';

import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Notification } from '../Notification/Notification';

const Fight = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { id } = useParams() as { id: string };

  const [currentGame, setCurrentGame] = useState<ProgramAccount<GameAccount>>();
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [shape, setShape] = useState<Shape>(Shape.Rock);

  useEffect(() => {
    let connection = new web3.Connection(SOLANA_RPC_HOST);

    const loadGame = async () => {
      try {
        toast.custom(<Notification message={`Loading game...`} variant="info" />);

        let program = await loadRpsProgram(connection, fake_wallet);
        let rpsList =
          (await program.account.game.all()) as unknown as ProgramAccount<GameAccount>[];

        setCurrentGame(rpsList.find((rps) => rps.publicKey.toBase58() === id));
        toast.custom(<Notification message={`Game loaded`} variant="success" />);
      } catch {
        toast.custom(<Notification message={`Failed to load game.`} variant="error" />);
      }
    };

    loadGame();
  }, [id]);

  const handleWeaponChange = (index: Number) => {
    if (index === 0) {
      setShape(Shape.Rock);
    } else if (index === 1) {
      setShape(Shape.Paper);
    } else {
      setShape(Shape.Scissor);
    }
  };

  const handleMatch = async () => {
    if (!wallet || !publicKey) return;

    let connection = new web3.Connection(SOLANA_RPC_HOST);
    let program = await loadRpsProgram(connection, wallet);

    try {
      setIsMatching(true);
      toast.custom(<Notification message={`Matching...`} variant="info" />);

      const playerTwoAshToken = await getATA(publicKey, ASH_MINT);

      const [game] = await getGame(new web3.PublicKey(id));

      await match(program, game, game, publicKey, playerTwoAshToken, shape);
      toast.custom(<Notification message={`Matched!`} variant="success" />);
      setIsMatching(false);
    } catch (e) {
      toast.custom(<Notification message={`Failed to match. ${e}`} variant="error" />);
      setIsMatching(false);
    }
  };

  return (
    <div className="mt-20 text-center m-auto max-w-lg">
      <div className="font-serif text-4xl text-primus-title">ARE YOU READY?</div>
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
              className={`m-auto ${shape === Shape.Scissor ? styles.selected : styles.unselected}`}
            />
          </Tab>
        </Tab.List>
      </Tab.Group>
      <Button
        variant="cta"
        onClick={handleMatch}
        disabled={isMatching || !wallet}
        className={`${
          isMatching || !wallet ? 'opacity-50 cursor-not-allowed bg-primus-dark-grey' : ''
        }`}
      >
        {isMatching ? 'MATCHING...' : wallet ? 'FIGHT' : 'CONNECT WALLET TO FIGHT'}
      </Button>
    </div>
  );
};

export default Fight;
