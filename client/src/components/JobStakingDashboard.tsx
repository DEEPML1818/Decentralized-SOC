import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Shield, 
  Users, 
  BarChart3,
  ExternalLink,
  Coins
} from 'lucide-react';
import { useWallet } from './WalletProvider';
import { evmContractService } from '@/lib/evm-contract';
import { useToast } from '@/hooks/use-toast';

interface JobStake {
  ticketId: number;
  amount: string;
  status: 'active' | 'completed' | 'validated';
  earnings: string;
  startDate: string;
  role: 'analyst' | 'client' | 'certifier';
  apy: number;
  rewardClaimed: boolean;
}

export default function JobStakingDashboard() {
  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [totalStaked, setTotalStaked] = useState('0');
  const [totalEarnings, setTotalEarnings] = useState('0');
  const [activeJobs, setActiveJobs] = useState<JobStake[]>([]);
  const [completedJobs, setCompletedJobs] = useState<JobStake[]>([]);
  const [cltBalance, setCltBalance] = useState('0');
  const [rewardRate, setRewardRate] = useState('0');

  useEffect(() => {
    if (isEVMConnected && evmAddress) {
      loadStakingData();
    }
  }, [isEVMConnected, evmAddress]);

  const loadStakingData = async () => {
    if (!evmAddress) return;
    
    try {
      setLoading(true);
      
      // Get CLT balance
      const balanceBN = await evmContractService.getCLTBalance(evmAddress);
      const balance = evmContractService.formatCLT(balanceBN);
      setCltBalance(balance);
      
      // Get staking info
      const stakeInfo = await evmContractService.getStakeInfo(evmAddress);
      const stakedAmount = evmContractService.formatCLT(stakeInfo.amount);
      const rewardDebt = evmContractService.formatCLT(stakeInfo.rewardDebt);
      setTotalStaked(stakedAmount);
      setTotalEarnings(rewardDebt);
      
      // Get reward rate
      const rateBN = await evmContractService.getRewardRate();
      const rate = evmContractService.formatCLT(rateBN);
      setRewardRate(rate);
      
      // Mock job data for demonstration (in real app, this would come from contract events)
      const mockActiveJobs: JobStake[] = [
        {
          ticketId: 1,
          amount: '1000',
          status: 'active',
          earnings: '45.23',
          startDate: '2025-01-15',
          role: 'analyst',
          apy: 12.5,
          rewardClaimed: false
        },
        {
          ticketId: 2,
          amount: '500',
          status: 'active',
          earnings: '18.92',
          startDate: '2025-01-18',
          role: 'certifier',
          apy: 15.2,
          rewardClaimed: false
        }
      ];
      
      const mockCompletedJobs: JobStake[] = [
        {
          ticketId: 3,
          amount: '750',
          status: 'completed',
          earnings: '92.45',
          startDate: '2025-01-10',
          role: 'analyst',
          apy: 14.8,
          rewardClaimed: true
        }
      ];
      
      setActiveJobs(mockActiveJobs);
      setCompletedJobs(mockCompletedJobs);
      
    } catch (error: any) {
      console.error('Error loading staking data:', error);
      toast({
        title: "Error",
        description: "Failed to load staking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async (ticketId: number) => {
    try {
      const txHash = await evmContractService.claimRewards();
      toast({
        title: "Rewards Claimed!",
        description: `Transaction: ${txHash}`,
      });
      
      // Reload data
      setTimeout(() => {
        loadStakingData();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'analyst': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'certifier': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'client': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'validated': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!isEVMConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-slate-800 border-purple-500/30 p-8 text-center">
          <CardContent className="space-y-4">
            <Shield className="h-12 w-12 text-purple-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400">Connect your EVM wallet to view job staking dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-slate-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Staked</CardTitle>
            <Coins className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStaked} CLT</div>
            <p className="text-xs text-green-400 mt-1">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEarnings} CLT</div>
            <p className="text-xs text-green-400 mt-1">
              +18.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeJobs.length}</div>
            <p className="text-xs text-blue-400 mt-1">
              {completedJobs.length} completed this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeJobs.length > 0 
                ? (activeJobs.reduce((acc, job) => acc + job.apy, 0) / activeJobs.length).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-purple-400 mt-1">
              Reward Rate: {rewardRate} CLT/block
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      <Card className="bg-slate-800 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Active Job Stakes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No active job stakes. Start by staking on security analysis jobs.
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.ticketId} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Ticket #{job.ticketId}
                      </Badge>
                      <Badge className={getRoleColor(job.role)}>
                        {job.role}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Staked</div>
                      <div className="text-lg font-semibold text-white">{job.amount} CLT</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Current Earnings</div>
                      <div className="text-lg font-semibold text-green-400">{job.earnings} CLT</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">APY</div>
                      <div className="text-lg font-semibold text-purple-400">{job.apy}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Started</div>
                      <div className="text-lg font-semibold text-white">{job.startDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Progress</div>
                      <Progress value={75} className="w-full mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      onClick={() => window.open(`https://sepolia.scrollscan.dev/`, '_blank')}
                    >
                      View Details
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                    
                    {!job.rewardClaimed && parseFloat(job.earnings) > 0 && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleClaimRewards(job.ticketId)}
                      >
                        Claim {job.earnings} CLT
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Jobs */}
      <Card className="bg-slate-800 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Completed Job Stakes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No completed job stakes yet.
            </div>
          ) : (
            <div className="space-y-4">
              {completedJobs.map((job) => (
                <div key={job.ticketId} className="border border-gray-700 rounded-lg p-4 opacity-75">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Ticket #{job.ticketId}
                      </Badge>
                      <Badge className={getRoleColor(job.role)}>
                        {job.role}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total Earned</div>
                      <div className="text-lg font-semibold text-green-400">{job.earnings} CLT</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Amount Staked</div>
                      <div className="text-lg font-semibold text-white">{job.amount} CLT</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Final APY</div>
                      <div className="text-lg font-semibold text-purple-400">{job.apy}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Completion Date</div>
                      <div className="text-lg font-semibold text-white">{job.startDate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}