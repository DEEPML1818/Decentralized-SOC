import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
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
  Link
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return <FileText className="h-5 w-5" />;
      case 'analyst': return <Shield className="h-5 w-5" />;
      case 'certifier': return <Award className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
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
    <div className="space-y-6">
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

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="staking" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">
                {walletType === 'iota' ? 'IOTA Staking' : 'EVM Staking'}
              </span>
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
            {/* Wallet Connection Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`${walletType === 'iota' && isIOTAConnected ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-800/50 border-gray-600/30'} backdrop-blur-sm`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Link className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-blue-400">IOTA Network</CardTitle>
                        <CardDescription className="text-gray-400">
                          Native blockchain integration
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={isIOTAConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {isIOTAConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <Card className={`${walletType === 'evm' && isEVMConnected ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800/50 border-gray-600/30'} backdrop-blur-sm`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Link className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-green-400">Scroll Testnet</CardTitle>
                        <CardDescription className="text-gray-400">
                          EVM-compatible L2 network
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={isEVMConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {isEVMConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Role Overview */}
            <Card className={`bg-gradient-to-r ${getRoleColor(currentRole)} bg-opacity-10 border-opacity-30`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-gradient-to-r ${getRoleColor(currentRole)} rounded-lg text-white`}>
                      {getRoleIcon(currentRole)}
                    </div>
                    <div>
                      <CardTitle className="text-white capitalize">{currentRole} Dashboard</CardTitle>
                      <CardDescription className="text-gray-300">
                        {getRoleDescription(currentRole)} • Active on {walletType.toUpperCase()} network
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-white/10 text-white border-white/20">
                    {walletType.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <TicketList />
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <IncidentReport />
          </TabsContent>

          <TabsContent value="staking" className="space-y-6">
            {/* Network Info Header */}
            <Card className={`bg-gradient-to-r ${walletType === 'iota' ? 'from-blue-900/20 to-purple-900/20 border-blue-500/30' : 'from-green-900/20 to-blue-900/20 border-green-500/30'} backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link className="h-6 w-6 text-blue-400" />
                    <div>
                      <CardTitle className={walletType === 'iota' ? 'text-blue-400' : 'text-green-400'}>
                        {walletType === 'iota' ? 'IOTA Network' : 'Scroll Sepolia Testnet'}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {walletType === 'iota' 
                          ? 'Native IOTA blockchain staking and rewards'
                          : 'EVM-compatible staking on Scroll L2 network'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${walletType === 'iota' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {walletType.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Render appropriate staking component */}
            {walletType === 'iota' ? <StakingRewards /> : <EVMStakingRewards />}
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