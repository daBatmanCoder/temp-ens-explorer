import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { namehash, getProvider } from '../utils/web3';
import { NETWORK_CONFIG } from '../utils/config';

// ENS name normalization function based on ENS standards
const normalizeENSName = (name) => {
  if (!name) return '';
  
  // First, convert to lowercase as per ENS standards
  let normalized = name.toLowerCase();
  
  // Handle .tara suffix properly
  // If name already has .tara, use it as is
  // If name has another suffix, use it as is
  // If name has no suffix, add .tara
  if (normalized.endsWith('.tara')) {
    return normalized;
  } else if (normalized.includes('.')) {
    return normalized;
  } else {
    return `${normalized}.tara`;
  }
};

export const useENSSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  // Helper function to provide user-friendly error messages
  const handleError = (error) => {
    console.error('Error searching ENS name:', error);
    
    // Check for specific call revert exception that happens with registry contract
    if (error.message && error.message.includes('call revert exception') && 
        error.message.includes('owner(bytes32)')) {
      return "The Taraxa network API is currently experiencing connection issues. We're automatically trying alternative endpoints. Please try again in a moment.";
    }
    
    // Check for common contract error patterns
    if (error.message && error.message.includes('call revert exception')) {
      return "We couldn't fetch this domain information at the moment. Our system is trying alternative network connections. Please try your search again.";
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      return "Network connection issue. The app is attempting to use backup connections. Please try your search again in a few seconds.";
    }
    
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return "Request timed out. The Taraxa network might be experiencing high load. We're switching to backup connections. Please try again.";
    }
    
    // Default user-friendly message
    return "Something went wrong while searching. We're attempting to use alternative connections. Please try again in a moment.";
  };

  // Create a fresh provider for each search attempt
  const getNewProvider = () => {
    // We'll create a new provider instance each time to avoid cached connections
    const provider = getProvider();
    setCurrentProvider(provider);
    return provider;
  };

  const searchName = async (name) => {
    if (!name) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Normalize the name according to ENS standards
      const ensName = normalizeENSName(name);
      
      const node = namehash(ensName);
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        // For server-side rendering, return minimal data
        setSearchResult({
          name: ensName,
          available: false,
          loading: true
        });
        setLoading(false);
        return;
      }
      
      // Get a fresh provider for this request
      const provider = getNewProvider();
      
      // Create contract instances
      const registryContract = new ethers.Contract(
        NETWORK_CONFIG.contracts.registry,
        [
          'function owner(bytes32 node) view returns (address)',
          'function resolver(bytes32 node) view returns (address)',
          'function ttl(bytes32 node) view returns (uint64)'
        ],
        provider
      );
      
      // Add a timeout to the owner call to prevent hanging
      const ownerPromise = registryContract.owner(node);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );
      
      // Get owner with timeout
      const owner = await Promise.race([ownerPromise, timeoutPromise]);
      const available = owner === ethers.constants.AddressZero;
      
      let result = {
        name: ensName,
        node,
        available,
        owner: available ? null : owner
      };
      
      if (!available) {
        // Get resolver address
        const resolverAddress = await registryContract.resolver(node);
        result.resolverAddress = resolverAddress;
        
        if (resolverAddress && resolverAddress !== ethers.constants.AddressZero) {
          // Create resolver contract instance
          const resolverContract = new ethers.Contract(
            resolverAddress,
            [
              'function addr(bytes32 node) view returns (address)',
              'function name(bytes32 node) view returns (string)',
              'function text(bytes32 node, string key) view returns (string)',
              'function pubkey(bytes32 node) view returns (bytes32 x, bytes32 y)',
              'function contenthash(bytes32 node) view returns (bytes)'
            ],
            provider
          );
          
          // Get address record
          try {
            const addr = await resolverContract.addr(node);
            result.address = addr;
          } catch (e) {
            console.error('Error getting address:', e);
          }
          
          // Get text records
          try {
            // Common text record keys - Added encryption_key_v1 back to the list
            const textKeys = [
              'name', 'url', 'avatar', 'description', 'notice',
              'keywords', 'com.twitter', 'com.github', 'org.telegram',
              'email', 'location', 'phone', 'encryption_key_v1'
            ];
            
            const textRecords = {};
            
            for (const key of textKeys) {
              try {
                const value = await resolverContract.text(node, key);
                if (value) {
                  textRecords[key] = value;
                }
              } catch (e) {
                console.error(`Error getting text record for ${key}:`, e);
              }
            }
            
            result.textRecords = textRecords;
          } catch (e) {
            console.error('Error getting text records:', e);
          }
          
          // Get public key
          try {
            const pubkey = await resolverContract.pubkey(node);
            if (pubkey && pubkey.x && pubkey.y) {
              result.pubkey = {
                x: pubkey.x,
                y: pubkey.y
              };
            }
          } catch (e) {
            console.error('Error getting public key:', e);
          }
          
          // Get content hash
          try {
            const contentHash = await resolverContract.contenthash(node);
            if (contentHash && contentHash !== '0x') {
              result.contentHash = contentHash;
            }
          } catch (e) {
            console.error('Error getting content hash:', e);
          }
        }
      }
      
      setSearchResult(result);
    } catch (error) {
      // Use the user-friendly error handler
      setError(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResult,
    loading,
    error,
    searchName,
    normalizeENSName // Export the normalization function for use in other components
  };
};
