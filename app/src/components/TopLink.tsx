import { AppContext } from 'App';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactComponent as DiscordSVG } from 'assets/discord.svg';
import { ReactComponent as TwitterSVG } from 'assets/twitter.svg';
import Disconnect from '../features/Connect/Disconnect';
import Connect from 'features/Connect/Connect';
import { ThemeContext } from './ThemeWrapper';
import Menu from './Menu';
import 'components/Footer/Footer.css';
import LogoText from './LogoText';

const TopLink = () => {
  const darkMode = useContext(ThemeContext);
  const location = useLocation();
  const [isHomepage, setIsHomepage] = useState(true);
  const globalsText = useContext(AppContext).text.globals;
  const [isOpen, setActive] = useState<boolean>(false);

  const handleToggle = () => {
    setActive(!isOpen);
  };

  useEffect(() => {
    location.pathname === '/' ? setIsHomepage(true) : setIsHomepage(false);
  }, [location, isOpen]);

  return (
    <div
      className={
        (darkMode ? 'text-secondary' : 'text-primary') +
        (isHomepage ? ' justify-end' : '') +
        ' relative md:flex font-sansLight'
      }
    >
      <div className={(isHomepage ? 'md:hidden' : 'lg:flex') + '  flex-1 justify-left pt-4'}>
        <LogoText />
        <button
          className={
            (darkMode
              ? 'border-secondary hover:bg-secondary hover:text-primary'
              : 'border-primary hover:bg-primary hover:text-secondary') +
            ' absolute top-4 right-0 md:hidden border rounded-2xl font-sans px-4 py-1 pt-2 inline-block  transition-colors duration-200 ease-in-out'
          }
          onClick={handleToggle}
        >
          Menu
        </button>
        <Menu visible={isOpen} />
      </div>
      <div
        className={
          (isOpen ? 'block' : 'hidden') +
          ' md:flex flex-0 place-content-end rounded-b-xl bg-secondary-h md:bg-transparent md:rounded-none pt-4 md:pt-3 flex-col-reverse md:flex-row'
        }
      >
        <Connect />
        <Disconnect />
      </div>
    </div>
  );
};

export default TopLink;

/* <div className={(isHomepage ? 'hidden' : '') + ' lg:flex flex-1 justify-left pt-4'}> */
