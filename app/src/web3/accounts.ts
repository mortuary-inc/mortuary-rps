import * as web3 from '@solana/web3.js';

export const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_HOST =
  process.env.REACT_APP_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';

export let WSOL = new web3.PublicKey('So11111111111111111111111111111111111111112');
export let ASH_MINT = new web3.PublicKey('3pS315UKoD5s9AQkaWJNaPSDPnCX6YZmV3thRCSgFo2u');

// TODO update address when deployed on mainnet
export const BANK_CONFIG = new web3.PublicKey(
  SOLANA_NETWORK == 'devnet'
    ? 'GrAguBDmLLmSzV3xSYgsSFr1ggs8PzopP1MCgJvmNzXN'
    : 'GrAguBDmLLmSzV3xSYgsSFr1ggs8PzopP1MCgJvmNzXN'
);
export const BANK = new web3.PublicKey(
  SOLANA_NETWORK == 'devnet'
    ? 'F7sVZeMGb7jbkHrEQzmjM7Mp1hXcvrtGTVE85dhoLDrz'
    : 'F7sVZeMGb7jbkHrEQzmjM7Mp1hXcvrtGTVE85dhoLDrz'
);
export const ADMIN = new web3.PublicKey('HAjs9EJxN3BZsratYKMnibgKXr84QFWBDtwdnR7qyB7J');
