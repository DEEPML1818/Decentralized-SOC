import { ethers } from 'ethers';

// Scroll Sepolia Testnet configuration
export const SCROLL_TESTNET_CONFIG = {
  chainId: '0x8274F', // 534351 in hex
  chainName: 'Scroll Sepolia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia-rpc.scroll.io/'],
  blockExplorerUrls: ['https://sepolia.scrollscan.dev/'],
};

// Contract addresses
export const CONTRACT_ADDRESSES = {
  CLT_REWARD: '0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403',
  CLT_STAKING_POOL: '0xB480FA23e8d586Af034aae3CA9a0D111E071a01e',
  SOC_SERVICE: '0x284B4cE9027b8f81211efd19A3a5D40D8b232D60',
};

// ABIs based on the uploaded files
export const CLT_REWARD_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const CLT_STAKING_POOL_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_clt",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getStakedAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const SOC_SERVICE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "analyst",
        "type": "address"
      }
    ],
    "name": "assignAnalyst",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "severity",
        "type": "uint256"
      }
    ],
    "name": "createTicket",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "resolution",
        "type": "string"
      }
    ],
    "name": "resolveTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      }
    ],
    "name": "getTicket",
    "outputs": [
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "analyst",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "severity",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "status",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

class EVMContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: {
    cltReward?: ethers.Contract;
    stakingPool?: ethers.Contract;
    socService?: ethers.Contract;
  } = {};

  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Scroll testnet
      await this.switchToScrollTestnet();

      // Initialize provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Initialize contracts
      this.initializeContracts();

      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  private async switchToScrollTestnet() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SCROLL_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SCROLL_TESTNET_CONFIG],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  private initializeContracts() {
    if (!this.signer) return;

    this.contracts.cltReward = new ethers.Contract(
      CONTRACT_ADDRESSES.CLT_REWARD,
      CLT_REWARD_ABI,
      this.signer
    );

    this.contracts.stakingPool = new ethers.Contract(
      CONTRACT_ADDRESSES.CLT_STAKING_POOL,
      CLT_STAKING_POOL_ABI,
      this.signer
    );

    this.contracts.socService = new ethers.Contract(
      CONTRACT_ADDRESSES.SOC_SERVICE,
      SOC_SERVICE_ABI,
      this.signer
    );
  }

  // CLT Reward functions
  async claimRewards(): Promise<ethers.ContractTransaction> {
    if (!this.contracts.cltReward) throw new Error('Contract not initialized');
    return await this.contracts.cltReward.claim();
  }

  async getCLTBalance(address: string): Promise<ethers.BigNumber> {
    if (!this.contracts.cltReward) throw new Error('Contract not initialized');
    return await this.contracts.cltReward.balanceOf(address);
  }

  // Staking functions
  async stake(amount: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    if (!this.contracts.stakingPool) throw new Error('Contract not initialized');
    return await this.contracts.stakingPool.stake(amount);
  }

  async unstake(amount: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    if (!this.contracts.stakingPool) throw new Error('Contract not initialized');
    return await this.contracts.stakingPool.unstake(amount);
  }

  async getStakedAmount(address: string): Promise<ethers.BigNumber> {
    if (!this.contracts.stakingPool) throw new Error('Contract not initialized');
    return await this.contracts.stakingPool.getStakedAmount(address);
  }

  async getRewards(address: string): Promise<ethers.BigNumber> {
    if (!this.contracts.stakingPool) throw new Error('Contract not initialized');
    return await this.contracts.stakingPool.getRewards(address);
  }

  // SOC Service functions
  async createTicket(description: string, severity: number): Promise<ethers.ContractTransaction> {
    if (!this.contracts.socService) throw new Error('Contract not initialized');
    return await this.contracts.socService.createTicket(description, severity);
  }

  async assignAnalyst(ticketId: number, analyst: string): Promise<ethers.ContractTransaction> {
    if (!this.contracts.socService) throw new Error('Contract not initialized');
    return await this.contracts.socService.assignAnalyst(ticketId, analyst);
  }

  async resolveTicket(ticketId: number, resolution: string): Promise<ethers.ContractTransaction> {
    if (!this.contracts.socService) throw new Error('Contract not initialized');
    return await this.contracts.socService.resolveTicket(ticketId, resolution);
  }

  async getTicket(ticketId: number) {
    if (!this.contracts.socService) throw new Error('Contract not initialized');
    return await this.contracts.socService.getTicket(ticketId);
  }

  // Utility functions
  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) return null;
    const accounts = await this.provider.listAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  async getNetwork() {
    if (!this.provider) return null;
    return await this.provider.getNetwork();
  }

  formatCLT(amount: ethers.BigNumber): string {
    return ethers.utils.formatEther(amount);
  }

  parseCLT(amount: string): ethers.BigNumber {
    return ethers.utils.parseEther(amount);
  }
}

export const evmContractService = new EVMContractService();