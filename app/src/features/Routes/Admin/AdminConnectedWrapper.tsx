import { useWallet } from '@solana/wallet-adapter-react';
import { ThemeContext } from 'components/ThemeWrapper';
import { useContext } from 'react';



const AdminConnectedWrapper: React.FC = ({ children }) => {
  const { connected, connecting } = useWallet();
  const darkMode = useContext(ThemeContext);
  return (
    <div className={(darkMode ? 'text-secondary' : 'text-primary') + ' font-sansLight text-xs sm:text-sm pt-14 sm:pt-28 pb-3'}>
      {connecting ?
        (<div>
          Connecting...
        </div>)
        : !connected ?
          (<div>
            You are not connected.
          </div>)
          : (
            <div>{children}</div>
          )}
    </div>
  );
};

export default AdminConnectedWrapper;
