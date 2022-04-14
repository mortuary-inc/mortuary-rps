import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/conf';

const LogoText = () => {
  const [imageLoP, setImageLoP] = useState('');
  const [imageBattleground, setImageBattleground] = useState('');

  useEffect(() => {
    import(`assets/LoP.png`).then((image) => {
      setImageLoP(image.default);
    });

    import(`assets/Battlegrounds.png`).then((image) => {
      setImageBattleground(image.default);
    });
  });

  return (
    <div className="text-center flex align-middle">
      <Link to={Routes.Homepage}>
        <img
          className="text-center m-auto"
          style={{ maxWidth: '279px', marginBottom: '2px' }}
          src={imageLoP}
          alt="Logo LoP"
        />
        <img
          className="text-center m-auto"
          style={{ maxWidth: '239px' }}
          src={imageBattleground}
          alt="Logo Battleground"
        />
      </Link>
    </div>
  );
};

export default LogoText;
