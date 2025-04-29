import { ethers } from 'ethers';
import { NETWORK_CONFIG } from './config';

// Enhanced provider with better error handling and retry mechanism
export const getProvider = () => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      // For browsers with web3 wallets
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    
    // Create a JsonRpcProvider with fallback mechanism
    const createProvider = () => {
      const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
      
      // Set a timeout for RPC requests
      provider.pollingInterval = 15000; // 15 seconds
      
      // Add custom retry logic for failed requests
      const originalSend = provider.send;
      provider.send = async (method, params) => {
        let retries = 3;
        let lastError;
        
        while (retries > 0) {
          try {
            return await originalSend.call(provider, method, params);
          } catch (error) {
            lastError = error;
            retries--;
            // Add exponential backoff wait between retries
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
            }
          }
        }
        
        // If all retries failed, throw a user-friendly error
        const error = new Error("Network request failed after multiple attempts");
        error.originalError = lastError;
        throw error;
      };
      
      return provider;
    };
    
    return createProvider();
  } catch (error) {
    console.error("Failed to initialize provider:", error);
    
    // Return a minimal fallback provider that logs errors but doesn't crash
    const fallbackProvider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    
    // Wrap all methods to prevent crashes
    const originalSend = fallbackProvider.send;
    fallbackProvider.send = async (method, params) => {
      try {
        return await originalSend.call(fallbackProvider, method, params);
      } catch (error) {
        console.error("Fallback provider request failed:", error);
        throw new Error("Network request failed. Please try again later.");
      }
    };
    
    return fallbackProvider;
  }
};

// Initialize signer (for transactions)
export const getSigner = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please install a wallet.');
  }
  return new ethers.providers.Web3Provider(window.ethereum).getSigner();
};

// Namehash function for ENS
export const namehash = (name) => {
  let node = ethers.utils.hexZeroPad([0], 32);
  if (name) {
    const labels = name.split('.');
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(labels[i]));
      node = ethers.utils.keccak256(ethers.utils.concat([node, labelHash]));
    }
  }
  return node;
};

// Validate ENS name format
export const isValidName = (name) => {
  return name.includes('.') && name.length > 3;
};

// Check if a name is available for registration
export const checkNameAvailability = async (name) => {
  try {
    const provider = getProvider();
    const controller = new ethers.Contract(
      NETWORK_CONFIG.contracts.ethRegistrarController,
      [
        'function available(string memory name) view returns (bool)'
      ],
      provider
    );
    
    // Extract the label (part before .eth)
    const label = name.split('.')[0];
    
    return await controller.available(label);
  } catch (error) {
    console.error('Error checking name availability:', error);
    throw error;
  }
};

// Make a commitment for registration
export const makeCommitment = async (name, owner, duration, secret, resolver, data = [], reverseRecord = false, fuses = 0) => {
  try {
    const provider = getProvider();
    const controller = new ethers.Contract(
      NETWORK_CONFIG.contracts.ethRegistrarController,
      [
        'function makeCommitment(string memory name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] calldata data, bool reverseRecord, uint16 ownerControlledFuses) pure returns (bytes32)'
      ],
      provider
    );
    
    return await controller.makeCommitment(
      name,
      owner,
      duration,
      secret,
      resolver,
      data,
      reverseRecord,
      fuses
    );
  } catch (error) {
    console.error('Error making commitment:', error);
    throw error;
  }
};

// Submit a commitment
export const submitCommitment = async (commitmentHash) => {
  try {
    const signer = getSigner();
    const controller = new ethers.Contract(
      NETWORK_CONFIG.contracts.ethRegistrarController,
      [
        'function commit(bytes32 commitment)'
      ],
      signer
    );
    
    const tx = await controller.commit(commitmentHash);
    const receipt = await tx.wait();
    return tx.hash; // Return the transaction hash
  } catch (error) {
    console.error('Error submitting commitment:', error);
    throw error;
  }
};

// Get registration price directly from contract
export const getRegistrationPrice = async (name, duration) => {
  try {
    const provider = getProvider();
    const controller = new ethers.Contract(
      NETWORK_CONFIG.contracts.ethRegistrarController,
      [
        'function rentPrice(string memory name, uint256 duration) view returns (uint256)'
      ],
      provider
    );
    
    // Get the actual price from the contract
    const price = await controller.rentPrice(name, duration);
    console.log('Raw price from contract:', price.toString());
    
    // Add 10% buffer for gas price fluctuations
    const buffer = price.div(10);
    const totalPrice = price.add(buffer);
    
    console.log('Total price with buffer:', totalPrice.toString());
    
    return {
      base: ethers.utils.formatEther(price),
      buffer: ethers.utils.formatEther(buffer),
      total: ethers.utils.formatEther(totalPrice),
      rawTotal: totalPrice // Return the raw BigNumber for direct use
    };
  } catch (error) {
    console.error('Error getting registration price:', error);
    throw error;
  }
};

// Get minimum registration price (fallback if contract call fails)
export const getMinimumRegistrationPrice = (duration) => {
  // Set a minimum price of 0.01 TARA per year as fallback
  const minYearlyPrice = ethers.utils.parseEther('0.01');
  const totalMinPrice = minYearlyPrice.mul(duration).div(31536000); // Convert duration from seconds to years
  
  return {
    base: ethers.utils.formatEther(totalMinPrice),
    buffer: '0',
    total: ethers.utils.formatEther(totalMinPrice),
    rawTotal: totalMinPrice
  };
};

