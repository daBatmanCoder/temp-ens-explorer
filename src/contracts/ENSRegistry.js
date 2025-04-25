import { ethers } from 'ethers';

// ENS Registry ABI - minimal version with essential functions
const ENS_REGISTRY_ABI = [
  // Get the resolver for a name
  'function resolver(bytes32 node) view returns (address)',
  // Get the owner of a name
  'function owner(bytes32 node) view returns (address)',
  // Get the TTL of a name
  'function ttl(bytes32 node) view returns (uint64)',
  // Check if a record exists
  'function recordExists(bytes32 node) view returns (bool)',
  // Events
  'event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)',
  'event Transfer(bytes32 indexed node, address owner)',
  'event NewResolver(bytes32 indexed node, address resolver)',
  'event NewTTL(bytes32 indexed node, uint64 ttl)'
];

export class ENSRegistry {
  constructor(provider, address) {
    this.provider = provider;
    this.contract = new ethers.Contract(address, ENS_REGISTRY_ABI, provider);
  }

  // Get the resolver for a name
  async getResolver(node) {
    return this.contract.resolver(node);
  }

  // Get the owner of a name
  async getOwner(node) {
    return this.contract.owner(node);
  }

  // Check if a record exists
  async recordExists(node) {
    return this.contract.recordExists(node);
  }

  // Get the TTL of a name
  async getTTL(node) {
    return this.contract.ttl(node);
  }
}
