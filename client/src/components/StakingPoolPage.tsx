import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { formatUnits } from "ethers";
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Shield, 
  Plus, 
  Minus, 
  Zap,
  DollarSign,
  BarChart3,
  Target,
  Award
} from "lucide-react";

interface StakingStats {
  totalStaked: string;
  userStaked: string;
  pendingRewards: string;
  apy: string;
  rewardRate: string;
  cltBalance: string;
}

export default function StakingPoolPage() {
  const { walletType, evmAddress, iotaAddress, isEVMConnected, isIOTAConnected } = useWallet();
  const { toast } = useToast();
  
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: "0",
    userStaked: "0", 
    pendingRewards: "0",
    apy: "15.5",
    rewardRate: "0",
    cltBalance: "0"
  });
  
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stake' | 'withdraw'>('stake');

  const isConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;
  const currentAddress = walletType === 'iota' ? iotaAddress : evmAddress;

  useEffect(() => {
    if (isConnected && walletType === 'evm' && evmAddress) {
      loadEVMStakingData();
    } else if (isConnected && walletType === 'iota' && iotaAddress) {
      loadIOTAStakingData();
    }
  }, [isConnected, walletType, evmAddress, iotaAddress]);

  const loadEVMStakingData = async () => {
    if (!evmAddress) return;
    
    try {
      const [userStake, rewardRate, cltBalance] = await Promise.all([
        evmContractService.getUserStake(evmAddress),
        evmContractService.getRewardRate(),
        evmContractService.getCLTBalance(evmAddress)
      ]);

      setStakingStats({
        totalStaked: "125,000", // Mock total - would need aggregation
        userStaked: formatUnits(userStake.amount, 18),
        pendingRewards: formatUnits(userStake.rewardDebt, 18),
        apy: "15.5",
        rewardRate: rewardRate,
        cltBalance: cltBalance
      });
    } catch (error) {
      console.error('Failed to load EVM staking data:', error);
    }
  };

  const loadIOTAStakingData = async () => {
    // Mock IOTA staking data - implement with IOTA contracts
    setStakingStats({
      totalStaked: "250,000",
      userStaked: "1,000",
      pendingRewards: "45.5",
      apy: "12.5",
      rewardRate: "0.5",
      cltBalance: "5,000"
    });
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (walletType === 'evm') {
        const tx = await evmContractService.stake(stakeAmount);
        await tx.wait();
        
        toast({
          title: "Stake Successful",
          description: `Successfully staked ${stakeAmount} CLT tokens`,
        });
        
        await loadEVMStakingData();
      } else {
        // Mock IOTA staking
        toast({
          title: "IOTA Stake Successful", 
          description: `Successfully staked ${stakeAmount} CLT tokens on IOTA`,
        });
        await loadIOTAStakingData();
      }
      
      setStakeAmount("");
    } catch (error: any) {
      toast({
        title: "Stake Failed",
        description: error.message || "Failed to stake tokens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdraw amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (walletType === 'evm') {
        const tx = await evmContractService.withdraw(withdrawAmount);
        await tx.wait();
        
        toast({
          title: "Withdrawal Successful",
          description: `Successfully withdrew ${withdrawAmount} CLT tokens`,
        });
        
        await loadEVMStakingData();
      } else {
        // Mock IOTA withdrawal
        toast({
          title: "IOTA Withdrawal Successful",
          description: `Successfully withdrew ${withdrawAmount} CLT tokens from IOTA`,
        });
        await loadIOTAStakingData();
      }
      
      setWithdrawAmount("");
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw tokens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    try {
      if (walletType === 'evm') {
        const tx = await evmContractService.claimRewards();
        await tx.wait();
        
        toast({
          title: "Rewards Claimed",
          description: "Successfully claimed your staking rewards",
        });
        
        await loadEVMStakingData();
      } else {
        // Mock IOTA claim
        toast({
          title: "IOTA Rewards Claimed",
          description: "Successfully claimed your IOTA staking rewards",
        });
        await loadIOTAStakingData();
      }
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-purple-500/20">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <CardTitle className="text-white">Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the staking pool
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Coins className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CLT Staking Pool</h1>
              <p className="text-gray-400">
                Stake your CLT tokens and earn rewards on {walletType === 'iota' ? 'IOTA' : 'Scroll EVM'}
              </p>
            </div>
          </div>
          
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {walletType === 'iota' ? 'IOTA Network' : 'Scroll Sepolia'}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Staked</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stakingStats.totalStaked} CLT</div>
              <p className="text-xs text-gray-500">Across all users</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Your Stake</CardTitle>
                <Target className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stakingStats.userStaked} CLT</div>
              <p className="text-xs text-gray-500">Your staked tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Pending Rewards</CardTitle>
                <Award className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stakingStats.pendingRewards} CLT</div>
              <p className="text-xs text-gray-500">Ready to claim</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">APY</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stakingStats.apy}%</div>
              <p className="text-xs text-gray-500">Annual percentage yield</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Actions */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Staking Actions
              </CardTitle>
              <CardDescription>
                Stake or withdraw your CLT tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tab Selector */}
              <div className="flex space-x-1 bg-slate-700 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'stake'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Stake
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'withdraw'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Minus className="h-4 w-4 inline mr-2" />
                  Withdraw
                </button>
              </div>

              {activeTab === 'stake' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stake-amount" className="text-gray-300">
                      Stake Amount (CLT)
                    </Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="Enter amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-slate-700 border-purple-500/30 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Balance: {stakingStats.cltBalance} CLT
                    </p>
                  </div>
                  <Button
                    onClick={handleStake}
                    disabled={loading || !stakeAmount}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Staking...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Stake CLT
                      </>
                    )}
                  </Button>
                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount" className="text-gray-300">
                      Withdraw Amount (CLT)
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount to withdraw"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-slate-700 border-purple-500/30 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Staked: {stakingStats.userStaked} CLT
                    </p>
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 mr-2" />
                        Withdraw CLT
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Claim Rewards */}
              <div className="border-t border-gray-700 pt-4">
                <Button
                  onClick={handleClaimRewards}
                  disabled={loading || parseFloat(stakingStats.pendingRewards) <= 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Claim Rewards ({stakingStats.pendingRewards} CLT)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pool Information */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pool Information
              </CardTitle>
              <CardDescription>
                Staking pool details and rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">
                    {walletType === 'iota' ? 'IOTA' : 'Scroll Sepolia'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Token Contract</span>
                  <span className="text-white text-sm font-mono">
                    {walletType === 'evm' ? '0xBb64...1403' : 'Coming Soon'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Staking Contract</span>
                  <span className="text-white text-sm font-mono">
                    {walletType === 'evm' ? '0xB480...a01e' : 'Coming Soon'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Reward Rate</span>
                  <span className="text-white">{stakingStats.rewardRate} CLT/block</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Lock Period</span>
                  <span className="text-white">None</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Your Address</span>
                  <span className="text-white text-sm font-mono">
                    {currentAddress ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium">How Staking Works</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Stake CLT tokens to earn rewards</li>
                  <li>• Rewards are distributed per block</li>
                  <li>• No lock period - withdraw anytime</li>
                  <li>• Higher APY for longer staking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}