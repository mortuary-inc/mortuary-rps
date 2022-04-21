import Disconnect from '../features/Connect/Disconnect';
import Connect from 'features/Connect/Connect';
import 'components/Footer/Footer.css';
import LogoText from './LogoText';
import { Button } from './Button';
import { ReactComponent as ArrowLeftSVG } from 'assets/arrow-left.svg';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';

import { ReactComponent as Rocket } from 'assets/rocket.svg';
import { ReactComponent as Plasma } from 'assets/plasma.svg';
import { ReactComponent as Sniper } from 'assets/sniper.svg';

import styles from './TopLink.module.css';

const TopLink = () => {
  const history = useHistory();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  return (
    <>
      <div
        className={`${
          styles.scroll
        } h-screen overflow-y-auto z-20 flex col w-72 p-5 absolute top-0 transition-all bg-rps-info-bg shadow-info ${
          isInfoOpen ? 'left-0' : '-left-80'
        }`}
      >
        <div className="absolute right-0 z-30 mr-5 -mt-1">
          <Button
            variant="secondary"
            className="font-serif px-4 z"
            onClick={() => setIsInfoOpen(false)}
          >
            X
          </Button>
        </div>
        <div className="mt-20 flex flex-col">
          <div className="w-full">
            <div className="font-serif text-2xl">Currency</div>
            <div className="font-sans mt-2">
              The bids can be made in two currencies. Choose wisely: increase your $ASH stash or
              become a SOL whale.
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="font-serif text-2xl">Bid</div>
            <div className="font-sans mt-2">
              Be it in $ASH or in SOL, select the amount you want to play with. Please only bet
              amounts you are comfortable parting with.
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="font-serif text-2xl">Weapons</div>
            <div className="font-sans mt-2">
              It's a robot rock-paper-scissor game, how complicated can that be?
            </div>
            <div className="flex flex-row p-2 gap-2">
              <Rocket className="w-1/5 bg-white h-10 px-1 rounded-3px" />
              <div className="flex-col w-4/5">
                <div className="font-serif text-base">ROCKET</div>
                <div className="text-sm">
                  Rocket beats Plasma. Why bother with accuracy when you can make everything go
                  KABOOM!
                </div>
              </div>
            </div>
            <div className="flex flex-row p-2 gap-2">
              <Plasma className="w-1/5 bg-white h-10 px-1 rounded-3px" />
              <div className="flex-col w-4/5">
                <div className="font-serif text-base">PLASMA</div>
                <div className="text-sm">
                  Plasma beats sniper. The melting power of condensed energy: PEW PEW.
                </div>
              </div>
            </div>
            <div className="flex flex-row p-2 gap-2">
              <Sniper className={'w-1/5 bg-white h-10 px-1 rounded-3px ' + styles.sniper} />
              <div className="flex-col w-4/5">
                <div className="font-serif text-base">SNIPER</div>
                <div className="text-sm">
                  Sniper beats Rocket. Stay hidden and unleash Death from afar: BANG!
                </div>
              </div>
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="font-serif text-2xl">Timer</div>
            <div className="font-sans mt-2">
              Choose the time window during which player 1 (you) and player 2 (your opponent) can
              select your respective weapon. A game that does not find an opponent after the timer
              runs out is discarded. Once both players have selected their weapons, player 1 has the
              same time frame to reveal the results. If the timer runs out, player 2 wins the game.
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="font-serif text-2xl">Password</div>
            <div className="font-sans mt-2">
              Pick a password to encrypt your play on the blockchain. Don’t lose it, you will need
              it to reveal the results. If lost, retrieving your password is impossible.
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="font-serif text-2xl">Bugs</div>
            <div className="font-sans mt-2">
              Should you encounter any bugs, please contact the Mortuary team on their Discord.
            </div>
          </div>
        </div>
      </div>
      <div className="flex row justify-between z-10 relative">
        <div className="flex justify-start">
          <Button variant="secondary" className="h-10 px-3 mr-2" onClick={() => history.goBack()}>
            <ArrowLeftSVG />
          </Button>
          <Button
            variant="secondary"
            className="h-10 px-6 mr-1"
            onClick={() => setIsInfoOpen(true)}
          >
            INFO
          </Button>
        </div>
        <LogoText />
        <div className="">
          <Connect />
          <Disconnect className="py-1 h-10" />
        </div>
      </div>
    </>
  );
};

export default TopLink;
