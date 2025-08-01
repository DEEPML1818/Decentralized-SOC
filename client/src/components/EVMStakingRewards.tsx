import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { evmContractService } from "@/lib/evm-contract";
import { useWallet } from "./WalletProvider";
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
  ExternalLink
} from "lucide-react";

interface EVMStakingData {
  stakedAmount: number;
  rewardDebt: number;
  cltBalance: number;
  rewardRate: number;
}

export default function EVMStakingRewards() {
  const [stakingData, setStakingData] = useState<EVMStakingData>({
    stakedAmount: 0,
    rewardDebt: 0,
    cltBalance: 0,
    rewardRate: 0
  });

  const [stakeAmount, setStakeAmount] = useState("100");
  const [withdrawAmount, setWithdrawAmount] = useState("50");
  const [isLoading, setIsLoading] = useState(true);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

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

      // Get CLT balance
      const cltBalance = await evmContractService.getCLTBalance(evmAddress);

      // Get staking info
      const stakeInfo = await evmContractService.getStakeInfo(evmAddress);

      setStakingData({
        stakedAmount: stakeInfo?.amount || 0,
        rewardDebt: stakeInfo?.rewardDebt || 0,
        cltBalance: cltBalance,
        rewardRate: 5.5 // This could be fetched from contract
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
      const txHash = await evmContractService.stakeCLT(Number(stakeAmount));

      if (txHash) {
        toast({
          title: "Success!",
          description: (
            <div className="flex items-center gap-2">
              <span>Stake transaction submitted</span>
              <ExternalLink 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => window.open(`https://sepolia.scrollscan.com/tx/${txHash}`, '_blank')}
              />
            </div>
          ),
        });

        // Reload data after successful stake
        setTimeout(() => {
          loadStakingData();
        }, 2000);

        setStakeAmount("100");
      }
    } catch (error: any) {
      toast({
        title: "Error",
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
        description: "Please enter a valid withdraw amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsWithdrawing(true);
      const txHash = await evmContractService.withdrawStake(Number(withdrawAmount));

      if (txHash) {
        toast({
          title: "Success!",
          description: (
            <div className="flex items-center gap-2">
              <span>Withdrawal transaction submitted</span>
              <ExternalLink 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => window.open(`https://sepolia.scrollscan.com/tx/${txHash}`, '_blank')}
              />
            </div>
          ),
        });

        // Reload data after successful withdrawal
        setTimeout(() => {
          loadStakingData();
        }, 2000);

        setWithdrawAmount("50");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw stake",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true);
      const txHash = await evmContractService.claimRewards();

      if (txHash) {
        toast({
          title: "Success!",
          description: (
            <div className="flex items-center gap-2">
              <span>Rewards claimed successfully</span>
              <ExternalLink 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => window.open(`https://sepolia.scrollscan.com/tx/${txHash}`, '_blank')}
              />
            </div>
          ),
        });

        // Reload data after successful claim
        setTimeout(() => {
          loadStakingData();
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isEVMConnected) {
    return (
      <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">EVM Wallet Not Connected</h3>
          <p className="text-gray-400">Please connect your MetaMask wallet to access EVM staking features</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading EVM staking data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Info */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-green-400" />
              <div>
                <CardTitle className="text-green-400">Scroll Sepolia Testnet</CardTitle>
                <CardDescription className="text-gray-400">
                  EVM-compatible staking on Scroll L2
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Live
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">CLT Balance</CardTitle>
            <Coins className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stakingData.cltBalance.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Available CLT tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Staked Amount</CardTitle>
            <Lock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stakingData.stakedAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-400">CLT tokens staked</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Reward Debt</CardTitle>
            <Award className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stakingData.rewardDebt.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Accumulated rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">APR</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stakingData.rewardRate}%</div>
            <p className="text-xs text-gray-400">Annual percentage rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stake CLT */}
        <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-3">
              <ArrowUpCircle className="h-5 w-5" />
              Stake CLT Tokens
            </CardTitle>
            <CardDescription className="text-gray-400">
              Stake your CLT tokens to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stakeAmount" className="text-gray-300">Amount to Stake</Label>
              <Input
                id="stakeAmount"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-slate-700/50 border-gray-600 text-white"
                placeholder="Enter CLT amount"
              />
            </div>
            <Button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isStaking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Staking...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4" />
                  Stake {stakeAmount} CLT
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Withdraw & Claim */}
        <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-3">
              <ArrowDownCircle className="h-5 w-5" />
              Withdraw & Claim
            </CardTitle>
            <CardDescription className="text-gray-400">
              Withdraw your staked tokens or claim rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="withdrawAmount" className="text-gray-300">Amount to Withdraw</Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-slate-700/50 border-gray-600 text-white"
                placeholder="Enter CLT amount"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount || stakingData.stakedAmount === 0}
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                {isWithdrawing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                    Withdrawing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4" />
                    Withdraw
                  </div>
                )}
              </Button>

              <Button
                onClick={handleClaimRewards}
                disabled={isClaiming || stakingData.rewardDebt === 0}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
              >
                {isClaiming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Claiming...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Claim
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Information */}
      <Card className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-300">Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">CLT Token:</p>
              <p className="text-white font-mono break-all">0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403</p>
            </div>
            <div>
              <p className="text-gray-400">Staking Pool:</p>
              <p className="text-white font-mono break-all">0xB480FA23e8d586Af034aae3CA9a0D111E071a01e</p>
            </div>
            <div>
              <p className="text-gray-400">SOC Service:</p>
              <p className="text-white font-mono break-all">0x284B4cE9027b8f81211efd19A3a5D40D8b232D60</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}