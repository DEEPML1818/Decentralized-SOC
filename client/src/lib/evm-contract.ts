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
      await this.initializeProvider();
      if (!this.provider) {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
    }

    try {
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
        } else {
          throw switchError;
        }
      }

      this.signer = await this.provider.getSigner();
      
      // Initialize contracts
      this.cltRewardContract = new Contract(CONTRACT_ADDRESSES.CLT_REWARD, CLT_REWARD_ABI, this.signer);
      this.stakingPoolContract = new Contract(CONTRACT_ADDRESSES.CLT_STAKING_POOL, CLT_STAKING_POOL_ABI, this.signer);
      this.socServiceContract = new Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);

      const address = await this.signer.getAddress();
      console.log('Successfully connected to EVM wallet:', address);
      return address;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // CLT Token functions
  async getCLTBalance(address: string): Promise<bigint> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    return await this.cltRewardContract.balanceOf(address);
  }

  async getCLTTotalSupply(): Promise<bigint> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    return await this.cltRewardContract.totalSupply();
  }

  async getCLTName(): Promise<string> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    return await this.cltRewardContract.name();
  }

  async getCLTSymbol(): Promise<string> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    return await this.cltRewardContract.symbol();
  }

  async approveCLT(spender: string, amount: bigint): Promise<string> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    const tx = await this.cltRewardContract.approve(spender, amount);
    return tx.hash;
  }

  async transferCLT(to: string, amount: bigint): Promise<string> {
    if (!this.cltRewardContract) throw new Error('Contract not initialized');
    const tx = await this.cltRewardContract.transfer(to, amount);
    return tx.hash;
  }

  // Staking Pool functions
  async getStakeInfo(address: string): Promise<EVMStake> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    const result = await this.stakingPoolContract.stakes(address);
    return {
      amount: result.amount,
      rewardDebt: result.rewardDebt
    };
  }

  async getRewardRate(): Promise<bigint> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    return await this.stakingPoolContract.rewardRate();
  }

  async getLastUpdateBlock(): Promise<bigint> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    return await this.stakingPoolContract.lastUpdateBlock();
  }

  async stakeCLT(amount: bigint): Promise<string> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    // First approve the staking pool to spend CLT tokens
    await this.approveCLT(CONTRACT_ADDRESSES.CLT_STAKING_POOL, amount);
    
    const tx = await this.stakingPoolContract.stake(amount);
    return tx.hash;
  }

  async withdrawStake(amount: bigint): Promise<string> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    const tx = await this.stakingPoolContract.withdraw(amount);
    return tx.hash;
  }

  async claimRewards(): Promise<string> {
    if (!this.stakingPoolContract) throw new Error('Contract not initialized');
    const tx = await this.stakingPoolContract.claim();
    return tx.hash;
  }

  // SOC Service functions
  async createTicket(): Promise<{ ticketId: bigint; txHash: string }> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const tx = await this.socServiceContract.createTicket();
    const receipt = await tx.wait();
    
    // Find the TicketCreated event to get the ticket ID
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.socServiceContract!.interface.parseLog(log);
        return parsed?.name === 'TicketCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsedEvent = this.socServiceContract!.interface.parseLog(event);
      if (parsedEvent) {
        return {
          ticketId: parsedEvent.args.ticketId,
          txHash: tx.hash
        };
      }
    }
    
    throw new Error('Failed to create ticket');
  }

  async getTicket(ticketId: bigint): Promise<EVMTicket> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const result = await this.socServiceContract.tickets(ticketId);
    return {
      reporter: result.reporter,
      analyst: result.analyst,
      validated: result.validated,
      rewardClaimed: result.rewardClaimed
    };
  }

  async getNextTicketId(): Promise<bigint> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    return await this.socServiceContract.nextTicketId();
  }

  async assignAnalyst(ticketId: bigint, analyst: string): Promise<string> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const tx = await this.socServiceContract.assignAnalyst(ticketId, analyst);
    return tx.hash;
  }

  async submitReport(ticketId: bigint, reportLink: string): Promise<string> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const tx = await this.socServiceContract.submitReport(ticketId, reportLink);
    return tx.hash;
  }

  async validateTicket(ticketId: bigint, certifier: string, rewardAmount: bigint): Promise<string> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    const tx = await this.socServiceContract.validateTicket(ticketId, certifier, rewardAmount);
    return tx.hash;
  }

  async getRewardToken(): Promise<string> {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    return await this.socServiceContract.rewardToken();
  }

  // Utility functions
  formatCLT(amount: bigint): string {
    return formatUnits(amount, 18);
  }

  parseCLT(amount: string): bigint {
    return parseUnits(amount, 18);
  }

  async waitForTransaction(txHash: string) {
    if (!this.provider) throw new Error('Provider not initialized');
    return await this.provider.waitForTransaction(txHash);
  }

  // Event listeners
  onTicketCreated(callback: (ticketId: bigint, reporter: string) => void) {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    this.socServiceContract.on('TicketCreated', callback);
  }

  onAnalystAssigned(callback: (ticketId: bigint, analyst: string) => void) {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    this.socServiceContract.on('AnalystAssigned', callback);
  }

  onReportSubmitted(callback: (ticketId: bigint, reportLink: string) => void) {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    this.socServiceContract.on('ReportSubmitted', callback);
  }

  onTicketValidated(callback: (ticketId: bigint, certifier: string, reward: bigint) => void) {
    if (!this.socServiceContract) throw new Error('Contract not initialized');
    this.socServiceContract.on('TicketValidated', callback);
  }

  removeAllListeners() {
    if (this.socServiceContract) {
      this.socServiceContract.removeAllListeners();
    }
    if (this.stakingPoolContract) {
      this.stakingPoolContract.removeAllListeners();
    }
    if (this.cltRewardContract) {
      this.cltRewardContract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const evmContractService = new EVMContractService();