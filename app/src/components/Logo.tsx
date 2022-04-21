import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/conf';

const Logo = () => {
  const [imageLogo, setImageLogo] = useState('');
  const [imageLoP, setImageLoP] = useState('');
  const [imageBattleground, setImageBattleground] = useState('');

  useEffect(() => {
    import(`assets/LoP_Transparent.png`).then((image) => {
      setImageLogo(image.default);
    });
    import(`assets/LoP.png`).then((image) => {
      setImageLoP(image.default);
    });

    import(`assets/Battlegrounds.png`).then((image) => {
      setImageBattleground(image.default);
    });
  });

  return (
    <div className="mb-5">
      <Link to={Routes.Homepage}>
        <img
          className="text-center m-auto"
          style={{ minWidth: '195px' }}
          src={imageLogo}
          alt="Logo LoP"
        />
        <img
          className="text-center m-auto"
          style={{ minWidth: '180px' }}
          src={imageLoP}
          alt="Logo LoP"
        />
        <img
          className="text-center m-auto"
          style={{ minWidth: '180px' }}
          src={imageBattleground}
          alt="Logo Battleground"
        />
      </Link>
      <div className="text-black font-serif m-auto my-6 text-center text-2xl max-w-3xl">
        <p>
          Legions of Primus battleground is an on-chain player vs player rock-paper-scissors game.
          Well, actually it’s a robot vs robot rocket-plasma-sniper game but let’s keep it simple!
        </p>
        <br />
        <p>
          Bids in the game can be made in $ASH (Mortuary Inc utility token) or in $SOL. Winner takes
          almost all! Here’s the deal: 5% of all $ASH winning bets return back to the $ASH pool
          whereas 3.5 % of all SOL winning bets are redistributed among Legions of Primus holders
          while 1.5 % goes to the Mortuary Inc treasury.
        </p>
      </div>
    </div>
  );
};

export default Logo;
