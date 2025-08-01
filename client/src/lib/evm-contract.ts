
import { ethers } from "ethers";

// Scroll Testnet configuration
export const SCROLL_TESTNET_CONFIG = {
  chainId: 534351,
  name: "Scroll Sepolia Testnet",
  currency: "ETH",
  explorerUrl: "https://sepolia.scrollscan.com",
  rpcUrl: "https://sepolia-rpc.scroll.io"
};

// Contract addresses
export const EVM_CONTRACT_ADDRESSES = {
  CLT_REWARD: "0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403",
  CLT_STAKING_POOL: "0xB480FA23e8d586Af034aae3CA9a0D111E071a01e",
  SOC_SERVICE: "0x284B4cE9027b8f81211efd19A3a5D40D8b232D60"
};

// Contract ABIs
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
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
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
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
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
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
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

export const CLT_STAKING_POOL_ABI = [
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
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
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
    "name": "withdraw",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
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
  }
];

export interface EVMTicket {
  id: number;
  reporter: string;
  analyst: string;
  validated: boolean;
  rewardClaimed: boolean;
}

export class EVMContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!this.provider) {
      throw new Error('MetaMask not detected');
    }

    try {
      // Request account access
      await this.provider.send("eth_requestAccounts", []);
      
      // Switch to Scroll testnet if needed
      await this.switchToScrollTestnet();
      
      this.signer = await this.provider.getSigner();
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async switchToScrollTestnet() {
    if (!this.provider) return;

    try {
      await this.provider.send("wallet_switchEthereumChain", [
        { chainId: "0x8274f" } // 534351 in hex
      ]);
    } catch (error: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (error.code === 4902) {
        try {
          await this.provider.send("wallet_addEthereumChain", [
            {
              chainId: "0x8274f",
              chainName: "Scroll Sepolia Testnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia-rpc.scroll.io"],
              blockExplorerUrls: ["https://sepolia.scrollscan.com"],
            },
          ]);
        } catch (addError) {
          console.error('Failed to add Scroll testnet:', addError);
        }
      }
    }
  }

  // CLT Reward Contract methods
  async getCLTBalance(address: string): Promise<number> {
    if (!this.provider) return 0;

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.CLT_REWARD,
        CLT_REWARD_ABI,
        this.provider
      );
      
      const balance = await contract.balanceOf(address);
      return parseInt(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to get CLT balance:', error);
      return 0;
    }
  }

  // Staking Pool methods
  async stakeCLT(amount: number): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.CLT_STAKING_POOL,
        CLT_STAKING_POOL_ABI,
        this.signer
      );

      const tx = await contract.stake(ethers.parseEther(amount.toString()));
      return tx.hash;
    } catch (error) {
      console.error('Failed to stake CLT:', error);
      return null;
    }
  }

  async withdrawStake(amount: number): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.CLT_STAKING_POOL,
        CLT_STAKING_POOL_ABI,
        this.signer
      );

      const tx = await contract.withdraw(ethers.parseEther(amount.toString()));
      return tx.hash;
    } catch (error) {
      console.error('Failed to withdraw stake:', error);
      return null;
    }
  }

  async claimRewards(): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.CLT_STAKING_POOL,
        CLT_STAKING_POOL_ABI,
        this.signer
      );

      const tx = await contract.claim();
      return tx.hash;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      return null;
    }
  }

  async getStakeInfo(address: string) {
    if (!this.provider) return null;

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.CLT_STAKING_POOL,
        CLT_STAKING_POOL_ABI,
        this.provider
      );

      const stakeInfo = await contract.stakes(address);
      return {
        amount: parseInt(ethers.formatEther(stakeInfo[0])),
        rewardDebt: parseInt(ethers.formatEther(stakeInfo[1]))
      };
    } catch (error) {
      console.error('Failed to get stake info:', error);
      return null;
    }
  }

  // SOC Service methods
  async createTicket(): Promise<{ ticketId: number; txHash: string } | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.signer
      );

      const tx = await contract.createTicket();
      const receipt = await tx.wait();
      
      // Parse the TicketCreated event to get the ticket ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'TicketCreated';
        } catch {
          return false;
        }
      });

      let ticketId = 0;
      if (event) {
        const parsed = contract.interface.parseLog(event);
        ticketId = parseInt(parsed?.args.ticketId.toString());
      }

      return { ticketId, txHash: tx.hash };
    } catch (error) {
      console.error('Failed to create ticket:', error);
      return null;
    }
  }

  async assignAnalyst(ticketId: number, analystAddress: string): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.signer
      );

      const tx = await contract.assignAnalyst(ticketId, analystAddress);
      return tx.hash;
    } catch (error) {
      console.error('Failed to assign analyst:', error);
      return null;
    }
  }

  async submitReport(ticketId: number, reportLink: string): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.signer
      );

      const tx = await contract.submitReport(ticketId, reportLink);
      return tx.hash;
    } catch (error) {
      console.error('Failed to submit report:', error);
      return null;
    }
  }

  async validateTicket(ticketId: number, certifierAddress: string, rewardAmount: number): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.signer
      );

      const tx = await contract.validateTicket(
        ticketId,
        certifierAddress,
        ethers.parseEther(rewardAmount.toString())
      );
      return tx.hash;
    } catch (error) {
      console.error('Failed to validate ticket:', error);
      return null;
    }
  }

  async getTicket(ticketId: number): Promise<EVMTicket | null> {
    if (!this.provider) return null;

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.provider
      );

      const ticket = await contract.tickets(ticketId);
      return {
        id: ticketId,
        reporter: ticket[0],
        analyst: ticket[1],
        validated: ticket[2],
        rewardClaimed: ticket[3]
      };
    } catch (error) {
      console.error('Failed to get ticket:', error);
      return null;
    }
  }

  async getNextTicketId(): Promise<number> {
    if (!this.provider) return 0;

    try {
      const contract = new ethers.Contract(
        EVM_CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.provider
      );

      const nextId = await contract.nextTicketId();
      return parseInt(nextId.toString());
    } catch (error) {
      console.error('Failed to get next ticket ID:', error);
      return 0;
    }
  }
}

// Singleton instance
export const evmContractService = new EVMContractService();
