import React, { lazy, Suspense } from 'react';

import { Wallet } from 'features/Connect/Wallet';
import { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Routes } from 'routes/conf';
import TextDef from 'i18n/default.json';
import useAppText from 'hooks/useAppText';
import ThemeWrapper from 'components/ThemeWrapper';
import Fight from 'features/Routes/Fight';

const Homepage = lazy(() => import('./features/Routes/Homepage'));

const renderLoader = () => (
  <div className="inline-flex items-center px-4 py-2 font-sans leading-6 text-sm shadow rounded-md text-primary bg-third transition ease-in-out duration-150 cursor-not-allowed ml-4 mt-4">
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    Loading...
  </div>
);

const defaultAppContext = {
  text: TextDef,
};
export const AppContext = createContext(defaultAppContext);

function App() {
  const appText = useAppText();
  const [contextappText, setContextAppText] = useState(appText);

  const contextapp = {
    text: contextappText,
  };

  useEffect(() => {
    setContextAppText(appText);
  }, [appText]);

  return (
    <AppContext.Provider value={contextapp}>
      <Wallet>
        <BrowserRouter>
          <Switch>
            <Route path={Routes.Homepage} exact>
              <Suspense fallback={renderLoader()}>
                <ThemeWrapper darkMode={false} nav={true} footer={true} forceH={true}>
                  <Homepage />
                </ThemeWrapper>
              </Suspense>
            </Route>
            <Route path={Routes.Fight} exact>
              <Suspense fallback={renderLoader()}>
                <ThemeWrapper darkMode={false} nav={true} footer={true} forceH={true}>
                  <Fight />
                </ThemeWrapper>
              </Suspense>
            </Route>
          </Switch>
        </BrowserRouter>
      </Wallet>
    </AppContext.Provider>
  );
}
export default App;
