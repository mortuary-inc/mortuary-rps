import { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import TopLink from './TopLink';

interface ThemeWrapperProps {
  darkMode: boolean;
}

export const ThemeContext = createContext(false);

const Navigation = ({ darkMode }: ThemeWrapperProps) => {
  const location = useLocation();
  const [isHomepage, setIsHomepage] = useState(false);

  useEffect(() => {
    location.pathname === '/' ? setIsHomepage(true) : setIsHomepage(false);
  }, [location]);

  return (
    <ThemeContext.Provider value={darkMode}>
      {isHomepage ? (
        <Logo />
      ) : (
        <div className="md:block">
          <TopLink />
        </div>
      )}
    </ThemeContext.Provider>
  );
};

export default Navigation;
