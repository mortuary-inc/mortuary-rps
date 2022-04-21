import { ProgramAccount, web3 } from '@project-serum/anchor';
import { Button } from 'components/Button';
import Game from 'components/Game';
import { SOLANA_RPC_HOST } from 'config';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Notification } from '../Notification/Notification';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useParams } from 'react-router-dom';
import ShareLink from 'react-twitter-share-link';
import { ASH_MINT } from 'web3/accounts';
import { fake_wallet, GameAccount, loadRpsProgram } from 'web3/rpsHelper';

const Share = () => {
  const { id } = useParams() as { id: string };

  const [currentGame, setCurrentGame] = useState<ProgramAccount<GameAccount>>();
  const [challengedHandle, setChallengedHandle] = useState<string>('');

  useEffect(() => {
    let connection = new web3.Connection(SOLANA_RPC_HOST);

    const loadGame = async () => {
      const loadingToast = toast.custom(
        <Notification message={`Loading game...`} variant="info" />
      );
      try {
        let program = await loadRpsProgram(connection, fake_wallet);
        let rpsList =
          (await program.account.game.all()) as unknown as ProgramAccount<GameAccount>[];
        const selectedGame = rpsList.find((rps) => rps.publicKey.toBase58() === id);
        setCurrentGame(selectedGame);
        toast.dismiss(loadingToast);
        toast.custom(<Notification message={`Game loaded`} variant="success" />);
      } catch {
        toast.dismiss(loadingToast);
        toast.custom(<Notification message={`Failed to load game.`} variant="error" />);
      }
    };

    loadGame();
  }, [id]);

  return (
    <div className="mt-20 text-center m-auto max-w-lg">
      <div className="font-serif text-4xl text-primus-title">GAME CREATED</div>
      <div className="font-sans mt-5 text-sm text-primus-copy">Your RPS game has been created.</div>
      <div className="font-sans text-sm text-primus-copy">
        It is time to find a worthy opponent.
      </div>
      {currentGame ? (
        <Game className="mt-5" details={currentGame} simple={true} />
      ) : (
        <Skeleton count={2} />
      )}

      <div className="font-sans text-primus-label text-sm text-left mt-3 mb-1">
        Challenge someone
      </div>
      <div className="h-70px w-full bg-item-background rounded-3px p-5px m-auto mb-3 shadow-primus flex row-auto gap-5px">
        <input
          type="text"
          placeholder="INSERT TWITTER HANDLE..."
          className="bg-primus-light-orange px-4 rounded-3px w-full font-serif text-2xl"
          onChange={(e) => setChallengedHandle(e.target.value)}
        ></input>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          variant="cta"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/games/${id}`);
            toast.custom(<Notification message={`Link copied to clipboard`} variant="success" />);
          }}
          className="bg-primus-dark-grey"
        >
          COPY URL
        </Button>

        <ShareLink
          link={`${window.location.origin}/games/${id}`}
          text={`Hey${
            challengedHandle
              ? `${
                  challengedHandle.startsWith('@')
                    ? `, ${challengedHandle}!`
                    : `, @${challengedHandle}!`
                }`
              : '!'
          } I double dare you to be my opponent in a Rocket-Plasma-Sniper game for ${
            currentGame?.account.mint.toBase58() === ASH_MINT.toBase58()
              ? Number(currentGame?.account.amount)
              : Number(currentGame?.account.amount) / web3.LAMPORTS_PER_SOL
          } ${
            currentGame?.account.mint.toBase58() === ASH_MINT.toBase58() ? '$ASH' : '$SOL'
          }! I await you on the @legionsofprimus battlegrounds! 🤖`}
        >
          {(link) => (
            <Button variant="cta" onClick={() => (window.location.href = link)}>
              SHARE IT
            </Button>
          )}
        </ShareLink>
      </div>
    </div>
  );
};

export default Share;
