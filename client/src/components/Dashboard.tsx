import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Header from "./Header";
import TicketList from "./TicketList";
import TicketForm from "./TicketForm";
import IncidentReport from "./IncidentReport";
import StakingRewards from "./StakingRewards";
import EVMStakingRewards from "./EVMStakingRewards";
import SmartContractAudit from "./SmartContractAudit";
import AIAssistant from "./AIAssistant";
import { useWallet } from './WalletProvider';
import { 
  Shield, 
  FileText, 
  Users, 
  Award, 
  Target,
  Coins,
  Bot,
  Code,
  TrendingUp,
  Activity,
  Link,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface DashboardProps {
  currentRole: string;
}

export default function Dashboard({ currentRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { walletType, isEVMConnected, isIOTAConnected } = useWallet();

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'client':
        return 'Submit security incidents and track their resolution progress';
      case 'analyst':
        return 'Analyze security incidents and provide detailed reports';
      case 'certifier':
        return 'Validate and certify security analysis reports';
      default:
        return 'Welcome to the decentralized security operations center';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'from-blue-500 to-cyan-500';
      case 'analyst': return 'from-green-500 to-emerald-500';
      case 'certifier': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const isWalletConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header 
        onRoleChange={(role: string) => {}} 
        currentRole={currentRole}
      />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Security Operations Center</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Decentralized security incident management powered by blockchain technology. 
            Submit, analyze, and validate security incidents in a trustless environment.
          </p>
        </div>

        {!isWalletConnected && (
          <Card className="bg-amber-900/20 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-400 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-4">
                Please connect your {walletType === 'iota' ? 'IOTA' : 'MetaMask'} wallet to access all features of the dSOC platform
              </p>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {walletType.toUpperCase()} Network Selected
              </Badge>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Cases</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="staking" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Staking</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Role Status Card */}
            <Card className={`bg-gradient-to-r ${getRoleColor(currentRole)} p-1 rounded-lg`}>
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-full">
                      {currentRole === 'client' && <FileText className="h-6 w-6 text-white" />}
                      {currentRole === 'analyst' && <Shield className="h-6 w-6 text-white" />}
                      {currentRole === 'certifier' && <Award className="h-6 w-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white capitalize">{currentRole} Dashboard</h3>
                      <p className="text-gray-300">{getRoleDescription(currentRole)}</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Active Role
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => setActiveTab("report")}>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Submit Incident Report</h3>
                  <p className="text-gray-400 text-sm">Report security incidents and get analysis</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-blue-500/30 hover:border-blue-500/50 transition-colors cursor-pointer"
                    onClick={() => setActiveTab("tickets")}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Manage Cases</h3>
                  <p className="text-gray-400 text-sm">View and manage security cases</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-green-500/30 hover:border-green-500/50 transition-colors cursor-pointer"
                    onClick={() => setActiveTab("staking")}>
                <CardContent className="p-6 text-center">
                  <Coins className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Staking Rewards</h3>
                  <p className="text-gray-400 text-sm">Stake tokens and earn rewards</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Cases</p>
                      <p className="text-2xl font-bold text-white">156</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Analysts</p>
                      <p className="text-2xl font-bold text-white">42</p>
                    </div>
                    <Users className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Resolved Cases</p>
                      <p className="text-2xl font-bold text-white">89</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Staked</p>
                      <p className="text-2xl font-bold text-white">2.4M CLT</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Submit New Case</CardTitle>
                  <CardDescription className="text-gray-400">
                    Create a new security incident case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketForm />
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Case Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    View and manage existing cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketList />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Incident Reporting</CardTitle>
                <CardDescription className="text-gray-400">
                  Submit detailed security incident reports for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentReport onClose={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staking" className="space-y-6">
            {isWalletConnected ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    EVM Cross-Chain Staking
                  </h3>
                  <EVMStakingRewards />
                </div>
                
                {walletType === 'iota' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      IOTA Native Staking
                    </h3>
                    <StakingRewards />
                  </div>
                )}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-amber-500/30">
                <CardContent className="p-12 text-center">
                  <Lock className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-amber-400 mb-2">Wallet Connection Required</h3>
                  <p className="text-gray-400">Connect your wallet to access staking features</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <SmartContractAudit />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}