import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from './ThemeWrapper';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/conf';
import { ReactComponent as LogoTextSVG } from 'assets/LogoMortuaryText.svg';

const LogoText = () => {
  const [isHomepage, setIsHomepage] = useState(true);
  const darkMode = useContext(ThemeContext);
  const location = useLocation();

  useEffect(() => {
    location.pathname === '/' ? setIsHomepage(true) : setIsHomepage(false);
  }, [location]);

  return (
    <div className={(isHomepage ? 'hidden md:block' : '') + ' text-left mr-4 lg:mr-8'}>
      <Link to={Routes.Homepage} className={'basis-full'}>
        <LogoTextSVG className=" cursor-pointer" />
      </Link>
      <div
        className={
          (darkMode ? 'text-third' : 'text-primary') + ' font-sansLight text-xs mt-3 basis-full'
        }
      >
        CURATING DEATH SINCE 2021
      </div>
    </div>
  );
};

export default LogoText;
