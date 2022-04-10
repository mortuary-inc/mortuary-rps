import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from 'components/ThemeWrapper';
import { NavLink, useLocation } from 'react-router-dom';
import { Routes } from 'routes/conf';

interface MenuProps {
  visible: boolean;
  forceHidden?: boolean;
}

const Menu = ({ visible, forceHidden }: MenuProps) => {
  const darkMode = useContext(ThemeContext);
  const location = useLocation();
  const [isHomepage, setIsHomepage] = useState(true);

  useEffect(() => {
    location.pathname === '/' ? setIsHomepage(true) : setIsHomepage(false);
  }, [location]);

  return (
    <>
      <nav
        className={
          (visible ? 'block' : 'hidden') +
          (darkMode ? ' text-primary md:text-secondary' : ' text-primary') +
          (isHomepage ? ' mt-16' : ' md:text-left') +
          (forceHidden ? ' hidden md:block' : '') +
          ' main-nav md:block bg-secondary-h md:bg-transparent md:space-x-2 font-sansLight text-base mt-4 md:mt-8 lg:mt-1 text-center lg:text-center rounded-t-xl md:rounded-none'
        }
      >
        {/* {[
          ['About', Routes.About],
          ['Roadmap', Routes.Roadmap],
          ['My Mortuary', Routes.MyMortuary],
          ['Partners', Routes.Partners],
        ].map(([title, url]) => (
          <NavLink key={title} activeClassName="selected" className={(darkMode ? '' : '') + ' w-full block md:inline px-1 lg:px-3 py-2 nav-link'} to={url}>
            {title}
          </NavLink>
        ))} */}
        <NavLink
          key="contact"
          activeClassName="selected"
          className={(darkMode ? '' : '') + ' w-full block md:inline px-1 lg:px-3 py-2 nav-link'}
          to={{ pathname: 'https://discord.gg/sMUu9REvU8' }}
          target="_blank"
        >
          Contact
        </NavLink>
      </nav>
    </>
  );
};

export default Menu;