// Debug function to log transaction parameters
export const debugTransaction = (name, owner, duration, secret, resolver, data, reverseRecord, fuses, value) => {
  console.log('=== DEBUG: REGISTRATION TRANSACTION PARAMETERS ===');
  console.log('Name:', name);
  console.log('Owner:', owner);
  console.log('Duration (seconds):', duration.toString());
  console.log('Secret:', secret);
  console.log('Resolver:', resolver);
  console.log('Data:', data);
  console.log('Reverse Record:', reverseRecord);
  console.log('Fuses:', fuses);
  console.log('Value (wei):', value.toString());
  console.log('Value (TARA):', ethers.utils.formatEther(value));
  console.log('================================================');
};

// Register a domain
export const registerDomain = async (name, owner, duration, secret, resolver, data = [], reverseRecord = false, fuses = 0) => {
  try {
    const signer = getSigner();
    const controller = new ethers.Contract(
      NETWORK_CONFIG.contracts.ethRegistrarController,
      [
        'function register(string memory name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] calldata data, bool reverseRecord, uint16 ownerControlledFuses) payable',
        'function rentPrice(string memory name, uint256 duration) view returns (uint256)'
      ],
      signer
    );
    
    // Get price directly from contract
    let priceData;
    try {
      priceData = await getRegistrationPrice(name, duration);
    } catch (error) {
      console.error('Error getting price from contract, using minimum price:', error);
      // Use minimum price as fallback
      priceData = getMinimumRegistrationPrice(duration);
    }
    
    // Ensure we have a valid price
    if (!priceData.rawTotal || priceData.rawTotal.eq(0)) {
      console.warn('Price is zero or invalid, using minimum price');
      priceData = getMinimumRegistrationPrice(duration);
    }
    
    // Add 20% buffer to ensure transaction doesn't fail due to price changes
    const totalPrice = priceData.rawTotal.mul(120).div(100);
    
    // Set a higher gas limit to avoid estimation errors
    const gasLimit = 500000;
    
    // Debug transaction parameters
    debugTransaction(name, owner, duration, secret, resolver, data, reverseRecord, fuses, totalPrice);
    
    // Send transaction with explicit parameters
    const tx = await controller.register(
      name,
      owner,
      duration,
      secret,
      resolver,
      data,
      reverseRecord,
      fuses,
      { 
        value: totalPrice,
        gasLimit: gasLimit
      }
    );
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    if (receipt.status === 0) {
      throw new Error(`Transaction failed. Hash: ${tx.hash}`);
    }
    
    return tx.hash;
  } catch (error) {
    console.error('Error registering domain:', error);
    
    // Provide detailed error messages based on error type
    if (error.message && error.message.includes('UNPREDICTABLE_GAS_LIMIT')) {
      throw new Error('Transaction failed due to gas estimation issues. Try setting a custom gas limit or check if the domain is already registered.');
    }
    
    if (error.message && error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds in your wallet to complete this transaction. Please add more TARA to your wallet.');
    }
    
    if (error.receipt && error.receipt.status === 0) {
      throw new Error(`Transaction reverted on the blockchain. This could be because the name is already registered or the commitment has expired. Transaction hash: ${error.transactionHash}`);
    }
    
    // Extract transaction hash if available
    const txHash = error.transactionHash || (error.transaction && error.transaction.hash) || null;
    if (txHash) {
      throw new Error(`Transaction failed. Hash: ${txHash}. Error: ${error.message}`);
    }
    
    throw error;
  }
};

// Generate a random secret for commitments
export const generateSecret = () => {
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
};

// Convert seconds to a human-readable duration
export const formatDuration = (seconds) => {
  const years = Math.floor(seconds / (365 * 24 * 60 * 60));
  const days = Math.floor((seconds % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
  
  let result = '';
  if (years > 0) {
    result += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (days > 0) {
    result += `${result ? ' ' : ''}${days} day${days > 1 ? 's' : ''}`;
  }
  
  return result || '0 days';
};

// Get transaction receipt and status
export const getTransactionStatus = async (txHash) => {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { status: 'pending', receipt: null };
    }
    
    return {
      status: receipt.status === 1 ? 'success' : 'failed',
      receipt: receipt
    };
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return { status: 'error', error: error.message };
  }
};

// Check if a transaction is confirmed
export const waitForTransaction = async (txHash, confirmations = 1) => {
  try {
    const provider = getProvider();
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

// Decode transaction error
export const decodeTransactionError = async (txHash) => {
  try {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { error: 'Transaction not found or still pending' };
    }
    
    if (receipt.status === 1) {
      return { success: true, receipt };
    }
    
    // Try to get more information about the failure
    return {
      success: false,
      receipt,
      error: 'Transaction reverted on-chain',
      details: {
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gasUsed: receipt.gasUsed.toString(),
        gasLimit: tx.gasLimit.toString()
      }
    };
  } catch (error) {
    console.error('Error decoding transaction error:', error);
    return { error: error.message };
  }
};
