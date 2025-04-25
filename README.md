# Taraxa ENS Explorer - Documentation

## Overview
Taraxa ENS Explorer is a web application that allows users to search for ENS domains on the Taraxa network, view domain information including ownership details and text records, and check domain availability.

## Features
- Search for ENS domains on the Taraxa network
- View domain ownership information
- Display text records and other domain data
- Check domain availability
- Responsive design for desktop and mobile devices

## Technical Stack
- React.js for the UI components
- Next.js for the application framework
- ethers.js for blockchain interaction
- Styled Components for styling
- Taraxa network integration (chainID: 841, RPC: https://rpc.mainnet.taraxa.io)

## Contract Addresses
- ENS Registry: 0x5382f0455F6D0DbECf2c61036DbD95b650277B42
- ENS Resolver: 0xEE1724a87C598044Bf25088C711Af3EAB7b883cD

## Project Structure
```
ens-taraxa-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── App.js          # Main application component
│   │   ├── ENSSearch.js    # Search input component
│   │   ├── ENSResultDisplay.js # Results display component
│   │   ├── DomainInfoTabs.js   # Tabbed interface for domain records
│   │   └── AvailabilityDisplay.js # UI for available domains
│   ├── contracts/          # Contract interfaces
│   │   ├── ENSRegistry.js  # ENS Registry contract interface
│   │   └── ENSResolver.js  # ENS Resolver contract interface
│   ├── hooks/              # Custom React hooks
│   │   └── useENSSearch.js # Hook for ENS name searching
│   ├── utils/              # Utility functions
│   │   ├── config.js       # Network configuration
│   │   └── web3.js         # Web3 utilities
│   ├── index.js            # Application entry point
│   └── styles.css          # Global styles
├── pages/                  # Next.js pages
│   ├── _app.js             # Next.js app component
│   └── index.js            # Main page
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository or extract the provided zip file
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```

### Development
To run the application in development mode:
```
npm run dev
```
This will start the development server at http://localhost:3000

### Building for Production
To build the application for production:
```
npm run build
```
This will create a static export in the `out` directory.

## Deployment

### Option 1: Static Hosting
The application is built as a static site, so you can deploy it to any static hosting service:

1. Build the application:
   ```
   npm run build
   ```
2. Upload the contents of the `out` directory to your hosting service.

### Option 2: Vercel or Netlify
The application can be easily deployed to Vercel or Netlify:

1. Connect your repository to Vercel or Netlify
2. Configure the build settings:
   - Build command: `npm run build`
   - Output directory: `out`
3. Deploy

## Customization

### Changing Network Configuration
To connect to a different network or update contract addresses, modify the `src/utils/config.js` file:

```javascript
export const NETWORK_CONFIG = {
  chainId: 841,  // Change to your network's chain ID
  rpcUrl: 'https://rpc.mainnet.taraxa.io',  // Change to your network's RPC URL
  networkName: 'Taraxa Mainnet',  // Change to your network's name
  contracts: {
    registry: '0x5382f0455F6D0DbECf2c61036DbD95b650277B42',  // Change to your registry contract address
    resolver: '0xEE1724a87C598044Bf25088C711Af3EAB7b883cD'   // Change to your resolver contract address
  }
};
```

### Styling
The application uses Styled Components for styling. You can customize the look and feel by modifying the styled components in the respective files.

## Future Enhancements
- Implement domain registration functionality
- Add support for additional record types
- Implement wallet connection for user authentication
- Add transaction history for domains

## Troubleshooting
- If you encounter CORS issues, make sure your RPC endpoint allows cross-origin requests
- If contract interactions fail, verify that the contract addresses are correct and the contracts are deployed on the specified network
- For build issues, ensure you have the correct Node.js version installed
