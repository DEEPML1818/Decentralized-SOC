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

// Contract addresses from your deployment
export const CONTRACT_ADDRESSES = {
  CLT_REWARD: '0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097', // Updated CLT Token contract
  SOC_SERVICE: '0x7874f6b9f9547D0bb89493E9430d8ceC44CE8B41', // New SOCService with integrated staking pools
};

// CLT Reward Token ABI (Simple ERC20 with mint)
export const CLT_REWARD_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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

// SOCService ABI - Updated to match your new contract
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
        "name": "_initialOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_devFeePercentage",
        "type": "uint256"
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
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "stakingPool",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
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
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "analyst",
        "type": "address"
      }
    ],
    "name": "TicketValidated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_analyst",
        "type": "address"
      }
    ],
    "name": "createTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "devFeePercentage",
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
    "name": "initialOwner",
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
    "name": "ticketCounter",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
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
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "stakingPool",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isValidated",
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
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "updateDevFee",
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
    "name": "validateTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// CLT Staking Pool ABI for individual pools created by SOCService
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
        "name": "_owner",
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

class EVMContractService {
  private provider: BrowserProvider | null = null;
  private signer: any = null;
  private cltRewardContract: Contract | null = null;
  private socServiceContract: Contract | null = null;

  async getProvider(): Promise<BrowserProvider> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    
    if (!this.provider) {
      this.provider = new BrowserProvider(window.ethereum);
    }
    return this.provider;
  }

  async getSigner() {
    if (!this.signer) {
      const provider = await this.getProvider();
      this.signer = await provider.getSigner();
    }
    return this.signer;
  }

  async getCLTRewardContract(): Promise<Contract> {
    if (!this.cltRewardContract) {
      const signer = await this.getSigner();
      this.cltRewardContract = new Contract(
        CONTRACT_ADDRESSES.CLT_REWARD,
        CLT_REWARD_ABI,
        signer
      );
    }
    return this.cltRewardContract;
  }

  async getSOCServiceContract(): Promise<Contract> {
    if (!this.socServiceContract) {
      const signer = await this.getSigner();
      this.socServiceContract = new Contract(
        CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        signer
      );
    }
    return this.socServiceContract;
  }

  async getStakingPoolContract(poolAddress: string): Promise<Contract> {
    const signer = await this.getSigner();
    return new Contract(poolAddress, CLT_STAKING_POOL_ABI, signer);
  }

  // CLT Token functions
  async getCLTBalance(address: string): Promise<string> {
    try {
      const provider = await this.getProvider();
      const contract = new Contract(CONTRACT_ADDRESSES.CLT_REWARD, CLT_REWARD_ABI, provider);
      const balance = await contract.balanceOf(address);
      return formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting CLT balance:', error);
      return "0";
    }
  }

  async getETHBalance(address: string): Promise<string> {
    try {
      const provider = await this.getProvider();
      const balance = await provider.getBalance(address);
      return formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      return "0";
    }
  }

  async mintCLTReward(to: string, amount: string): Promise<string> {
    try {
      const contract = await this.getCLTRewardContract();
      const amountWei = parseUnits(amount, 18);
      const tx = await contract.mint(to, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error minting CLT reward:', error);
      throw error;
    }
  }

  // SOCService functions
  async createTicket(title: string, analystAddress: string, rewardETH: string): Promise<{txHash: string, stakingPoolAddress?: string}> {
    try {
      const contract = await this.getSOCServiceContract();
      const rewardWei = parseUnits(rewardETH, 18);
      
      const tx = await contract.createTicket(title, analystAddress, {
        value: rewardWei
      });
      
      const receipt = await tx.wait();
      
      // Parse events to get staking pool address
      let stakingPoolAddress;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog?.name === 'TicketCreated') {
            stakingPoolAddress = parsedLog.args.stakingPool;
            break;
          }
        } catch (e) {
          // Ignore parsing errors for logs from other contracts
        }
      }
      
      return {
        txHash: tx.hash,
        stakingPoolAddress
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async validateTicket(ticketId: number): Promise<string> {
    try {
      const contract = await this.getSOCServiceContract();
      const tx = await contract.validateTicket(ticketId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error validating ticket:', error);
      throw error;
    }
  }

  async getTicket(ticketId: number) {
    try {
      const contract = await this.getSOCServiceContract();
      const ticket = await contract.tickets(ticketId);
      return {
        id: Number(ticket.id),
        title: ticket.title,
        client: ticket.client,
        analyst: ticket.analyst,
        rewardAmount: formatUnits(ticket.rewardAmount, 18),
        stakingPool: ticket.stakingPool,
        isValidated: ticket.isValidated
      };
    } catch (error) {
      console.error('Error getting ticket:', error);
      throw error;
    }
  }

  async getTicketCounter(): Promise<number> {
    try {
      const contract = await this.getSOCServiceContract();
      const counter = await contract.ticketCounter();
      return Number(counter);
    } catch (error) {
      console.error('Error getting ticket counter:', error);
      return 0;
    }
  }

  // Staking Pool functions
  async getStakeInfo(userAddress: string) {
    try {
      // For the main staking in this context, return mock data
      // In a real implementation, this would query a specific staking pool
      return {
        amount: "0",
        rewardDebt: "0"
      };
    } catch (error) {
      console.error('Error getting stake info:', error);
      return { amount: "0", rewardDebt: "0" };
    }
  }

  async getStakeInfoForPool(stakingPoolAddress: string, userAddress: string) {
    try {
      const contract = await this.getStakingPoolContract(stakingPoolAddress);
      const stakeInfo = await contract.stakes(userAddress);
      return {
        amount: formatUnits(stakeInfo.amount, 18),
        rewardDebt: formatUnits(stakeInfo.rewardDebt, 18)
      };
    } catch (error) {
      console.error('Error getting stake info:', error);
      return { amount: "0", rewardDebt: "0" };
    }
  }

  async stakeInPool(stakingPoolAddress: string, amount: string): Promise<string> {
    try {
      const cltContract = await this.getCLTRewardContract();
      const stakingContract = await this.getStakingPoolContract(stakingPoolAddress);
      
      const amountWei = parseUnits(amount, 18);
      
      // First approve the staking pool to spend CLT tokens
      const approveTx = await cltContract.approve(stakingPoolAddress, amountWei);
      await approveTx.wait();
      
      // Then stake the tokens
      const stakeTx = await stakingContract.stake(amountWei);
      await stakeTx.wait();
      
      return stakeTx.hash;
    } catch (error) {
      console.error('Error staking in pool:', error);
      throw error;
    }
  }

  async withdrawFromPool(stakingPoolAddress: string, amount: string): Promise<string> {
    try {
      const contract = await this.getStakingPoolContract(stakingPoolAddress);
      const amountWei = parseUnits(amount, 18);
      
      const tx = await contract.withdraw(amountWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error withdrawing from pool:', error);
      throw error;
    }
  }

  async claimFromPool(stakingPoolAddress: string): Promise<string> {
    try {
      const contract = await this.getStakingPoolContract(stakingPoolAddress);
      const tx = await contract.claim();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error claiming from pool:', error);
      throw error;
    }
  }

  // Utility functions
  formatCLT(amount: string): string {
    return formatUnits(amount, 18);
  }

  parseCLT(amount: string): string {
    return parseUnits(amount, 18).toString();
  }

  async switchToScrollSepolia(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SCROLL_TESTNET_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SCROLL_TESTNET_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Scroll Sepolia network:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Scroll Sepolia network:', switchError);
      return false;
    }
  }
}

export const evmContractService = new EVMContractService();
export default evmContractService;