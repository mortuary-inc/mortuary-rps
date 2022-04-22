import { ProgramAccount, web3 } from '@project-serum/anchor';
import { SOLANA_RPC_HOST } from 'config';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Notification } from '../Notification/Notification';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ASH_MINT, WSOL } from 'web3/accounts';
import { GameAccount, GameHistory, loadHistory, loadRpsProgram } from 'web3/rpsHelper';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { Tab } from '@headlessui/react';
import GamesList from 'components/GamesList';
import { truncateAddress } from 'lib/utils';

const MyGames = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [gamesList, setGamesList] = useState<ProgramAccount<GameAccount>[]>([]);
  const [filteredList, setFilteredList] = useState<ProgramAccount<GameAccount>[]>([]);
  const [gamesHistory, setGamesHistory] = useState<GameHistory[]>([]);

  useEffect(() => {
    if (!wallet || !publicKey) return;
    let connection = new web3.Connection(SOLANA_RPC_HOST);

    const historyLoader = async () => {
      let program = await loadRpsProgram(connection, wallet);

      const fetchingToast = toast.custom(
        <Notification message={`Fetching ongoing games...`} variant="info" />,
        { duration: 61000 }
      );

      try {
        let rpsList =
          (await program.account.game.all()) as unknown as ProgramAccount<GameAccount>[];

        const myGamesOnly = rpsList.filter(
          (rps) =>
            !rps.account.stage['terminate'] &&
            ((publicKey && rps.account.playerOne.toBase58() === publicKey.toBase58()) ||
              (publicKey && rps.account.playerTwo.toBase58() === publicKey.toBase58()))
        );

        const myGamesHistory = await loadHistory(program, publicKey);

        setGamesHistory(myGamesHistory);
        setGamesList(myGamesOnly);
        setFilteredList(myGamesOnly);
        if (rpsList.length === 0) {
          toast.error('No games found');
        }
        toast.dismiss(fetchingToast);
        toast.custom(
          <Notification message={`${myGamesOnly.length} ongoing games found`} variant="success" />
        );
      } catch (error) {
        toast.dismiss(fetchingToast);
        toast.custom(<Notification message={`Failed to load games. ${error}`} variant="error" />);
      }
    };

    historyLoader();
  }, [wallet, publicKey]);

  const handleChangeFilter = (index) => {
    if (index === 1) {
      setFilteredList(gamesList.filter((game) => game.account.playerTwoRevealed));
    } else if (index === 2) {
      setFilteredList(gamesList.filter((game) => game.account.playerOneCommitted));
    } else {
      setFilteredList(gamesList);
    }
  };

  return (
    <div className="mt-20 text-center m-auto max-w-lg">
      <div className="font-serif text-4xl text-primus-title mb-8">MY GAMES</div>
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
            Ready
          </Tab>
          <Tab
            className={({ selected }) =>
              `bg-white py-2 w-36 rounded-10px ${!selected ? 'bg-opacity-25' : 'bg-opacity-75'}`
            }
          >
            Waiting
          </Tab>
        </Tab.List>
      </Tab.Group>
      {filteredList.length > 0 ? <GamesList games={filteredList} /> : <Skeleton count={5} />}
      <div>
        <div className="font-serif text-left text-lg text-primus-copy mt-8">My Games History</div>
        <div className="font-sans text-sm text-primus-copy mt-2">
          {gamesHistory && gamesHistory.length > 0 ? (
            gamesHistory.map((game) => {
              const { bid, mint, playerOne, playerTwo, timestamp, winner } = game;
              return (
                <div
                  key={Math.random().toString()}
                  className="font-sans text-left text-xs text-primus-copy"
                >
                  {playerOne.toBase58() === publicKey?.toBase58()
                    ? `[${new Date(timestamp * 60 * 1000).toLocaleString()}] ${truncateAddress(
                        playerTwo.toBase58()
                      )} played a game against you for ${
                        mint === 0 ? Number(bid) / 1000000000 : bid
                      } ${mint === 0 ? 'SOL' : 'ASH'} and ${winner === 1 ? 'won' : 'lost'}.`
                    : `[${new Date(
                        timestamp * 60 * 1000
                      ).toLocaleString()}] You played a game against ${truncateAddress(
                        playerOne.toBase58()
                      )} for ${mint === 0 ? Number(bid) / 100000000 : bid} ${
                        mint === 0 ? 'SOL' : 'ASH'
                      } and you ${winner === 2 ? 'won' : 'lost'}.`}
                </div>
              );
            })
          ) : (
            <div className="font-sans text-sm text-primus-copy">No games found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGames;
