import { ProgramAccount, web3 } from '@project-serum/anchor';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import GamesList from '../../components/GamesList';
import { ADMIN, ASH_MINT, SOLANA_RPC_HOST, WSOL } from '../../web3/accounts';
import { Tab } from '@headlessui/react';
import { GameAccount, getATA, loadRpsProgram, Shape, start } from '../../web3/rpsHelper';
import Connect from '../Connect/Connect';
import Disconnect from '../Connect/Disconnect';

const Homepage = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [gamesList, setGamesList] = useState<ProgramAccount<GameAccount>[]>([]);
  const [filteredList, setFilteredList] = useState<ProgramAccount<GameAccount>[]>([]);

  useEffect(() => {
    let connection = new web3.Connection(SOLANA_RPC_HOST);

    const historyLoader = async () => {
      if (wallet && publicKey) {
        let program = await loadRpsProgram(connection, wallet);
        let rpsList =
          (await program.account.game.all()) as unknown as ProgramAccount<GameAccount>[];

        const playerOneAshToken = await getATA(publicKey, ASH_MINT);

        // await start(
        //   program,
        //   ADMIN,
        //   publicKey,
        //   WSOL,
        //   playerOneAshToken,
        //   0.01,
        //   'secret',
        //   Shape.Rock,
        //   3600000
        // );
        console.log(rpsList);
        setGamesList(rpsList);
        setFilteredList(rpsList);
      }
    };

    historyLoader();
  }, [wallet, publicKey]);

  const handleChangeFilter = (index) => {
    if (index === 1) {
      setFilteredList(
        gamesList.filter((game) => game.account.mint.toBase58() === ASH_MINT.toBase58())
      );
    } else if (index === 2) {
      setFilteredList(gamesList.filter((game) => game.account.mint.toBase58() === WSOL.toBase58()));
    } else {
      setFilteredList(gamesList);
    }
  };

  return (
    <div className="m-auto max-w-lg">
      <div className="flex justify-center mb-10">
        <Button variant="primary" className="px-6 mr-4" onClick={() => console.log('yes')}>
          CREATE A GAME
        </Button>
        <Connect />
        <Disconnect />
      </div>
      <>
        <h2 className="text-primus-orange font-serif text-3xl text-center mb-6">
          GAME IN PROGRESS
        </h2>
        <Tab.Group defaultIndex={0} onChange={handleChangeFilter}>
          <Tab.List className="w-104 h-12 bg-primus-light-grey rounded-10px p-1 m-auto mb-3">
            <Tab
              className={({ selected }) =>
                `bg-white py-2 w-36 rounded-10px mr-1 ${
                  !selected ? 'bg-opacity-25' : 'bg-opacity-75'
                }`
              }
            >
              All games
            </Tab>
            <Tab
              className={({ selected }) =>
                `bg-white py-2 w-36 rounded-10px mr-1 ${
                  !selected ? 'bg-opacity-25' : 'bg-opacity-75'
                }`
              }
            >
              $ASH Only
            </Tab>
            <Tab
              className={({ selected }) =>
                `bg-white py-2 w-36 rounded-10px ${!selected ? 'bg-opacity-25' : 'bg-opacity-75'}`
              }
            >
              $SOL Only
            </Tab>
          </Tab.List>
        </Tab.Group>
        <GamesList games={filteredList} />
      </>
    </div>
  );
};

export default Homepage;
