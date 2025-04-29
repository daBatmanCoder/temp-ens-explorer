export const NETWORK_CONFIG = {
  chainId: 841,
  rpcUrls: [
    'https://rpc.mainnet.taraxa.io',
    'https://taraxa.io/mainnet',
    'https://rpc.taraxa.network',
    'https://mainnet-rpc.taraxascan.io'
  ],
  rpcUrl: 'https://rpc.mainnet.taraxa.io', // Keep for backward compatibility
  networkName: 'Taraxa Mainnet',
  contracts: {
    registry: '0x5382f0455F6D0DbECf2c61036DbD95b650277B42',
    resolver: '0xEE1724a87C598044Bf25088C711Af3EAB7b883cD', // Updated PublicResolver
    ethRegistrarController: '0x686059DF1A7C316F80C713576f426503F697852b',
    nameWrapper: '0x033be3C04D9E85432616DDB7e795c2C37FeBEC61'
  }
};
