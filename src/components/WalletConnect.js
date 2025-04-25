import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../utils/config';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const WalletSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: #1a1a1a;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  border: 1px solid #333;
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
  }
`;

const Title = styled.h3`
  font-size: 16px;
  margin-bottom: 12px;
  color: #00EA90;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
  font-weight: 700;
  width: 100%;
  text-align: center;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 8px;
`;

const Address = styled.div`
  font-family: "Roboto Mono", monospace;
  font-size: 12px;
  background-color: #212121;
  padding: 6px 12px;
  border-radius: 8px;
  margin-top: 6px;
  word-break: break-all;
  text-align: center;
  color: #ffffff;
`;

const NetworkBadge = styled.div`
  background-color: ${props => props.isCorrectNetwork ? '#00EA90' : '#ef4444'};
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  margin-top: 12px;
  
  &:before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: ${props => props.isCorrectNetwork ? '#ffffff' : '#fca5a5'};
    border-radius: 50%;
    margin-right: 6px;
  }
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #00EA90 0%, #00c070 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 234, 144, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #465673 0%, #2c3e66 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DisconnectButton = styled(ConnectButton)`
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 12px;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(75, 85, 99, 0.3);
  }
`;

const SwitchNetworkButton = styled(ConnectButton)`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 12px;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
  }
`;

const NetworkWarning = styled.div`
  background-color: #332b16;
  border-left: 4px solid #f59e0b;
  padding: 8px 12px;
  margin-top: 12px;
  border-radius: 8px;
  color: #fdba74;
  font-size: 12px;
  width: 100%;
  text-align: center;
`;

const WalletConnect = () => {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Initialize web3modal
  useEffect(() => {
    const providerOptions = {
      // Add provider options here if needed
    };

    const newWeb3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
      theme: {
        background: "#1a1a1a",
        main: "#00EA90",
        secondary: "#00c070",
        border: "#333",
        hover: "#212121"
      }
    });

    setWeb3Modal(newWeb3Modal);

    // Auto connect if cached provider exists
    if (newWeb3Modal.cachedProvider) {
      connectWallet(newWeb3Modal);
    }
  }, []);

  // Update balance and network when provider or address changes
  useEffect(() => {
    if (provider && address) {
      updateBalanceAndNetwork();
    }
  }, [provider, address]);

  const connectWallet = async (modal) => {
    try {
      setIsConnecting(true);
      
      // Get the provider instance
      const instance = await modal.connect();
      
      // Create ethers provider
      const ethersProvider = new ethers.providers.Web3Provider(instance);
      setProvider(ethersProvider);
      
      // Get accounts
      const accounts = await ethersProvider.listAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        
        // Dispatch wallet connected event for other components
        window.dispatchEvent(new CustomEvent('wallet_connected', { 
          detail: { address: accounts[0] }
        }));
        
        // Store connection in localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
      }
      
      // Setup event listeners
      instance.on("accountsChanged", handleAccountsChanged);
      instance.on("chainChanged", handleChainChanged);
      instance.on("disconnect", handleDisconnect);
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    
    setProvider(null);
    setAddress(null);
    setBalance(null);
    setNetwork(null);
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    
    // Dispatch wallet disconnected event
    window.dispatchEvent(new Event('wallet_disconnected'));
  };

  const updateBalanceAndNetwork = async () => {
    try {
      // Get balance
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
      
      // Get network
      const network = await provider.getNetwork();
      setNetwork(network);
    } catch (error) {
      console.error("Error updating balance and network:", error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      localStorage.setItem('walletAddress', accounts[0]);
      
      // Dispatch wallet connected event
      window.dispatchEvent(new CustomEvent('wallet_connected', { 
        detail: { address: accounts[0] }
      }));
      
      updateBalanceAndNetwork();
    } else {
      disconnectWallet();
    }
  };

  const handleChainChanged = () => {
    // Reload the page on chain change as recommended by MetaMask
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleConnectClick = () => {
    if (web3Modal) {
      connectWallet(web3Modal);
    }
  };

  const switchToTaraxaNetwork = async () => {
    if (!provider) return;
    
    try {
      setIsSwitchingNetwork(true);
      
      // Check if provider has request method (MetaMask and most wallets)
      if (provider.provider && provider.provider.request) {
        try {
          // Try to switch to the Taraxa network
          await provider.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await provider.provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                  chainName: NETWORK_CONFIG.networkName,
                  nativeCurrency: {
                    name: 'TARA',
                    symbol: 'TARA',
                    decimals: 18,
                  },
                  rpcUrls: [NETWORK_CONFIG.rpcUrl],
                  blockExplorerUrls: ['https://explorer.taraxa.io'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      } else {
        // Fallback for wallets that don't support chain switching
        alert(`Please manually switch to the ${NETWORK_CONFIG.networkName} in your wallet.`);
      }
    } catch (error) {
      console.error("Error switching network:", error);
      alert(`Failed to switch to ${NETWORK_CONFIG.networkName}. Please try manually switching in your wallet.`);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const getNetworkName = () => {
    if (!network) return 'Unknown Network';
    
    if (network.chainId === NETWORK_CONFIG.chainId) {
      return NETWORK_CONFIG.networkName;
    }
    
    // Known networks
    const networks = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      42: 'Kovan Testnet',
      56: 'Binance Smart Chain',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      841: 'Taraxa Mainnet'
    };
    
    return networks[network.chainId] || `Chain ID: ${network.chainId}`;
  };

  const isCorrectNetwork = network && network.chainId === NETWORK_CONFIG.chainId;

  return (
    <Container>
      <WalletSection>
        {!address ? (
          <>
            <Title>Connect Wallet</Title>
            <ConnectButton 
              onClick={handleConnectClick}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </ConnectButton>
          </>
        ) : (
          <>
            <WalletInfo>
              <Address>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</Address>
              
              {balance && (
                <div style={{ marginTop: '6px', fontSize: '12px' }}>
                  {parseFloat(balance).toFixed(4)} {network?.chainId === NETWORK_CONFIG.chainId ? 'TARA' : 'ETH'}
                </div>
              )}
              
              <NetworkBadge isCorrectNetwork={isCorrectNetwork}>
                {getNetworkName()}
              </NetworkBadge>
            </WalletInfo>
            
            {!isCorrectNetwork && (
              <>
                <NetworkWarning>
                  Switch to {NETWORK_CONFIG.networkName}
                </NetworkWarning>
                
                <SwitchNetworkButton 
                  onClick={switchToTaraxaNetwork}
                  disabled={isSwitchingNetwork}
                >
                  {isSwitchingNetwork ? 'Switching...' : `Switch Network`}
                </SwitchNetworkButton>
              </>
            )}
            
            <DisconnectButton 
              onClick={disconnectWallet}
            >
              Disconnect
            </DisconnectButton>
          </>
        )}
      </WalletSection>
    </Container>
  );
};

export default WalletConnect;
