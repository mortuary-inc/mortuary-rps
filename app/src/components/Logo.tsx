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
      <div className="text-black font-serif m-auto mt-2 text-center text-2xl max-w-xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus commodo ex eget elementum
        consequat. In hac habitasse platea dictumst.
      </div>
    </div>
  );
};

export default Logo;
