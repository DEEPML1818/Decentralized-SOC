import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./providers/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { formatUnits, parseUnits } from "ethers";
import {
  Coins,
  Shield,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Target,
  Lock,
  Unlock,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";

interface StakingPool {
  id: string;
  caseId?: number;
  caseTitle?: string;
  totalStaked: string;
  participantCount: number;
  rewardRate: string;
  isActive: boolean;
  createdAt: string;
  description: string;
  severity: string;
}

export default function StakingPoolsPage() {
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [userStakeInfo, setUserStakeInfo] = useState({
    amount: "0",
    rewardDebt: "0",
    pendingRewards: "0"
  });
  const [stakeAmount, setStakeAmount] = useState("10");
  const [unstakeAmount, setUnstakeAmount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  // Mock staking pools data based on real incident reports
  const loadStakingPools = async () => {
    setRefreshing(true);
    try {
      // Get real incident reports to create staking pools
      const response = await fetch('/api/incident-reports');
      const incidents = await response.json();

      const pools: StakingPool[] = incidents.map((incident: any, index: number) => ({
        id: `pool-${incident.id}`,
        caseId: incident.id,
        caseTitle: incident.title,
        totalStaked: (Math.random() * 1000 + 100).toFixed(2), // Simulated staking amounts
        participantCount: Math.floor(Math.random() * 20) + 1,
        rewardRate: "5.25", // 5.25% APY
        isActive: incident.status !== 'closed',
        createdAt: incident.created_at,
        description: incident.description,
        severity: incident.severity
      }));

      // Add a general security pool
      pools.unshift({
        id: "general-security-pool",
        caseTitle: "General Security Operations Pool",
        totalStaked: "5432.18",
        participantCount: 127,
        rewardRate: "8.50",
        isActive: true,
        createdAt: new Date().toISOString(),
        description: "Stake CLT tokens to support general security operations and earn rewards",
        severity: "medium"
      });

      setStakingPools(pools);
    } catch (error) {
      console.error('Error loading staking pools:', error);
      toast({
        title: "Error",
        description: "Failed to load staking pools",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Load user staking info from blockchain
  const loadUserStakeInfo = async () => {
    if (!isEVMConnected || !evmAddress) return;

    try {
      const stakeInfo = await evmContractService.getStakeInfo(evmAddress);
      const cltBalance = await evmContractService.getCLTBalance(evmAddress);
      
      setUserStakeInfo({
        amount: formatUnits(stakeInfo.amount, 18),
        rewardDebt: formatUnits(stakeInfo.rewardDebt, 18),
        pendingRewards: formatUnits(cltBalance, 18) // Simplified for demo
      });
    } catch (error) {
      console.error('Error loading stake info:', error);
    }
  };

  useEffect(() => {
    loadStakingPools();
    loadUserStakeInfo();
  }, [evmAddress, isEVMConnected]);

  const handleStake = async (poolId: string) => {
    if (!isEVMConnected || !evmAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const tx = await evmContractService.stake(stakeAmount);
      await tx.wait();

      toast({
        title: "Staking Successful!",
        description: `Successfully staked ${stakeAmount} CLT tokens`,
      });

      // Refresh data
      await loadUserStakeInfo();
      await loadStakingPools();

    } catch (error: any) {
      console.error('Staking failed:', error);
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!isEVMConnected || !evmAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const tx = await evmContractService.withdraw(unstakeAmount);
      await tx.wait();

      toast({
        title: "Unstaking Successful!",
        description: `Successfully unstaked ${unstakeAmount} CLT tokens`,
      });

      // Refresh data
      await loadUserStakeInfo();
      await loadStakingPools();

    } catch (error: any) {
      console.error('Unstaking failed:', error);
      toast({
        title: "Unstaking Failed",
        description: error.message || "Failed to unstake tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!isEVMConnected || !evmAddress) return;

    setLoading(true);
    try {
      const tx = await evmContractService.claimRewards();
      await tx.wait();

      toast({
        title: "Rewards Claimed!",
        description: "Successfully claimed your staking rewards",
      });

      await loadUserStakeInfo();

    } catch (error: any) {
      console.error('Claim failed:', error);
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (!isEVMConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="cyber-glass border-red-500/30">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4 cyber-pulse" />
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono">Connect MetaMask</h2>
            <p className="text-gray-300">
              Please connect your MetaMask wallet to view and participate in staking pools
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-400 font-mono flex items-center gap-2">
            <Coins className="h-8 w-8" />
            Security Staking Pools
          </h1>
          <p className="text-gray-400 mt-2">
            Stake CLT tokens to support security operations and earn rewards
          </p>
        </div>
        <Button
          onClick={() => {
            loadStakingPools();
            loadUserStakeInfo();
          }}
          disabled={refreshing}
          className="btn-cyber"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* User Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-glass border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Your Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white font-mono">{parseFloat(userStakeInfo.amount).toFixed(2)} CLT</p>
          </CardContent>
        </Card>

        <Card className="cyber-glass border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white font-mono">{parseFloat(userStakeInfo.pendingRewards).toFixed(4)} CLT</p>
          </CardContent>
        </Card>

        <Card className="cyber-glass border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white font-mono">{stakingPools.length}</p>
          </CardContent>
        </Card>

        <Card className="cyber-glass border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Est. APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white font-mono">8.5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cyber-glass border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Stake Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount (CLT)</label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="10"
                className="bg-gray-900/50 border-green-500/30"
              />
            </div>
            <Button
              onClick={() => handleStake("general-security-pool")}
              disabled={loading}
              className="w-full btn-cyber bg-green-600 hover:bg-green-500"
            >
              {loading ? "Staking..." : "Stake CLT"}
            </Button>
          </CardContent>
        </Card>

        <Card className="cyber-glass border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Minus className="h-5 w-5" />
              Unstake Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount (CLT)</label>
              <Input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="5"
                className="bg-gray-900/50 border-orange-500/30"
              />
            </div>
            <Button
              onClick={handleUnstake}
              disabled={loading}
              className="w-full btn-cyber bg-orange-600 hover:bg-orange-500"
            >
              {loading ? "Unstaking..." : "Unstake CLT"}
            </Button>
          </CardContent>
        </Card>

        <Card className="cyber-glass border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Claim Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Available Rewards</p>
              <p className="text-xl font-bold text-white font-mono">{parseFloat(userStakeInfo.pendingRewards).toFixed(4)} CLT</p>
            </div>
            <Button
              onClick={handleClaimRewards}
              disabled={loading || parseFloat(userStakeInfo.pendingRewards) === 0}
              className="w-full btn-cyber bg-purple-600 hover:bg-purple-500"
            >
              {loading ? "Claiming..." : "Claim Rewards"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staking Pools List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-red-400 font-mono">Available Staking Pools</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stakingPools.map((pool) => (
            <Card key={pool.id} className="cyber-glass border-red-500/20 hover:border-red-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-400 text-lg">
                    {pool.caseTitle}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(pool.severity)}>
                      {pool.severity.toUpperCase()}
                    </Badge>
                    <Badge className={pool.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                      {pool.isActive ? "Active" : "Closed"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {pool.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                      <Coins className="h-4 w-4" />
                    </div>
                    <p className="text-white font-mono">{parseFloat(pool.totalStaked).toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">Total Staked</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <Users className="h-4 w-4" />
                    </div>
                    <p className="text-white font-mono">{pool.participantCount}</p>
                    <p className="text-gray-400 text-xs">Participants</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-white font-mono">{pool.rewardRate}%</p>
                    <p className="text-gray-400 text-xs">APY</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Clock className="h-4 w-4" />
                    </div>
                    <p className="text-white font-mono">{Math.floor((Date.now() - new Date(pool.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d</p>
                    <p className="text-gray-400 text-xs">Duration</p>
                  </div>
                </div>

                {pool.isActive && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <Button
                      onClick={() => handleStake(pool.id)}
                      disabled={loading}
                      className="w-full btn-cyber text-sm"
                    >
                      Stake in This Pool
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}