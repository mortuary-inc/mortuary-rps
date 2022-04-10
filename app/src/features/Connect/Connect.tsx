import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';

const css_button =
  ' shadow-primus burn-btn inline-block font-sans bg-third px-3 py-2 text-primary rounded-xl hover:bg-third-h active:bg-third-a transition-colors duration-500 ease-in-out';

export const WalletMultiButtonWrapper = () => {
  return (
    <div className="primus-wallet-btn-wrapper">
      <WalletMultiButton className={`primus-wallet-btn ${css_button}`}>CONNECT</WalletMultiButton>
    </div>
  );
};

const Connect = () => {
  const { publicKey } = useWallet();
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  return !base58 ? <WalletMultiButtonWrapper /> : <></>;
};

export default Connect;
