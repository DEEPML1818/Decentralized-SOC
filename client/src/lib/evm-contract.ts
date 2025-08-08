import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const SCROLL_SEPOLIA_CONFIG = {
  chainId: '0x8274F',
  chainName: 'Scroll Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia-rpc.scroll.io/'],
  blockExplorerUrls: ['https://sepolia.scrollscan.dev/'],
};

// Updated contract addresses - New deployments with mint function and proper staking
export const CONTRACT_ADDRESSES = {
  CLT_REWARD: '0xD5d71c78f44b2B3840c7a0374c52Be959FA73E5f', // New CLT Token contract
  SOC_SERVICE: '0x5835fcE133F0119439C5F4209ce5FD7A850FDa7A', // New SOCService contract
};

// CLT Reward Token ABI (CyberLink Token with mint function)
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

// SOCService ABI - Latest deployment with createTicket, assignAsAnalyst, assignAsCertifier, and validateTicket
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
    "name": "AnalystAssigned",
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
    "name": "assignAsAnalyst",
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
    "name": "assignAsCertifier",
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
        "name": "certifier",
        "type": "address"
      }
    ],
    "name": "CertifierAssigned",
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
        "name": "validator",
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

// EVM Contract Service Class
class EVMContractService {
  private provider: any = null;
  private signer: any = null;

