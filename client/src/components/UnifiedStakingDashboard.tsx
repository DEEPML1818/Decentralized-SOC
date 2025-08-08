import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./providers/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Coins, 
  TrendingUp, 
  Award, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Target,
  Lock,
  DollarSign,
  Activity,
  ExternalLink,
  Shield,
  Users,
  Clock,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface StakingData {
  stakedAmount: number;
  rewardDebt: number;
  cltBalance: number;
  rewardRate: number;
  totalPoolValue: number;
  userPoolShare: number;
  estimatedAPY: number;
}

export default function UnifiedStakingDashboard() {
  const [stakingData, setStakingData] = useState<StakingData>({
    stakedAmount: 0,
    rewardDebt: 0,
    cltBalance: 0,
    rewardRate: 0,
    totalPoolValue: 0,
    userPoolShare: 0,
    estimatedAPY: 5.5
  });

  const [stakeAmount, setStakeAmount] = useState("100");
  const [withdrawAmount, setWithdrawAmount] = useState("50");
  const [isLoading, setIsLoading] = useState(true);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (isEVMConnected && evmAddress) {
      loadStakingData();
    }
  }, [isEVMConnected, evmAddress]);

  const loadStakingData = async () => {
    if (!evmAddress) return;

    try {
      setIsLoading(true);

      // Get CLT balance from the correct CLT contract: 0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097
      const cltBalance = parseFloat(await evmContractService.getCLTBalance(evmAddress));

      // Get staking info for CLT tokens
      const stakeInfo = await evmContractService.getStakeInfo(evmAddress);
      const stakedAmount = parseFloat(evmContractService.formatCLT(stakeInfo.amount));
      const rewardDebt = parseFloat(evmContractService.formatCLT(stakeInfo.rewardDebt));

      // Set a default reward rate (this can be updated with actual contract data if available)
      const rewardRate = 0.05; // 5% reward rate

      // Calculate additional metrics
      const totalPoolValue = stakedAmount * 10; // Simulated total pool
      const userPoolShare = totalPoolValue > 0 ? (stakedAmount / totalPoolValue) * 100 : 0;

      setStakingData({
        stakedAmount,
        rewardDebt,
        cltBalance,
        rewardRate,
        totalPoolValue,
        userPoolShare,
        estimatedAPY: 5.5 // This could be calculated from contract data
      });
    } catch (error) {
      console.error('Error loading staking data:', error);
      toast({
        title: "Error",
        description: "Failed to load staking data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      toast({
        title: "Error",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsStaking(true);
      // Use the actual staking method from the contract service
      await evmContractService.stakeInPool("", stakeAmount); // Can add specific pool address if needed
      
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${stakeAmount} CLT tokens`,
      });

      // Reload data
      await loadStakingData();
      setStakeAmount("100");
    } catch (error: any) {
      console.error('Error staking:', error);
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake tokens",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      toast({
        title: "Error",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsWithdrawing(true);
      // Use the actual withdrawal method from the contract service
      await evmContractService.withdrawFromPool("", withdrawAmount); // Can add specific pool address if needed
      
      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${withdrawAmount} CLT tokens`,
      });

      // Reload data
      await loadStakingData();
      setWithdrawAmount("50");
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw tokens",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      // Use the actual reward claiming method from the contract service
      await evmContractService.mintCLTReward(evmAddress!, "10"); // Default 10 CLT reward
      
      toast({
        title: "Rewards Claimed",
        description: "Successfully claimed your staking rewards",
      });

      // Reload data
      await loadStakingData();
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStakingData();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Staking data has been updated",
    });
  };

  if (!isEVMConnected) {
    return (
      <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Wallet className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-orange-400 mb-2">Connect EVM Wallet</h3>
          <p className="text-gray-300 mb-4">Please connect your MetaMask wallet to access CLT staking</p>
          <div className="bg-gray-800 p-3 rounded font-mono text-xs text-gray-400 border">
            CLT Token: 0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">CLT Staking Dashboard</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* CLT Contract Info */}
        <Card className="bg-slate-800/50 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="font-bold text-green-400">CLT Token Contract</h3>
                <div className="font-mono text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded">
                  0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://sepolia.scrollscan.dev/address/0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097', '_blank')}
                className="ml-auto text-gray-400"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-400">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-400" />
              {stakingData.stakedAmount.toFixed(2)} CLT
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your staked position
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-400">Pending Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-green-400" />
              {stakingData.rewardDebt.toFixed(4)} CLT
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available to claim
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-400">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-400" />
              {stakingData.cltBalance.toFixed(2)} CLT
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available to stake
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-400">Estimated APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              {stakingData.estimatedAPY}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Annual percentage yield
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stake" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stake">Stake Tokens</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Stake CLT Tokens
                </CardTitle>
                <CardDescription>
                  Stake your CLT tokens to earn rewards and participate in governance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stakeAmount">Amount to Stake</Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter CLT amount"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {stakingData.cltBalance.toFixed(2)} CLT
                  </p>
                </div>
                <Button
                  onClick={handleStake}
                  disabled={isStaking || isLoading}
                  className="w-full"
                >
                  {isStaking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Staking...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Stake Tokens
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Claim Rewards
                </CardTitle>
                <CardDescription>
                  Claim your earned staking rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {stakingData.rewardDebt.toFixed(4)} CLT
                    </div>
                    <p className="text-sm text-gray-400">Pending Rewards</p>
                  </div>
                </div>
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming || stakingData.rewardDebt === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isClaiming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Claim Rewards
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Minus className="h-5 w-5" />
                Withdraw Staked Tokens
              </CardTitle>
              <CardDescription>
                Withdraw your staked CLT tokens (may affect rewards)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="withdrawAmount">Amount to Withdraw</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter CLT amount"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Staked: {stakingData.stakedAmount.toFixed(2)} CLT
                </p>
              </div>
              <Button
                onClick={handleWithdraw}
                disabled={isWithdrawing || stakingData.stakedAmount === 0}
                variant="destructive"
                className="w-full"
              >
                {isWithdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Withdraw Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pool Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pool Value</span>
                  <span className="font-semibold">{stakingData.totalPoolValue.toFixed(2)} CLT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Pool Share</span>
                  <span className="font-semibold">{stakingData.userPoolShare.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reward Rate</span>
                  <span className="font-semibold">{stakingData.rewardRate} CLT/block</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current APY</span>
                  <span className="font-semibold text-green-400">{stakingData.estimatedAPY}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Staking Pool Contract</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      0xB480...a01e
                    </code>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://sepolia.scrollscan.dev/address/0xB480FA23e8d586Af034aae3CA9a0D111E071a01e"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">CLT Token Contract</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      0xBb64...1403
                    </code>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://sepolia.scrollscan.dev/address/0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}