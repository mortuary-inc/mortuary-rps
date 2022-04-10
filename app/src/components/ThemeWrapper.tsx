import { createContext, ReactChild, ReactChildren } from 'react';
import Footer from './Footer/Footer';
import Navigation from './Navigation';

interface ThemeWrapperProps {
  children: ReactChild | ReactChildren;
  darkMode: boolean;
  nav: boolean;
  footer: boolean;
  forceH?: boolean;
  className?: string;
}

export const ThemeContext = createContext(false);

const ThemeWrapper = ({
  children,
  darkMode,
  nav,
  footer,
  forceH,
  className,
}: ThemeWrapperProps) => {
  return (
    <ThemeContext.Provider value={darkMode}>
      <div className={'bg-white ' + (forceH ? ' min-h-screen ' : '') + 'px-4 py-4'}>
        <div className="m-auto">
          {nav ? <Navigation darkMode={darkMode} /> : <></>}
          {children}
          {footer ? <Footer /> : <></>}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeWrapper;
