import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';
import { SOLANA_NETWORK, SOLANA_RPC_HOST } from 'config';
import { FC, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Notification } from '../Notification/Notification';
import './wallet.css';

export const Wallet: FC = (props) => {
  const network = SOLANA_NETWORK as WalletAdapterNetwork;

  const wallets = useMemo(
    () => [getPhantomWallet(), getSlopeWallet(), getSolflareWallet(), getLedgerWallet(), getSolletWallet({ network }), getSolletExtensionWallet({ network })],
    [network]
  );

  const onError = useCallback((error: WalletError) => {
    toast.custom(<Notification message={error.message ? `${error.name}: ${error.message}` : error.name} variant="error" />);
  }, []);

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_HOST}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{props.children}</WalletModalProvider>
        <Toaster position="bottom-left" reverseOrder={false} />
      </WalletProvider>
    </ConnectionProvider>
  );
};
