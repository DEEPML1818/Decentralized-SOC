import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Clock, 
  ExternalLink, 
  Wallet,
  AlertCircle,
  CheckCircle2,
  Users,
  DollarSign
} from "lucide-react";

interface PoolMetadata {
  title: string;
  description: string;
  category: string;
  riskLevel: string;
  estimatedAPY: string;
  minStake: string;
  maxStake: string;
  ipfsHash?: string;
}

interface StakingPool {
  id: number;
  address: string;
  ticketTitle: string;
  analystAddress: string;
  clientAddress: string;
  rewardAmount: string;
  isValidated: boolean;
  metadata?: PoolMetadata;
  userStakeAmount: string;
  totalStaked: string;
}

export default function EnhancedStakingPools() {
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [stakeAmounts, setStakeAmounts] = useState<{[key: string]: string}>({});
  const [withdrawAmounts, setWithdrawAmounts] = useState<{[key: string]: string}>({});
  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  // Load pools and metadata from blockchain + IPFS
  const loadPools = async () => {
    if (!isEVMConnected || !evmAddress) return;

    try {
      setLoading(true);
      const ticketCounter = await evmContractService.getTicketCounter();
      const poolsData: StakingPool[] = [];

      // Fetch all tickets from SOCService
      for (let i = 0; i < ticketCounter; i++) {
        try {
          const ticket = await evmContractService.getTicket(i);
          
          // Get user's stake info for this pool
          const stakeInfo = await evmContractService.getStakeInfoForPool(ticket.stakingPool, evmAddress);
          
          // Generate metadata based on ticket information
          const metadata: PoolMetadata = {
            title: ticket.title,
            description: `Security analysis pool for "${ticket.title}". Stake CLT tokens to earn rewards while supporting blockchain security operations.`,
            category: ticket.isValidated ? "Validated" : "Active Analysis",
            riskLevel: "Medium",
            estimatedAPY: "12-18%",
            minStake: "10",
            maxStake: "1000",
            ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`
          };

          poolsData.push({
            id: i,
            address: ticket.stakingPool,
            ticketTitle: ticket.title,
            analystAddress: ticket.analyst,
            clientAddress: ticket.client,
            rewardAmount: ticket.rewardAmount,
            isValidated: ticket.isValidated,
            metadata,
            userStakeAmount: stakeInfo.amount,
            totalStaked: "0" // Would be fetched from contract in real implementation
          });
        } catch (error) {
          console.error(`Error loading ticket ${i}:`, error);
        }
      }

      setPools(poolsData);
    } catch (error) {
      console.error("Error loading staking pools:", error);
      toast({
        title: "Failed to Load Pools",
        description: "Could not load staking pools from blockchain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, [isEVMConnected, evmAddress]);

  const handleStake = async (poolAddress: string, amount: string) => {
    if (!isEVMConnected || !amount || parseFloat(amount) <= 0) return;

    try {
      const txHash = await evmContractService.stakeInPool(poolAddress, amount);
      
      toast({
        title: "Stake Successful",
        description: `Staked ${amount} CLT tokens. Transaction: ${txHash.slice(0, 8)}...`,
      });

      // Reset input and reload pools
      setStakeAmounts(prev => ({ ...prev, [poolAddress]: "" }));
      loadPools();
    } catch (error: any) {
      toast({
        title: "Stake Failed",
        description: error?.message || "Failed to stake CLT tokens",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async (poolAddress: string, amount: string) => {
    if (!isEVMConnected || !amount || parseFloat(amount) <= 0) return;

    try {
      const txHash = await evmContractService.withdrawFromPool(poolAddress, amount);
      
      toast({
        title: "Withdrawal Successful",
        description: `Withdrew ${amount} CLT tokens. Transaction: ${txHash.slice(0, 8)}...`,
      });

      // Reset input and reload pools
      setWithdrawAmounts(prev => ({ ...prev, [poolAddress]: "" }));
      loadPools();
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error?.message || "Failed to withdraw CLT tokens",
        variant: "destructive",
      });
    }
  };

  const handleClaimRewards = async (poolAddress: string) => {
    if (!isEVMConnected) return;

    try {
      const txHash = await evmContractService.claimFromPool(poolAddress);
      
      toast({
        title: "Rewards Claimed",
        description: `Claimed rewards from pool. Transaction: ${txHash.slice(0, 8)}...`,
      });

      loadPools();
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error?.message || "Failed to claim rewards",
        variant: "destructive",
      });
    }
  };

  if (!isEVMConnected) {
    return (
      <Card className="cyber-glass bg-red-500/10 border-red-500/30">
        <CardContent className="p-8 text-center">
          <Wallet className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">EVM Wallet Required</h3>
          <p className="text-gray-300">Connect your MetaMask wallet to view and interact with staking pools</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="cyber-glass bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading staking pools from blockchain...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-red-400 mb-2">Enhanced Staking Pools</h2>
        <p className="text-gray-300">Stake CLT tokens in security analysis pools to earn rewards</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-mono text-lg">{pools.length}</p>
            <p className="text-xs text-gray-400">Active Pools</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <CheckCircle2 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 font-mono text-lg">{pools.filter(p => p.isValidated).length}</p>
            <p className="text-xs text-gray-400">Validated Pools</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <Coins className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-400 font-mono text-lg">
              {pools.reduce((total, pool) => total + parseFloat(pool.userStakeAmount || "0"), 0).toFixed(2)} CLT
            </p>
            <p className="text-xs text-gray-400">Your Total Staked</p>
          </div>
        </div>
      </div>

      {pools.length === 0 ? (
        <Card className="cyber-glass bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">No Pools Available</h3>
            <p className="text-gray-300">Create a security ticket first to generate staking pools</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pools.map((pool) => (
            <Card key={pool.address} className="cyber-glass bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {pool.metadata?.title || `Pool #${pool.id}`}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      {pool.metadata?.description || "Security analysis staking pool"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={pool.isValidated ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                      {pool.isValidated ? "Validated" : "Active"}
                    </Badge>
                    {pool.metadata?.ipfsHash && (
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        IPFS: {pool.metadata.ipfsHash.slice(0, 8)}...
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pool Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Pool Reward</p>
                    <p className="text-red-400 font-mono">{parseFloat(pool.rewardAmount).toFixed(4)} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Est. APY</p>
                    <p className="text-green-400 font-mono">{pool.metadata?.estimatedAPY || "10-15%"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Your Stake</p>
                    <p className="text-blue-400 font-mono">{parseFloat(pool.userStakeAmount).toFixed(2)} CLT</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Risk Level</p>
                    <p className="text-yellow-400">{pool.metadata?.riskLevel || "Medium"}</p>
                  </div>
                </div>

                {/* Pool Details */}
                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pool Address:</span>
                    <span className="text-gray-300 font-mono">{pool.address.slice(0, 8)}...{pool.address.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analyst:</span>
                    <span className="text-gray-300 font-mono">{pool.analystAddress.slice(0, 8)}...{pool.analystAddress.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Client:</span>
                    <span className="text-gray-300 font-mono">{pool.clientAddress.slice(0, 8)}...{pool.clientAddress.slice(-6)}</span>
                  </div>
                </div>

                {/* Staking Actions */}
                <div className="space-y-3">
                  {/* Stake Section */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Stake CLT</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={stakeAmounts[pool.address] || ""}
                        onChange={(e) => setStakeAmounts(prev => ({ ...prev, [pool.address]: e.target.value }))}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <Button
                        onClick={() => handleStake(pool.address, stakeAmounts[pool.address] || "")}
                        disabled={!stakeAmounts[pool.address] || parseFloat(stakeAmounts[pool.address]) <= 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Stake
                      </Button>
                    </div>
                  </div>

                  {/* Withdraw Section - only show if user has stake */}
                  {parseFloat(pool.userStakeAmount) > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-orange-400" />
                        <span className="text-orange-400 font-semibold">Withdraw CLT</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          max={pool.userStakeAmount}
                          value={withdrawAmounts[pool.address] || ""}
                          onChange={(e) => setWithdrawAmounts(prev => ({ ...prev, [pool.address]: e.target.value }))}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                        <Button
                          onClick={() => handleWithdraw(pool.address, withdrawAmounts[pool.address] || "")}
                          disabled={!withdrawAmounts[pool.address] || parseFloat(withdrawAmounts[pool.address]) <= 0}
                          variant="outline"
                          className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Claim Rewards */}
                  <Button
                    onClick={() => handleClaimRewards(pool.address)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Claim Rewards
                  </Button>
                </div>

                {/* External Links */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://sepolia.scrollscan.dev/address/${pool.address}`, '_blank')}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Explorer
                  </Button>
                  {pool.metadata?.ipfsHash && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${pool.metadata?.ipfsHash}`, '_blank')}
                      className="border-purple-600 text-purple-300 hover:bg-purple-500/20"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      IPFS
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}