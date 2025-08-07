
# Staking Pool Information Template

## Required Information for Creating/Joining Staking Pools

### Pool Identification
- **Pool Address**: Smart contract address of the staking pool
- **Pool ID**: Unique identifier for the pool
- **Pool Name**: Human-readable name for the pool
- **Pool Type**: Type of pool (Security Analysis, General Staking, Emergency Response, etc.)

### Pool Metadata
- **Title**: Brief title describing the pool's purpose
- **Description**: Detailed description of what the pool supports
- **Category**: Category classification (DeFi Security, Oracle Analysis, Bridge Security, etc.)
- **Risk Level**: Risk assessment (Low, Medium, High, Critical)
- **Status**: Current status (Active, Paused, Closed, Validated)

### Financial Information
- **Token Address**: Address of the staking token (CLT)
- **Minimum Stake**: Minimum amount required to stake
- **Maximum Stake**: Maximum amount allowed to stake
- **Total Staked**: Current total amount staked in the pool
- **Available Capacity**: Remaining staking capacity
- **Reward Rate**: Annual percentage yield (APY)
- **Reward Token**: Token used for rewards distribution

### Pool Configuration
- **Pool Owner**: Address of the pool owner/creator
- **Analyst Address**: Address of assigned security analyst (if applicable)
- **Client Address**: Address of the client who requested the analysis
- **Validator Address**: Address of the validator/certifier
- **Creation Date**: When the pool was created
- **Duration**: Expected duration of the pool
- **Lock Period**: How long tokens are locked after staking

### Associated Case Information (for Security Pools)
- **Case ID**: Associated security incident ID
- **Case Title**: Title of the security incident
- **Severity**: Severity level of the incident
- **Evidence Hash**: IPFS hash of evidence files
- **Report Hash**: IPFS hash of analysis report
- **Blockchain Network**: Which blockchain the incident occurred on
- **Transaction Hash**: Relevant transaction hash (if applicable)
- **Contract Address**: Address of affected smart contract

### Staking Requirements
- **Required Expertise**: Skills needed for analysis (if applicable)
- **Certification Required**: Whether certification is needed
- **Estimated Analysis Time**: Expected time to complete analysis
- **Regulatory Requirements**: Any compliance requirements (GDPR, MiCA, etc.)
- **Public Disclosure**: Whether results will be publicly disclosed

### User Interaction Data
- **User Stake Amount**: Amount currently staked by the user
- **User Rewards**: Pending rewards for the user
- **Staking History**: History of user's staking actions
- **Claim History**: History of reward claims

### Pool Performance
- **Participant Count**: Number of stakers in the pool
- **Success Rate**: Historical success rate of similar pools
- **Average Return**: Average return percentage
- **Completion Rate**: Percentage of cases successfully completed

### IPFS/External Data
- **IPFS Metadata Hash**: Hash of detailed pool metadata
- **Evidence URLs**: Links to evidence files
- **External Links**: Links to block explorers, documentation, etc.
- **Documentation Hash**: Hash of pool documentation

### Smart Contract Integration
- **Staking Function**: Function to call for staking
- **Unstaking Function**: Function to call for unstaking
- **Claim Function**: Function to call for claiming rewards
- **Pool Info Function**: Function to get pool information
- **Events**: Contract events to listen for

## Example Pool Data Structure

```typescript
interface StakingPoolInfo {
  // Identification
  poolAddress: string;
  poolId: number;
  poolName: string;
  poolType: 'security' | 'general' | 'emergency';
  
  // Metadata
  title: string;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'closed' | 'validated';
  
  // Financial
  tokenAddress: string;
  minStake: string;
  maxStake: string;
  totalStaked: string;
  availableCapacity: string;
  rewardRate: string;
  
  // Configuration
  poolOwner: string;
  analystAddress?: string;
  clientAddress?: string;
  creationDate: string;
  duration?: number;
  lockPeriod: number;
  
  // Case Info (for security pools)
  caseId?: number;
  severity?: string;
  evidenceHash?: string;
  reportHash?: string;
  network?: string;
  
  // User Data
  userStakeAmount: string;
  userRewards: string;
  
  // Performance
  participantCount: number;
  successRate?: number;
  averageReturn?: number;
  
  // External
  ipfsHash?: string;
  externalLinks?: string[];
}
```

## Required User Actions

### For Pool Creation
1. **Connect Wallet**: User must have connected EVM wallet
2. **Approve Token Spending**: Approve contract to spend CLT tokens
3. **Set Pool Parameters**: Configure minimum stake, reward rate, duration
4. **Fund Pool**: Initial funding for rewards distribution
5. **Upload Metadata**: Upload pool information to IPFS

### For Pool Participation
1. **Connect Wallet**: User must have connected EVM wallet
2. **Check Balance**: Verify sufficient CLT token balance
3. **Approve Spending**: Approve pool contract to spend tokens
4. **Select Amount**: Choose amount within min/max limits
5. **Confirm Transaction**: Sign staking transaction
6. **Monitor Position**: Track staking rewards and position

### For Pool Management
1. **Update Parameters**: Modify reward rates, capacity, etc.
2. **Pause/Resume**: Control pool activity
3. **Validate Results**: Approve/reject analysis results
4. **Distribute Rewards**: Trigger reward distribution
5. **Close Pool**: End pool and return remaining funds