  // Connect to MetaMask wallet
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }

    try {
      // Switch to Scroll Sepolia network
      await this.switchNetwork();
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Setup provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      console.log('EVM wallet connected:', accounts[0]);
      return accounts[0];
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // Switch to Scroll Sepolia network
  async switchNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SCROLL_SEPOLIA_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SCROLL_SEPOLIA_CONFIG],
          });
        } catch (addError: any) {
          throw new Error(`Failed to add Scroll Sepolia network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch to Scroll Sepolia: ${switchError.message}`);
      }
    }
  }

  // Get CLT token balance
  async getCLTBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.CLT_REWARD, CLT_REWARD_ABI, this.provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  // Get ETH balance
  async getETHBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Mint CLT tokens (for faucet functionality)
  async mintCLT(to: string, amount: string): Promise<any> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.CLT_REWARD, CLT_REWARD_ABI, this.signer);
      const amountWei = ethers.parseEther(amount);
      
      console.log('Minting CLT tokens:', { to, amount: amountWei.toString() });
      
      const tx = await contract.mint(to, amountWei);
      console.log('Mint transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Mint transaction confirmed:', receipt);
      
      return { txHash: tx.hash, receipt };
    } catch (error: any) {
      console.error('CLT minting failed:', error);
      throw new Error(`Failed to mint CLT tokens: ${error.message}`);
    }
  }

  // Create ticket with CLT payment
  async createTicket(title: string, cltAmount: string): Promise<any> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      const userAddress = await this.signer.getAddress();
      const amountWei = ethers.parseEther(cltAmount);
      
      console.log('Creating ticket:', { title, cltAmount: amountWei.toString(), userAddress });

      // Check CLT balance
      const balance = await this.getCLTBalance(userAddress);
      console.log('Current CLT balance:', balance);
      
      if (parseFloat(balance) < parseFloat(cltAmount)) {
        console.log('Insufficient CLT balance, attempting to mint tokens...');
        const mintAmount = Math.max(1000, parseFloat(cltAmount) * 2); // Mint at least 1000 or twice the needed amount
        await this.mintCLT(userAddress, mintAmount.toString());
        console.log(`Minted ${mintAmount} CLT tokens for user`);
      }

      // Get CLT contract instance
      const cltContract = new ethers.Contract(CONTRACT_ADDRESSES.CLT_REWARD, CLT_REWARD_ABI, this.signer);
      
      // Check current allowance
      const currentAllowance = await cltContract.allowance(userAddress, CONTRACT_ADDRESSES.SOC_SERVICE);
      console.log('Current allowance:', ethers.formatEther(currentAllowance));
      
      // If allowance is insufficient, approve the required amount
      if (currentAllowance < amountWei) {
        console.log('Insufficient allowance, approving CLT spending...');
        
        // Reset allowance to 0 first (some tokens require this)
        if (currentAllowance > 0) {
          console.log('Resetting allowance to 0...');
          const resetTx = await cltContract.approve(CONTRACT_ADDRESSES.SOC_SERVICE, 0);
          await resetTx.wait();
          console.log('Allowance reset to 0');
        }
        
        // Approve the required amount
        console.log('Approving CLT spending for amount:', ethers.formatEther(amountWei));
        const approveTx = await cltContract.approve(CONTRACT_ADDRESSES.SOC_SERVICE, amountWei);
        console.log('Approval transaction sent:', approveTx.hash);
        
        const approveReceipt = await approveTx.wait();
        console.log('Approval transaction confirmed:', approveReceipt);
        
        // Verify allowance was set
        const newAllowance = await cltContract.allowance(userAddress, CONTRACT_ADDRESSES.SOC_SERVICE);
        console.log('New allowance:', ethers.formatEther(newAllowance));
        
        if (newAllowance < amountWei) {
          throw new Error('Failed to set sufficient allowance');
        }
      } else {
        console.log('Sufficient allowance already exists');
      }

      // Create ticket
      const socContract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);
      console.log('Creating ticket on SOC contract...');
      
      const createTx = await socContract.createTicket(title, amountWei);
      console.log('Create ticket transaction sent:', createTx.hash);
      
      const receipt = await createTx.wait();
      console.log('Create ticket transaction confirmed:', receipt);

      // Parse events to get ticket ID
      let ticketId = null;
      let stakingPool = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = socContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TicketCreated') {
            ticketId = parsedLog.args.id.toString();
            stakingPool = parsedLog.args.stakingPool;
            console.log('Ticket created successfully:', { ticketId, stakingPool });
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }

      return {
        txHash: createTx.hash,
        ticketId,
        stakingPool,
        receipt
      };
      
    } catch (error: any) {
      console.error('Ticket creation failed:', error);
      throw error;
    }
  }

  // Assign as analyst
  async assignAsAnalyst(ticketId: number): Promise<any> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);
      
      console.log('Assigning as analyst for ticket:', ticketId);
      
      const tx = await contract.assignAsAnalyst(ticketId);
      console.log('Assign analyst transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Assign analyst transaction confirmed:', receipt);
      
      return { txHash: tx.hash, receipt };
    } catch (error: any) {
      console.error('Assign analyst failed:', error);
      throw new Error(`Failed to assign as analyst: ${error.message}`);
    }
  }

  // Assign as certifier
  async assignAsCertifier(ticketId: number): Promise<any> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);
      
      console.log('🔗 Assigning as certifier for ticket:', ticketId);
      
      const tx = await contract.assignAsCertifier(ticketId);
      console.log('📡 Assign certifier transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Assign certifier transaction confirmed:', receipt);
      
      return { txHash: tx.hash, receipt };
    } catch (error: any) {
      console.error('❌ Assign certifier failed:', error);
      throw new Error(`Failed to assign as certifier: ${error.message}`);
    }
  }

  // Validate ticket 
  async validateTicket(ticketId: number): Promise<any> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);
      
      console.log('🔗 Validating ticket:', ticketId);
      
      const tx = await contract.validateTicket(ticketId);
      console.log('📡 Validate ticket transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Validate ticket transaction confirmed:', receipt);
      
      return { txHash: tx.hash, receipt };
    } catch (error: any) {
      console.error('❌ Validate ticket failed:', error);
      throw new Error(`Failed to validate ticket: ${error.message}`);
    }
  }

  // Validate ticket (for analysts and certifiers)
  async validateTicket(ticketId: number): Promise<any> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.signer);
      
      console.log('Validating ticket:', ticketId);
      
      const tx = await contract.validateTicket(ticketId);
      console.log('Validate ticket transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Validate ticket transaction confirmed:', receipt);
      
      return { txHash: tx.hash, receipt };
    } catch (error: any) {
      console.error('Validate ticket failed:', error);
      throw new Error(`Failed to validate ticket: ${error.message}`);
    }
  }

  // Get ticket details
  async getTicket(ticketId: number): Promise<any> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.provider);
      const ticket = await contract.tickets(ticketId);
      
      return {
        id: ticket.id.toString(),
        title: ticket.title,
        client: ticket.client,
        analyst: ticket.analyst,
        certifier: ticket.certifier,
        rewardAmount: ethers.formatEther(ticket.rewardAmount),
        stakingPool: ticket.stakingPool,
        isValidated: ticket.isValidated
      };
    } catch (error: any) {
      console.error('Get ticket failed:', error);
      throw new Error(`Failed to get ticket: ${error.message}`);
    }
  }

  // Get ticket counter
  async getTicketCounter(): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.SOC_SERVICE, SOC_SERVICE_ABI, this.provider);
      const counter = await contract.ticketCounter();
      return parseInt(counter.toString());
    } catch (error: any) {
      console.error('Get ticket counter failed:', error);
      throw new Error(`Failed to get ticket counter: ${error.message}`);
    }
  }

  // Staking pool interaction methods (for EnhancedStakingPools component)
  async getStakeInfoForPool(poolAddress: string, userAddress: string): Promise<{amount: string}> {
    // Since we don't have actual staking pools implemented yet, return mock data
    // In a real implementation, this would query the staking pool contract
    return {
      amount: "0" // Default to 0 staked for now
    };
  }

  async stakeInPool(poolAddress: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      // This would interact with the actual staking pool contract
      // For now, we'll simulate the transaction
      console.log(`Simulating staking ${amount} CLT in pool ${poolAddress}`);
      
      // In a real implementation, this would:
      // 1. Get the staking pool contract
      // 2. Approve CLT spending if needed
      // 3. Call the stake function
      
      // Return a mock transaction hash
      return `0x${'0'.repeat(64)}`;
    } catch (error: any) {
      console.error('Stake in pool failed:', error);
      throw new Error(`Failed to stake in pool: ${error.message}`);
    }
  }

  async withdrawFromPool(poolAddress: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      console.log(`Simulating withdrawal of ${amount} CLT from pool ${poolAddress}`);
      // Return a mock transaction hash
      return `0x${'1'.repeat(64)}`;
    } catch (error: any) {
      console.error('Withdraw from pool failed:', error);
      throw new Error(`Failed to withdraw from pool: ${error.message}`);
    }
  }

  async claimFromPool(poolAddress: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    try {
      console.log(`Simulating reward claim from pool ${poolAddress}`);
      // Return a mock transaction hash
      return `0x${'2'.repeat(64)}`;
    } catch (error: any) {
      console.error('Claim from pool failed:', error);
      throw new Error(`Failed to claim from pool: ${error.message}`);
    }
  }
}

// Export singleton instance
export const evmContractService = new EVMContractService();