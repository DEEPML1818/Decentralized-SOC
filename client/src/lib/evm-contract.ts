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
  SOC_SERVICE: '0x8165d0626f76088B24DD00A0d8C27912EE22b29D', // New SOCService with CLT payment system
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

// SOCService ABI - Updated to match your new contract exactly
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
                                "name": "_owner",
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
                                "name": "token",
                                "type": "address"
                        }
                ],
                "name": "SafeERC20FailedOperation",
                "type": "error"
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
                                "indexed": true,
                                "internalType": "address",
                                "name": "analyst",
                                "type": "address"
                        }
                ],
                "name": "AnalystJoined",
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
                                "indexed": true,
                                "internalType": "address",
                                "name": "certifier",
                                "type": "address"
                        }
                ],
                "name": "CertifierJoined",
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
                                "internalType": "uint256",
                                "name": "cltAmount",
                                "type": "uint256"
                        }
                ],
                "name": "createTicket",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [
                        {
                                "internalType": "address",
                                "name": "token",
                                "type": "address"
                        },
                        {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                        }
                ],
                "name": "emergencyWithdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "anonymous": false,
                "inputs": [
                        {
                                "indexed": true,
                                "internalType": "address",
                                "name": "token",
                                "type": "address"
                        },
                        {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                        }
                ],
                "name": "EmergencyWithdraw",
                "type": "event"
        },
        {
                "inputs": [
                        {
                                "internalType": "uint256",
                                "name": "ticketId",
                                "type": "uint256"
                        }
                ],
                "name": "joinAsAnalyst",
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
                "name": "joinAsCertifier",
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
                                "name": "id",
                                "type": "uint256"
                        },
                        {
                                "indexed": true,
                                "internalType": "address",
                                "name": "client",
                                "type": "address"
                        },
                        {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "rewardAmount",
                                "type": "uint256"
                        },
                        {
                                "indexed": false,
                                "internalType": "address",
                                "name": "stakingPool",
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
                                "name": "id",
                                "type": "uint256"
                        },
                        {
                                "indexed": true,
                                "internalType": "address",
                                "name": "certifier",
                                "type": "address"
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
                        }
                ],
                "name": "validateTicket",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "DEV_FEE_PERCENT",
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
                                "internalType": "address",
                                "name": "certifier",
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
  async createTicket(title: string, cltAmount: string) {
    try {
      console.log(`Creating ticket with params:`, {
        title,
        cltAmount
      });

      // First, get the current user's address
      const signer = await this.getSigner();
      const userAddress = await signer.getAddress();

      // Approve the SOC contract to spend CLT tokens
      const cltContract = await this.getCLTRewardContract();
      const cltValue = parseUnits(cltAmount, 18);
      
      console.log('Approving CLT spend...');
      const approveTx = await cltContract.approve(CONTRACT_ADDRESSES.SOC_SERVICE, cltValue);
      await approveTx.wait();
      console.log('CLT spend approved');

      // Create the ticket
      const contract = await this.getSOCServiceContract();
      const tx = await contract.createTicket(title, cltValue);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Listen for TicketCreated event to get the staking pool address and ticket ID
      let stakingPoolAddress = null;
      let ticketId = null;
      
      if (receipt.logs) {
        const contractInterface = new ethers.Interface(SOC_SERVICE_ABI);
        for (const log of receipt.logs) {
          try {
            const parsedLog = contractInterface.parseLog(log);
            if (parsedLog?.name === 'TicketCreated') {
              stakingPoolAddress = parsedLog.args.stakingPool;
              ticketId = parsedLog.args.id.toString();
              console.log('Ticket created:', { ticketId, stakingPoolAddress });
              break;
            }
          } catch (e) {
            // Ignore logs that don't match our interface
          }
        }
      }

      return {
        txHash: receipt.transactionHash,
        stakingPoolAddress: stakingPoolAddress,
        ticketId: ticketId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      };
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async joinAsAnalyst(ticketId: string) {
    try {
      console.log(`Joining as analyst for ticket ${ticketId}`);

      const contract = await this.getSOCServiceContract();
      
      // Call the contract's joinAsAnalyst function
      const tx = await contract.joinAsAnalyst(ticketId);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Analyst joined:', receipt);

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      };
    } catch (error: any) {
      console.error('Error joining as analyst:', error);
      throw error;
    }
  }

  async joinAsCertifier(ticketId: string) {
    try {
      console.log(`Joining as certifier for ticket ${ticketId}`);

      const contract = await this.getSOCServiceContract();
      
      // Call the contract's joinAsCertifier function
      const tx = await contract.joinAsCertifier(ticketId);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Certifier joined:', receipt);

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      };
    } catch (error: any) {
      console.error('Error joining as certifier:', error);
      throw error;
    }
  }

  async validateTicket(ticketId: string) {
    try {
      console.log(`Validating ticket ${ticketId}`);

      const contract = await this.getSOCServiceContract();
      
      // Call the contract's validateTicket function
      const tx = await contract.validateTicket(ticketId);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Ticket validated:', receipt);

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      };
    } catch (error: any) {
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
        certifier: ticket.certifier,
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

  async connectWallet(): Promise<string | null> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to Scroll Sepolia network
      const switched = await this.switchToScrollSepolia();
      if (!switched) {
        throw new Error('Failed to switch to Scroll Sepolia network');
      }
      
      // Initialize provider and signer
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get the connected address
      const address = await this.signer.getAddress();
      console.log('EVM Wallet connected:', address);
      return address;
    } catch (error: any) {
      console.error('Failed to connect EVM wallet:', error);
      throw error;
    }
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
          if (!window.ethereum) return false;
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