export const SANITY_ENCRYPTION_SECRET = process.env.REACT_APP_SANITY_ENCRYPTION_SECRET as string;
export const SANITY_PROJECT_ID = 'lwu2ex4d';
export const SANITY_STUDIO_API_DATASET =
  process.env.REACT_APP_SANITY_STUDIO_API_DATASET || 'production';
export const IMGIX_TOKEN = process.env.REACT_APP_IMGIX_TOKEN || 'P4R5UeDaahjeEFnk';

export const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_HOST =
  process.env.REACT_APP_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';

export const PUBLIC_HOST =
  process.env.REACT_APP_PUBLIC_HOST || 'https://distracted-volhard-d27f8f.netlify.app';
