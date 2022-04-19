import { web3 } from '@project-serum/anchor';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { SOLANA_RPC_HOST } from 'config';
import { useEffect, useState } from 'react';
import { loadLegions } from 'web3/nftHelper';
import AdminConnectedWrapper from './AdminConnectedWrapper';

const AdminList = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [legions, setLegions] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
        if (publicKey == null || wallet == null) return;

        let connection = new web3.Connection(SOLANA_RPC_HOST);
        let data = await loadLegions(connection, publicKey);
        let anim = data.map((l) => l.animation_url);
        setLegions(anim);
    })();
  }, [wallet, publicKey]);

  return (
    <AdminConnectedWrapper>
      {
        <table>
          <tr>
            <td>Anim url</td>
          </tr>
          {legions.map((animation, idx) => {
            return (
              <tr key={idx}>
                <td>{animation}</td>
              </tr>
            );
          })}
        </table>
      }
    </AdminConnectedWrapper>
  );
};

export default AdminList;
