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
  CLT_REWARD: '0x7300c99742081cCDa629aDcD74E19F59A4E8aD83', // Updated CLT Token contract
  CLT_STAKING_POOL: '0xB480FA23e8d586Af034aae3CA9a0D111E071a01e',
  SOC_SERVICE: '0x284B4cE9027b8f81211efd19A3a5D40D8b232D60',
};

// CLT Reward Token ABI (ERC20 Token)
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

// EVM Contract Service
class EVMContractService {
  private provider: BrowserProvider | null = null;
  private signer: any = null;
  private cltRewardContract: Contract | null = null;
  private stakingPoolContract: Contract | null = null;
  private socServiceContract: Contract | null = null;

  async connectWallet(): Promise<string | null> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Initialize provider and signer
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Initialize contracts
      this.cltRewardContract = new Contract(
        CONTRACT_ADDRESSES.CLT_REWARD,
        CLT_REWARD_ABI,
        this.signer
      );

      this.cltTokenContract = new Contract(
        CONTRACT_ADDRESSES.CLT_REWARD,
        CLT_REWARD_ABI,
        this.signer
      );
      
      this.stakingPoolContract = new Contract(
        CONTRACT_ADDRESSES.CLT_STAKING_POOL,
        CLT_STAKING_POOL_ABI,
        this.signer
      );
      
      this.socServiceContract = new Contract(
        CONTRACT_ADDRESSES.SOC_SERVICE,
        SOC_SERVICE_ABI,
        this.signer
      );

