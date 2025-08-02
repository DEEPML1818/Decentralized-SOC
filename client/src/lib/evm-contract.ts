import { ethers, BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';

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

// Complete CLT Reward Token ABI
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
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
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
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
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
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
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
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
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
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// CLT Staking Pool ABI
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
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clt",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastUpdateBlock",
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
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardRate",
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
        "internalType": "uint256",
        "name": "_rate",
        "type": "uint256"
      }
    ],
    "name": "setRewardRate",
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
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardDebt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
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
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// SOC Service ABI
export const SOC_SERVICE_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_rewardToken",
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "analyst",
        "type": "address"
      }
    ],
    "name": "AnalystAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reportLink",
        "type": "string"
      }
    ],
    "name": "ReportSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reporter",
        "type": "address"
      }
    ],
    "name": "TicketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ticketId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "certifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "TicketValidated",
    "type": "event"
  },
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
    "inputs": [],
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
    "inputs": [],
    "name": "nextTicketId",
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
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [
      {
        "internalType": "contract CLTReward",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
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
        "name": "reportLink",
        "type": "string"
      }
    ],
    "name": "submitReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tickets",
    "outputs": [
      {
        "internalType": "address",
        "name": "reporter",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "analyst",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "validated",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "rewardClaimed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
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
        "internalType": "address",
        "name": "certifier",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      }
    ],
    "name": "validateTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// EVM blockchain types
export interface EVMStake {
  amount: bigint;
  rewardDebt: bigint;
}

export interface EVMTicket {
  reporter: string;
  analyst: string;
  validated: boolean;
  rewardClaimed: boolean;
}

// EVM Contract Service Class
export class EVMContractService {
  private provider: BrowserProvider | null = null;
  private signer: any = null;
  private cltRewardContract: Contract | null = null;
  private stakingPoolContract: Contract | null = null;
  private socServiceContract: Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new BrowserProvider((window as any).ethereum);
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('MetaMask not detected');
    }

    // Request account access
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    // Switch to Scroll Sepolia if not already connected
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SCROLL_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SCROLL_TESTNET_CONFIG],
        });
      }
    }

    this.signer = await this.provider.getSigner();
    
    // Initialize contracts
    this.cltRewardContract = new Contract(CONTRACT_ADDRESSES.CLT_REWARD, CLT_REWARD_ABI, this.signer);
    this.stakingPoolContract = new Contract(CONTRACT_ADDRESSES.CLT_STAKING_POOL, CLT_STAKING_POOL_ABI, this.signer);
    this.socServiceContract = new Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);

    return await this.signer.getAddress();
  }

  // CLT Token functions
  async getCLTBalance(address: string): Promise<string> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    const balance = await this.cltRewardContract.balanceOf(address);
    return formatUnits(balance, 18);
  }

  async getCLTTotalSupply(): Promise<string> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    const supply = await this.cltRewardContract.totalSupply();
    return formatUnits(supply, 18);
  }

  async approveCLT(spender: string, amount: string): Promise<any> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    const parsedAmount = parseUnits(amount, 18);
    return await this.cltRewardContract.approve(spender, parsedAmount);
  }

  // Staking functions
  async stake(amount: string): Promise<any> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    
    // First approve the staking contract to spend CLT tokens
    await this.approveCLT(CONTRACT_ADDRESSES.CLT_STAKING_POOL, amount);
    
    const parsedAmount = parseUnits(amount, 18);
    return await this.stakingPoolContract.stake(parsedAmount);
  }

  async withdraw(amount: string): Promise<any> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    const parsedAmount = parseUnits(amount, 18);
    return await this.stakingPoolContract.withdraw(parsedAmount);
  }

  async claimRewards(): Promise<any> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    return await this.stakingPoolContract.claim();
  }

  async getUserStake(address: string): Promise<EVMStake> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    const stake = await this.stakingPoolContract.stakes(address);
    return {
      amount: stake.amount,
      rewardDebt: stake.rewardDebt
    };
  }

  async getRewardRate(): Promise<string> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    const rate = await this.stakingPoolContract.rewardRate();
    return formatUnits(rate, 18);
  }

  // SOC Service functions
  async createTicket(): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    return await this.socServiceContract.createTicket();
  }

  async getTicket(ticketId: number): Promise<EVMTicket> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const ticket = await this.socServiceContract.tickets(ticketId);
    return {
      reporter: ticket.reporter,
      analyst: ticket.analyst,
      validated: ticket.validated,
      rewardClaimed: ticket.rewardClaimed
    };
  }

  async assignAnalyst(ticketId: number, analyst: string): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    return await this.socServiceContract.assignAnalyst(ticketId, analyst);
  }

  async submitReport(ticketId: number, reportLink: string): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    return await this.socServiceContract.submitReport(ticketId, reportLink);
  }

  async validateTicket(ticketId: number, certifier: string, rewardAmount: string): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const parsedAmount = parseUnits(rewardAmount, 18);
    return await this.socServiceContract.validateTicket(ticketId, certifier, parsedAmount);
  }

  async getNextTicketId(): Promise<number> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const nextId = await this.socServiceContract.nextTicketId();
    return Number(nextId);
  }

  // Pool ticket functions
  async openPool(poolData: {
    title: string;
    description: string;
    severity: string;
    rewardAmount: string;
    requiredAnalysts: number;
    timeline: string;
  }): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    
    const rewardAmount = parseUnits(poolData.rewardAmount, 18);
    
    // In a real implementation, this would call the smart contract
    // For now, we'll simulate the transaction
    return {
      wait: async () => {
        console.log('Pool opened:', poolData);
        return { transactionHash: '0x' + Math.random().toString(16).substr(2, 8) };
      }
    };
  }

  async joinPool(poolId: string): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    
    // In a real implementation, this would call the smart contract
    return {
      wait: async () => {
        console.log('Joined pool:', poolId);
        return { transactionHash: '0x' + Math.random().toString(16).substr(2, 8) };
      }
    };
  }

  async claimPoolReward(poolId: string): Promise<any> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    
    // In a real implementation, this would call the smart contract
    return {
      wait: async () => {
        console.log('Claimed pool reward:', poolId);
        return { transactionHash: '0x' + Math.random().toString(16).substr(2, 8) };
      }
    };
  }

  // Utility functions
  isConnected(): boolean {
    return this.signer !== null;
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  getSigner(): any {
    return this.signer;
  }

  // Event listeners
  async listenToTicketEvents(callback: (event: any) => void): Promise<void> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    
    this.socServiceContract.on('TicketCreated', callback);
    this.socServiceContract.on('AnalystAssigned', callback);
    this.socServiceContract.on('ReportSubmitted', callback);
    this.socServiceContract.on('TicketValidated', callback);
  }

  removeAllListeners(): void {
    if (this.socServiceContract) {
      this.socServiceContract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const evmContractService = new EVMContractService();