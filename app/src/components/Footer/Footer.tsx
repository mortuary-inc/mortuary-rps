import { AppContext } from 'App';
import { ReactComponent as DiscordSVG } from 'assets/discord.svg';
import { ReactComponent as TwitterSVG } from 'assets/twitter.svg';
import { ThemeContext } from 'components/ThemeWrapper';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/conf';
import './Footer.css';

const Footer = () => {
  const darkMode = useContext(ThemeContext);
  const globalsText = useContext(AppContext).text.globals;

  return (
    <div className="font-sansLight text-xs sm:text-sm pt-14 sm:pt-28">
      <div className="flex justify-between">
        <div className="flex flex-col text-left self-end">
          <p className="text-primus-grey">Made with love in the Metaverse</p>
          <p className="text-primus-orange">All Rights Reserved 2022, Mortuary Inc.</p>
        </div>
        <div className={`footer-module text-primus-orange`}>
          <div className={' text-right'}>
            <a href={globalsText.linkDiscord}>
              <DiscordSVG className="inline m-2 cursor-pointer" />
            </a>
            <a href={globalsText.linkTwitter}>
              <TwitterSVG className="inline m-2 cursor-pointer" />
            </a>
          </div>
          <a href="https://mortuary-inc.io/terms-conditions" className="underline-footer">
            Terms and Conditions
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
