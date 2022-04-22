import { web3 } from '@project-serum/anchor';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { Shape } from 'web3/rpsHelper';
import { Tab } from '@headlessui/react';
import { Button } from 'components/Button';
import { ReactComponent as Rocket } from 'assets/rocket.svg';
import { ReactComponent as Plasma } from 'assets/plasma.svg';
import { ReactComponent as Sniper } from 'assets/sniper.svg';
import { useState } from 'react';
import { getATA, loadRpsProgram, start } from '../../web3/rpsHelper';
import { ADMIN, ASH_MINT, SOLANA_RPC_HOST, WSOL } from '../../web3/accounts';
import styles from './Create.module.css';

import toast from 'react-hot-toast';
import { Notification } from '../Notification/Notification';
import { useHistory } from 'react-router-dom';

const currencyOptions = {
  ASH: [25, 100, 250, 500],
  SOL: [0.1, 0.5, 1, 2],
};

const Create = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const history = useHistory();

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'ASH' | 'SOL'>('ASH');
  const [bidIndex, setBidIndex] = useState<number>(0);
  const [shape, setShape] = useState<Shape>(Shape.Rock);
  const [timer, setTimer] = useState<number>(3600);
  const [password, setPassword] = useState<string>('');
  const [reveal, setReveal] = useState<boolean>(false);

  const handleWeaponChange = (index: Number) => {
    if (index === 0) {
      setShape(Shape.Rock);
    } else if (index === 1) {
      setShape(Shape.Paper);
    } else {
      setShape(Shape.Scissor);
    }
  };

  const handleSubmit = async () => {
    if (!wallet || !publicKey) {
      toast.custom(
        <Notification
          message="Please connect wallet to create a game (button in the top-right corner)"
          variant="info"
        />
      );
      return;
    }

    if (isCreating || !password || shape < 0 || shape > 2 || !timer) return;

    const loadingToast = toast.custom(
      <Notification message={`Creating game...`} variant="info" />,
      { duration: 61000 }
    );
    setIsCreating(true);
    try {
      const connection = new web3.Connection(SOLANA_RPC_HOST);
      const program = await loadRpsProgram(connection, wallet);

      const playerOneAshToken = await getATA(publicKey, ASH_MINT);

      console.log({
        program,
        ADMIN,
        publicKey,
        mint: currency === 'ASH' ? ASH_MINT : WSOL,
        playerOneAshToken,
        amount: currencyOptions[currency][bidIndex],
        password,
        shape,
        timer,
      });

      const { game } = await start(
        program,
        ADMIN,
        publicKey,
        currency === 'ASH' ? ASH_MINT : WSOL,
        playerOneAshToken,
        currencyOptions[currency][bidIndex],
        password,
        shape,
        timer
      );

      history.push(`/games/${game.toBase58()}/share`);

      toast.dismiss(loadingToast);
      setIsCreating(false);
      // toast.custom(<Notification message={`Game ${game.toBase58()} created`} variant="success" />);
    } catch (error) {
      toast.dismiss(loadingToast);
      setIsCreating(false);
      toast.custom(<Notification message={`${error}`} variant="error" />);
    }
  };

  return (
    <div className="mt-20 text-center m-auto max-w-lg">
      <div className="font-serif text-4xl text-primus-title">CREATE A NEW GAME </div>

      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">
        Choose your currency
      </div>
      <Tab.Group
        defaultIndex={0}
        onChange={(index) => {
          if (index === 0) {
            setCurrency('ASH');
          } else {
            setCurrency('SOL');
          }
        }}
      >
        <Tab.List className="h-70px w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                !selected
                  ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            $ASH
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                !selected
                  ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            $SOL
          </Tab>
        </Tab.List>
      </Tab.Group>

      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">Choose your bid</div>
      <Tab.Group
        defaultIndex={0}
        onChange={(index) => {
          setBidIndex(index);
        }}
      >
        <Tab.List className="h-70px w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
          {currencyOptions[currency].map((bid, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                  !selected
                    ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                    : 'shadow-border text-primus-orange'
                }`
              }
            >
              {bid}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>

      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">
        Choose your weapon
      </div>
      <Tab.Group defaultIndex={0} onChange={handleWeaponChange}>
        <Tab.List className="h-44 w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px ${
                !selected ? 'hover:bg-primus-grey hover:opacity-60' : 'shadow-border'
              }`
            }
          >
            <Rocket
              className={`m-auto ${shape === Shape.Rock ? styles.selected : styles.unselected}`}
            />
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px ${
                !selected
                  ? 'hover:bg-primus-grey hover:opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            <Plasma
              className={`m-auto ${shape === Shape.Paper ? styles.selected : styles.unselected}`}
            />
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px ${
                !selected ? 'hover:bg-primus-grey hover:opacity-60' : 'shadow-border'
              }`
            }
          >
            <Sniper
              className={`m-auto ${shape === Shape.Scissor ? styles.selected : styles.unselected}`}
            />
          </Tab>
        </Tab.List>
      </Tab.Group>

      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">Pick a timer</div>
      <Tab.Group
        defaultIndex={0}
        onChange={(index) => {
          setTimer(
            index === 0 ? 3600 : index === 1 ? 6 * 3600 : index === 2 ? 12 * 3600 : 24 * 3600
          );
        }}
      >
        <Tab.List className="h-70px w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                !selected
                  ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            1 HOUR
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                !selected
                  ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            6 HOURS
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                !selected
                  ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            12 HOURS
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full transition-all rounded-3px font-serif text-2xl ${
                !selected
                  ? 'text-primus-grey hover:bg-primus-grey hover:bg-opacity-60'
                  : 'shadow-border text-primus-orange'
              }`
            }
          >
            24 HOURS
          </Tab>
        </Tab.List>
      </Tab.Group>

      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">
        Select a password
      </div>
      <div className="h-70px w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px relative">
        <input
          type={reveal ? 'text' : 'password'}
          placeholder="INSERT YOUR PASSWORD HERE"
          className="bg-primus-light-orange px-4 rounded-3px w-full font-serif text-2xl"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button
          className="cursor-pointer absolute right-4 top-4 text-3xl text-primus-dark-grey"
          onClick={() => setReveal(!reveal)}
        >
          {reveal ? '🙉' : '🙈'}
        </button>
      </div>

      <Button
        variant="cta"
        onClick={handleSubmit}
        disabled={isCreating || !wallet || !password || shape < 0 || shape > 2 || !timer}
        className={`${
          isCreating || !wallet || !password || shape < 0 || shape > 2 || !timer
            ? 'opacity-50 cursor-not-allowed bg-primus-grey'
            : ''
        }`}
      >
        {!publicKey ? 'CONNECT WALLET TO CREATE' : isCreating ? 'CREATING GAME...' : 'CREATE GAME'}
      </Button>
    </div>
  );
};

export default Create;
