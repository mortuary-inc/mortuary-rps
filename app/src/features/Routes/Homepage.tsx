import { ProgramAccount, web3 } from '@project-serum/anchor';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import GamesList from '../../components/GamesList';
import { ADMIN, ASH_MINT, SOLANA_RPC_HOST, WSOL } from '../../web3/accounts';
import {
  GameAccount,
  Shape,
  getATA,
  loadHistory,
  loadRpsProgram,
  start,
} from '../../web3/rpsHelper';
import Connect from '../Connect/Connect';
import Disconnect from '../Connect/Disconnect';

const Homepage = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [gamesList, setGamesList] = useState<ProgramAccount<GameAccount>[]>([]);

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
        //   ASH_MINT,
        //   playerOneAshToken,
        //   1,
        //   'secret',
        //   Shape.Rock,
        //   10
        // );

        setGamesList(rpsList);
        console.log('rpsList', rpsList);
      }
    };

    historyLoader();
  }, [wallet, publicKey]);

  return (
    <div className="m-auto max-w-lg">
      <div className="text-center">
        <Button variant="primary" className="px-6 mr-4" onClick={() => console.log('yes')}>
          CREATE A GAME
        </Button>
        <Connect />
        <Disconnect />
      </div>
      <GamesList games={gamesList} />
    </div>
  );
};

export default Homepage;
