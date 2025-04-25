import { ethers } from 'ethers';

const ENSResolverABI = [
  'function addr(bytes32 node) view returns (address)',
  'function name(bytes32 node) view returns (string)',
  'function text(bytes32 node, string key) view returns (string)',
  'function contenthash(bytes32 node) view returns (bytes)',
  'function pubkey(bytes32 node) view returns (bytes32 x, bytes32 y)',
  'function supportsInterface(bytes4 interfaceID) view returns (bool)'
];

export class ENSResolver {
  constructor(provider, address) {
    this.provider = provider;
    this.address = address;
    this.contract = new ethers.Contract(address, ENSResolverABI, provider);
  }

  async getAddr(node) {
    try {
      return await this.contract.addr(node);
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }

  async getText(node, key) {
    try {
      return await this.contract.text(node, key);
    } catch (error) {
      console.error(`Error getting text record for ${key}:`, error);
      return null;
    }
  }

  async getContenthash(node) {
    try {
      return await this.contract.contenthash(node);
    } catch (error) {
      console.error('Error getting contenthash:', error);
      return null;
    }
  }

  async getPubkey(node) {
    try {
      const [x, y] = await this.contract.pubkey(node);
      return { x, y };
    } catch (error) {
      console.error('Error getting pubkey:', error);
      return null;
    }
  }

  async supportsInterface(interfaceID) {
    try {
      return await this.contract.supportsInterface(interfaceID);
    } catch (error) {
      console.error('Error checking interface support:', error);
      return false;
    }
  }
}
