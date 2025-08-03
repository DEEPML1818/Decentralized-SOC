import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobStakingDashboard from "./JobStakingDashboard";
import EVMStakingRewards from "./EVMStakingRewards";
import Header from "./Header";
import { WalletProvider } from "./WalletProvider";
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  BarChart3,
  Target,
  Briefcase,
  DollarSign
} from "lucide-react";

export default function StakingPoolPage() {
  const [currentRole, setCurrentRole] = useState('client');

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Header onRoleChange={setCurrentRole} currentRole={currentRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Staking Dashboard</h1>
          <p className="text-gray-400">Monitor your staking positions, job stakes, and earnings across the dSOC platform</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Value Locked</CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$2.4M</div>
              <p className="text-xs text-green-400 mt-1">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Stakers</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,247</div>
              <p className="text-xs text-blue-400 mt-1">
                +89 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Average APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">14.8%</div>
              <p className="text-xs text-green-400 mt-1">
                Above market average
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Security Jobs</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">342</div>
              <p className="text-xs text-orange-400 mt-1">
                156 active positions
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="job-stakes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="job-stakes" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Job Stakes & Earnings
            </TabsTrigger>
            <TabsTrigger 
              value="general-staking"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Coins className="h-4 w-4 mr-2" />
              General Staking Pool
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-stakes" className="space-y-6">
            <Card className="bg-slate-800 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Job-Based Staking Dashboard
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track your staking positions on specific security analysis jobs and monitor real-time earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobStakingDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general-staking" className="space-y-6">
            <Card className="bg-slate-800 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-400" />
                  General CLT Staking Pool
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Stake CLT tokens in the general pool to earn rewards and participate in platform governance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EVMStakingRewards />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">How Job Staking Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-semibold mb-1">Choose Security Jobs</h4>
                  <p className="text-sm text-gray-400">Browse available security analysis jobs and stake CLT tokens to participate as an analyst or certifier.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-semibold mb-1">Earn Performance Rewards</h4>
                  <p className="text-sm text-gray-400">Complete security analysis tasks and get rewarded based on quality and timeliness of your work.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-semibold mb-1">Claim Your Earnings</h4>
                  <p className="text-sm text-gray-400">Withdraw your earned CLT tokens and staking rewards directly to your wallet.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Staking Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-300">Job-specific APY</span>
                <span className="text-green-400 font-semibold">8-25%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-300">General pool APY</span>
                <span className="text-purple-400 font-semibold">12-18%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-300">Performance bonuses</span>
                <span className="text-orange-400 font-semibold">Up to 5x</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Governance voting power</span>
                <span className="text-blue-400 font-semibold">1 CLT = 1 Vote</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </WalletProvider>
  );
}