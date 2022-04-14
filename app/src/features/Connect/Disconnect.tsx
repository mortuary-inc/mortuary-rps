import { useWallet } from '@solana/wallet-adapter-react';
import { MouseEventHandler, useCallback, useMemo } from 'react';
import { Button } from '../../components/Button';
const Disconnect = ({ className }: { className?: string }) => {
  const { publicKey, disconnect } = useWallet();
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleDisconnect: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      disconnect().catch(() => {});
    },
    [disconnect]
  );

  return !base58 ? (
    <></>
  ) : (
    <Button onClick={handleDisconnect} variant="secondary" className={`w-40 ${className}`}>
      DISCONNECT
    </Button>
  );
};

export default Disconnect;
