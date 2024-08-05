import { Connection, clusterApiUrl } from '@solana/web3.js';

const mainNet = new Connection(clusterApiUrl('mainnet-beta'));

const genesysRpc = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=cde2a7c7-9586-4613-bc68-881d3b03e7a1',
  'confirmed'
);

export { mainNet, genesysRpc };
