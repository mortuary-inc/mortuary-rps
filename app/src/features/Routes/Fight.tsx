import { ProgramAccount } from '@project-serum/anchor';
import { useLocation, useParams } from 'react-router-dom';
import { GameAccount, Shape } from 'web3/rpsHelper';
import Game from 'components/Game';
import { Tab } from '@headlessui/react';
import { Button } from 'components/Button';
import { ReactComponent as Rocket } from 'assets/rocket.svg';
import { ReactComponent as Plasma } from 'assets/plasma.svg';
import { ReactComponent as Sniper } from 'assets/sniper.svg';
import { useState } from 'react';

const Fight = () => {
  const { id } = useParams() as { id: string };
  const {
    state: { details },
  } = useLocation() as unknown as { state: { details: ProgramAccount<GameAccount> } };
  const [shape, setShape] = useState<Shape>(Shape.Rock);

  const handleWeaponChange = (index: Number) => {
    if (index === 0) {
      setShape(Shape.Rock);
    } else if (index === 1) {
      setShape(Shape.Paper);
    } else {
      setShape(Shape.Scissor);
    }
  };

  return (
    <div className="mt-20 text-center m-auto max-w-lg">
      <div className="font-serif text-4xl text-primus-title">ARE YOU READY?</div>
      <div className="font-sans mt-5 text-sm text-primus-copy">Your RPS game has been created.</div>
      <div className="font-sans text-sm text-primus-copy">
        It is time to find a worthy opponent.
      </div>
      {details && <Game className="mt-5" details={details} simple={true} />}
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
            <Rocket className={`m-auto ${shape === Shape.Rock ? 'text-primus-orange' : ''}`} />
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full rounded-3px ${
                !selected ? '' : 'shadow-border text-primus-orange'
              }`
            }
          >
            <Plasma className={`m-auto ${shape === Shape.Paper ? '' : ''}`} />
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-rps-bg h-full w-full rounded-3px ${!selected ? '' : 'shadow-border'}`
            }
          >
            <Sniper className={`m-auto ${shape === Shape.Scissor ? 'text-primus-orange' : ''}`} />
          </Tab>
        </Tab.List>
      </Tab.Group>
      <Button variant="cta" onClick={() => {}}>
        FIGHT
      </Button>
    </div>
  );
};

export default Fight;