      const address = await this.signer.getAddress();
      console.log('EVM Wallet connected:', address);
      return address;
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error);
      throw error;
    }
  }

  async switchToScrollTestnet(): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

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
      }
      throw switchError;
    }
  }

  async getCurrentNetwork(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const network = await this.provider.getNetwork();
    return network.chainId.toString();
  }

  async isConnectedToScrollTestnet(): Promise<boolean> {
    try {
      const currentChainId = await this.getCurrentNetwork();
      return currentChainId === '534351'; // Scroll Sepolia chainId in decimal
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  // Get ETH balance (wallet-based function using ethers.js)
  async getETHBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        console.log('Provider not initialized, connecting wallet...');
        await this.connectWallet();
      }
      
      if (!this.provider) {
        throw new Error('Failed to initialize provider');
      }

      console.log('Fetching ETH balance for address:', address);
      const balance = await this.provider.getBalance(address);
      const formattedBalance = formatUnits(balance, 18);
      console.log('ETH balance fetched:', formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error; // Re-throw to let calling code handle it
    }
  }

  // Get contract addresses
  getSocServiceAddress(): string {
    return CONTRACT_ADDRESSES.SOC_SERVICE;
  }

  getCLTAddress(): string {
    return CONTRACT_ADDRESSES.CLT_REWARD;
  }

  getStakingPoolAddress(): string {
    return CONTRACT_ADDRESSES.CLT_STAKING_POOL;
  }

  // CLT Token functions
  async getCLTBalance(address: string): Promise<bigint> {
    if (!this.cltRewardContract) {
      throw new Error('Contract not initialized');
    }
    return await this.cltRewardContract.balanceOf(address);
  }

  async approveCLT(spender: string, amount: string): Promise<any> {
    if (!this.cltRewardContract) {
      throw new Error('Contract not initialized');
    }
    const amountWei = parseUnits(amount, 18);
    return await this.cltRewardContract.approve(spender, amountWei);
  }

  // Staking functions
  async getStakeInfo(address: string): Promise<{ amount: bigint; rewardDebt: bigint }> {
    if (!this.stakingPoolContract) {
      throw new Error('Contract not initialized');
    }
    const result = await this.stakingPoolContract.stakes(address);
    return {
      amount: result.amount,
      rewardDebt: result.rewardDebt
    };
  }

  async stake(amount: string): Promise<any> {
    if (!this.stakingPoolContract) {
      throw new Error('Contract not initialized');
    }
    const amountWei = parseUnits(amount, 18);
    
    // First approve the staking pool to spend CLT tokens
    await this.approveCLT(CONTRACT_ADDRESSES.CLT_STAKING_POOL, amount);
    
    // Then stake
    return await this.stakingPoolContract.stake(amountWei);
  }

  async withdraw(amount: string): Promise<any> {
    if (!this.stakingPoolContract) {
      throw new Error('Contract not initialized');
    }
    const amountWei = parseUnits(amount, 18);
    return await this.stakingPoolContract.withdraw(amountWei);
  }



  async getRewardRate(): Promise<bigint> {
    if (!this.stakingPoolContract) {
      throw new Error('Contract not initialized');
    }
    return await this.stakingPoolContract.rewardRate();
  }

  // SOC Service functions
  async createTicket(): Promise<any> {
    if (!this.socServiceContract) {
      throw new Error('Contract not initialized');
    }
    return await this.socServiceContract.createTicket();
  }

  async getTicket(ticketId: number): Promise<{
    reporter: string;
    analyst: string;
    validated: boolean;
    rewardClaimed: boolean;
  }> {
    if (!this.socServiceContract) {
      throw new Error('Contract not initialized');
    }
    const result = await this.socServiceContract.tickets(ticketId);
    return {
      reporter: result.reporter,
      analyst: result.analyst,
      validated: result.validated,
      rewardClaimed: result.rewardClaimed
    };
  }

  async assignAnalyst(ticketId: number, analyst: string): Promise<any> {
    if (!this.socServiceContract) {
      throw new Error('Contract not initialized');
    }
    return await this.socServiceContract.assignAnalyst(ticketId, analyst);
  }

  async submitReport(ticketId: number, reportLink: string): Promise<any> {
    if (!this.socServiceContract) {
      throw new Error('Contract not initialized');
    }
    return await this.socServiceContract.submitReport(ticketId, reportLink);
  }

  async validateTicket(ticketId: number, certifier: string, rewardAmount: string): Promise<any> {
    if (!this.socServiceContract) {
      throw new Error('Contract not initialized');
    }
    const rewardWei = parseUnits(rewardAmount, 18);
    return await this.socServiceContract.validateTicket(ticketId, certifier, rewardWei);
  }

  async getNextTicketId(): Promise<bigint> {
    if (!this.socServiceContract) {
      throw new Error('Contract not initialized');
    }
    return await this.socServiceContract.nextTicketId();
  }

  // Utility functions
  formatCLT(amount: bigint): string {
    return formatUnits(amount, 18);
  }

  parseCLT(amount: string): bigint {
    return parseUnits(amount, 18);
  }

  formatETH(amount: bigint): string {
    return formatUnits(amount, 18);
  }

  parseETH(amount: string): bigint {
    return parseUnits(amount, 18);
  }

  // Staking operations
  async stakeTokens(amount: string): Promise<any> {
    if (!this.stakingPoolContract) {
      throw new Error('Staking contract not initialized');
    }
    const amountWei = parseUnits(amount, 18);
    
    // First approve the staking contract to spend tokens
    if (this.cltTokenContract) {
      const approveTx = await this.cltTokenContract.approve(CONTRACT_ADDRESSES.CLT_STAKING_POOL, amountWei);
      await approveTx.wait();
    }
    
    // Then stake the tokens
    const stakeTx = await this.stakingPoolContract.stake(amountWei);
    return await stakeTx.wait();
  }

  async withdrawTokens(amount: string): Promise<any> {
    if (!this.stakingPoolContract) {
      throw new Error('Staking contract not initialized');
    }
    const amountWei = parseUnits(amount, 18);
    const withdrawTx = await this.stakingPoolContract.withdraw(amountWei);
    return await withdrawTx.wait();
  }

  async claimRewards(): Promise<any> {
    if (!this.stakingPoolContract) {
      throw new Error('Staking contract not initialized');
    }
    const claimTx = await this.stakingPoolContract.claim();
    return await claimTx.wait();
  }

  // CLT Token Reward Distribution Functions
  async mintReward(recipientAddress: string, amount: string, rewardType: 'analyst' | 'certifier' | 'staker'): Promise<any> {
    if (!this.cltTokenContract) {
      throw new Error('CLT Token contract not initialized');
    }
    
    console.log(`🎯 Minting ${amount} CLT reward tokens for ${rewardType}: ${recipientAddress}`);
    
    const amountWei = parseUnits(amount, 18);
    const mintTx = await this.cltTokenContract.mint(recipientAddress, amountWei);
    const receipt = await mintTx.wait();
    
    console.log(`✅ CLT reward minted successfully:`, {
      recipient: recipientAddress,
      amount: amount,
      type: rewardType,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });
    
    return receipt;
  }

  async mintAnalystReward(analystAddress: string, ticketId: number): Promise<any> {
    // Standard analyst reward: 50 CLT tokens
    const rewardAmount = "50";
    console.log(`💼 Minting analyst reward for ticket #${ticketId}`);
    return await this.mintReward(analystAddress, rewardAmount, 'analyst');
  }

  async mintCertifierReward(certifierAddress: string, ticketId: number): Promise<any> {
    // Standard certifier reward: 30 CLT tokens
    const rewardAmount = "30";
    console.log(`🛡️ Minting certifier reward for ticket #${ticketId}`);
    return await this.mintReward(certifierAddress, rewardAmount, 'certifier');
  }

  async mintStakerReward(stakerAddress: string, stakeAmount: string): Promise<any> {
    // Staker reward: 5% of staked amount as CLT tokens
    const stakeAmountNum = parseFloat(stakeAmount);
    const rewardAmount = (stakeAmountNum * 0.05).toString();
    console.log(`💰 Minting staker reward: ${rewardAmount} CLT for ${stakeAmount} stake`);
    return await this.mintReward(stakerAddress, rewardAmount, 'staker');
  }

  async batchMintRewards(rewards: Array<{address: string, amount: string, type: 'analyst' | 'certifier' | 'staker'}>): Promise<any[]> {
    console.log(`🔄 Processing batch reward minting for ${rewards.length} recipients`);
    const results = [];
    
    for (const reward of rewards) {
      try {
        const result = await this.mintReward(reward.address, reward.amount, reward.type);
        results.push({ success: true, ...result });
      } catch (error) {
        console.error(`❌ Failed to mint reward for ${reward.address}:`, error);
        results.push({ success: false, error: error.message, address: reward.address });
      }
    }
    
    return results;
  }

  async getClaimableReward(userAddress: string): Promise<string> {
    if (!this.stakingPoolContract) {
      throw new Error('Staking contract not initialized');
    }
    
    try {
      const pendingReward = await this.stakingPoolContract.pendingReward(userAddress);
      return formatUnits(pendingReward, 18);
    } catch (error) {
      console.warn('Could not fetch pending reward:', error);
      return "0";
    }
  }



  // Event listeners
  onTicketCreated(callback: (ticketId: number, reporter: string) => void) {
    if (!this.socServiceContract) return;
    this.socServiceContract.on('TicketCreated', callback);
  }

  onAnalystAssigned(callback: (ticketId: number, analyst: string) => void) {
    if (!this.socServiceContract) return;
    this.socServiceContract.on('AnalystAssigned', callback);
  }

  onReportSubmitted(callback: (ticketId: number, reportLink: string) => void) {
    if (!this.socServiceContract) return;
    this.socServiceContract.on('ReportSubmitted', callback);
  }

  onTicketValidated(callback: (ticketId: number, certifier: string, reward: bigint) => void) {
    if (!this.socServiceContract) return;
    this.socServiceContract.on('TicketValidated', callback);
  }
}

// Export singleton instance
export const evmContractService = new EVMContractService();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}