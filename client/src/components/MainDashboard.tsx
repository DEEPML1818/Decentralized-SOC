import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useWallet } from "./WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { evmContractService } from "@/lib/evm-contract";
import { useQuery } from "@tanstack/react-query";
import CaseDetailModal from "./CaseDetailModal";
import EVMIncidentReport from "./EVMIncidentReport";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  Coins,
  Activity,
  Eye,
  Plus,
  Wallet,
  Network,
  CheckCircle,
  Clock,
  FileText,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  Layers
} from "lucide-react";

interface Case {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  client_name: string;
  client_wallet: string;
  assigned_analyst?: string;
  created_at: string;
  priority?: string;
  transaction_hash?: string;
  block_number?: number;
  staking_info?: {
    totalStaked: string;
    participants: number;
    rewardPool: string;
    deadline: string;
  };
}

interface StakingPool {
  address: string;
  totalStaked: string;
  participants: number;
  isActive: boolean;
  caseId: number;
}

export default function MainDashboard() {
  const [currentRole, setCurrentRole] = useState("client");
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const { evmAddress, iotaAddress, isEVMConnected, isIOTAConnected, connectEVMWallet, walletType, setWalletType } = useWallet();
  const { toast } = useToast();

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['/api/tickets'],
    refetchInterval: 5000,
  });

  const { data: incidentReports = [] } = useQuery<Case[]>({
    queryKey: ['/api/incident-reports'],
    refetchInterval: 5000,
  });

  // Load staking pools data
  useEffect(() => {
    const loadStakingPools = async () => {
      if (!isEVMConnected) return;
      
      try {
        // Mock staking pools data - replace with actual contract calls
        const mockPools: StakingPool[] = (cases as Case[]).map((caseItem: Case, index: number) => ({
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          totalStaked: (Math.random() * 1000 + 100).toFixed(2),
          participants: Math.floor(Math.random() * 20 + 1),
          isActive: caseItem.status !== 'closed',
          caseId: caseItem.id
        }));
        setStakingPools(mockPools);
      } catch (error) {
        console.error('Error loading staking pools:', error);
      }
    };

    loadStakingPools();
  }, [cases, isEVMConnected]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'analyzed': return 'bg-purple-500/20 text-purple-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'analyst': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'certifier': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredCases = (cases as Case[]).filter((caseItem: Case) => {
    if (currentRole === 'client') {
      return caseItem.client_wallet === evmAddress;
    } else if (currentRole === 'analyst') {
      return !caseItem.assigned_analyst || caseItem.assigned_analyst === evmAddress;
    }
    return true;
  });

  const getStakingInfo = (caseId: number) => {
    return stakingPools.find(pool => pool.caseId === caseId);
  };

  const totalStaked = stakingPools.reduce((sum, pool) => sum + parseFloat(pool.totalStaked), 0);
  const activePools = stakingPools.filter(pool => pool.isActive).length;
  const totalParticipants = stakingPools.reduce((sum, pool) => sum + pool.participants, 0);

  const handleConnectWallet = async () => {
    if (!isEVMConnected) {
      try {
        await connectEVMWallet();
        toast({
          title: "Wallet Connected",
          description: "EVM wallet connected successfully",
        });
      } catch (error: any) {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-red-500/30 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg cyber-pulse">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-red-400 font-mono">dSOC DASHBOARD</h1>
                  <p className="text-xs text-gray-400 font-mono">DECENTRALIZED SECURITY OPERATIONS CENTER</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
              <Card className="bg-gray-900/50 border-red-500/30 p-3">
                <div className="flex items-center space-x-3">
                  <Network className="h-5 w-5 text-red-400" />
                  <div className="text-sm">
                    <div className="text-red-400 font-mono">WALLET STATUS</div>
                    {isEVMConnected ? (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Connected
                        </Badge>
                        <span className="text-gray-300 font-mono text-xs">
                          {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
                        </span>
                      </div>
                    ) : (
                      <Button size="sm" onClick={handleConnectWallet} className="bg-red-600 hover:bg-red-700">
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Role Selector */}
              <Card className="bg-gray-900/50 border-red-500/30 p-3">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-red-400" />
                  <div className="text-sm">
                    <div className="text-red-400 font-mono">ROLE</div>
                    <div className="flex space-x-2">
                      {['client', 'analyst', 'certifier'].map((role) => (
                        <Button
                          key={role}
                          size="sm"
                          variant={currentRole === role ? "default" : "outline"}
                          onClick={() => setCurrentRole(role)}
                          className={`text-xs ${currentRole === role ? 'bg-red-600' : 'border-red-500/30'}`}
                        >
                          {role.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {!isEVMConnected ? (
          <Card className="bg-red-900/20 border-red-500/30 mb-8">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <AlertTriangle className="h-16 w-16 text-red-400" />
                <h2 className="text-2xl font-bold text-red-400 font-mono">WALLET REQUIRED</h2>
                <p className="text-gray-400 font-mono">Connect your EVM wallet to access the dSOC platform</p>
                <Button onClick={handleConnectWallet} className="bg-red-600 hover:bg-red-700 font-mono">
                  <Wallet className="h-5 w-5 mr-2" />
                  CONNECT WALLET
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900/50 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-400 font-mono text-sm flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    TOTAL CASES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{(cases as Case[]).length}</div>
                  <p className="text-gray-400 text-sm">Active incidents</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400 font-mono text-sm flex items-center">
                    <Coins className="h-4 w-4 mr-2" />
                    TOTAL STAKED
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{totalStaked.toFixed(2)}</div>
                  <p className="text-gray-400 text-sm">CLT tokens</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400 font-mono text-sm flex items-center">
                    <Layers className="h-4 w-4 mr-2" />
                    ACTIVE POOLS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{activePools}</div>
                  <p className="text-gray-400 text-sm">Staking pools</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400 font-mono text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    PARTICIPANTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{totalParticipants}</div>
                  <p className="text-gray-400 text-sm">Total stakers</p>
                </CardContent>
              </Card>
            </div>

            {/* Role-specific Dashboard */}
            <Tabs value={currentRole} onValueChange={setCurrentRole} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-red-500/30">
                <TabsTrigger value="client" className="data-[state=active]:bg-red-600">
                  <Shield className="h-4 w-4 mr-2" />
                  CLIENT PORTAL
                </TabsTrigger>
                <TabsTrigger value="analyst" className="data-[state=active]:bg-green-600">
                  <Target className="h-4 w-4 mr-2" />
                  ANALYST CENTER
                </TabsTrigger>
                <TabsTrigger value="certifier" className="data-[state=active]:bg-purple-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  CERTIFIER PANEL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-red-400 font-mono">MY SECURITY CASES</h2>
                  <Button onClick={() => setShowIncidentReport(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    REPORT INCIDENT
                  </Button>
                </div>
                
                <div className="grid gap-6">
                  {filteredCases.map((caseItem: Case) => {
                    const stakingInfo = getStakingInfo(caseItem.id);
                    return (
                      <Card key={caseItem.id} className="bg-gray-900/50 border-red-500/30 hover:border-red-500/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getRoleBadgeColor('client')}>
                                #{caseItem.id}
                              </Badge>
                              <h3 className="text-white font-semibold">{caseItem.title}</h3>
                              <Badge className={getSeverityColor(caseItem.severity)}>
                                {caseItem.severity?.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(caseItem.status)}>
                                {caseItem.status?.toUpperCase()}
                              </Badge>
                            </div>
                            <CaseDetailModal caseId={caseItem.id}>
                              <Button variant="outline" size="sm" className="border-red-500/30">
                                <Eye className="h-4 w-4 mr-2" />
                                VIEW DETAILS
                              </Button>
                            </CaseDetailModal>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-300 text-sm">{caseItem.description}</p>
                          
                          {stakingInfo && (
                            <div className="bg-black/30 p-4 rounded border border-green-500/30">
                              <h4 className="text-green-400 font-mono font-semibold mb-3">STAKING POOL INFO</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-green-400 text-sm font-mono">TOTAL STAKED</div>
                                  <div className="text-white font-bold">{stakingInfo.totalStaked} CLT</div>
                                </div>
                                <div>
                                  <div className="text-green-400 text-sm font-mono">PARTICIPANTS</div>
                                  <div className="text-white font-bold">{stakingInfo.participants}</div>
                                </div>
                                <div>
                                  <div className="text-green-400 text-sm font-mono">STATUS</div>
                                  <Badge className={stakingInfo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                    {stakingInfo.isActive ? 'ACTIVE' : 'CLOSED'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="text-green-400 text-sm font-mono mb-1">POOL ADDRESS</div>
                                <div className="text-gray-300 font-mono text-xs bg-black/50 p-2 rounded">
                                  {stakingInfo.address}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="analyst" className="space-y-6">
                <h2 className="text-xl font-bold text-green-400 font-mono">AVAILABLE CASES FOR ANALYSIS</h2>
                
                <div className="grid gap-6">
                  {filteredCases.map((caseItem: Case) => {
                    const stakingInfo = getStakingInfo(caseItem.id);
                    const isAssigned = caseItem.assigned_analyst === evmAddress;
                    return (
                      <Card key={caseItem.id} className="bg-gray-900/50 border-green-500/30 hover:border-green-500/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getRoleBadgeColor('analyst')}>
                                #{caseItem.id}
                              </Badge>
                              <h3 className="text-white font-semibold">{caseItem.title}</h3>
                              <Badge className={getSeverityColor(caseItem.severity)}>
                                {caseItem.severity?.toUpperCase()}
                              </Badge>
                              {isAssigned && (
                                <Badge className="bg-green-500/20 text-green-400">
                                  ASSIGNED TO YOU
                                </Badge>
                              )}
                            </div>
                            <CaseDetailModal caseId={caseItem.id}>
                              <Button variant="outline" size="sm" className="border-green-500/30">
                                <Eye className="h-4 w-4 mr-2" />
                                ANALYZE CASE
                              </Button>
                            </CaseDetailModal>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-300 text-sm">{caseItem.description}</p>
                          
                          {stakingInfo && (
                            <div className="bg-black/30 p-4 rounded border border-green-500/30">
                              <h4 className="text-green-400 font-mono font-semibold mb-3">REWARD POOL</h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <div className="text-green-400 text-sm font-mono">REWARD AMOUNT</div>
                                  <div className="text-white font-bold">100 CLT</div>
                                </div>
                                <div>
                                  <div className="text-green-400 text-sm font-mono">POOL STAKE</div>
                                  <div className="text-white font-bold">{stakingInfo.totalStaked} CLT</div>
                                </div>
                                <div>
                                  <div className="text-green-400 text-sm font-mono">STAKERS</div>
                                  <div className="text-white font-bold">{stakingInfo.participants}</div>
                                </div>
                                <div>
                                  <div className="text-green-400 text-sm font-mono">DIFFICULTY</div>
                                  <div className="text-white font-bold">
                                    {caseItem.severity === 'critical' ? 'HIGH' : 
                                     caseItem.severity === 'high' ? 'MED' : 'LOW'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="certifier" className="space-y-6">
                <h2 className="text-xl font-bold text-purple-400 font-mono">CASES AWAITING CERTIFICATION</h2>
                
                <div className="grid gap-6">
                  {(cases as Case[]).filter((c: Case) => c.status === 'analyzed').map((caseItem: Case) => {
                    const stakingInfo = getStakingInfo(caseItem.id);
                    return (
                      <Card key={caseItem.id} className="bg-gray-900/50 border-purple-500/30 hover:border-purple-500/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getRoleBadgeColor('certifier')}>
                                #{caseItem.id}
                              </Badge>
                              <h3 className="text-white font-semibold">{caseItem.title}</h3>
                              <Badge className="bg-purple-500/20 text-purple-400">
                                READY FOR CERTIFICATION
                              </Badge>
                            </div>
                            <CaseDetailModal caseId={caseItem.id}>
                              <Button variant="outline" size="sm" className="border-purple-500/30">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                CERTIFY
                              </Button>
                            </CaseDetailModal>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-300 text-sm">{caseItem.description}</p>
                          
                          {stakingInfo && (
                            <div className="bg-black/30 p-4 rounded border border-purple-500/30">
                              <h4 className="text-purple-400 font-mono font-semibold mb-3">CERTIFICATION REWARD</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-purple-400 text-sm font-mono">CERTIFIER REWARD</div>
                                  <div className="text-white font-bold">30 CLT</div>
                                </div>
                                <div>
                                  <div className="text-purple-400 text-sm font-mono">ANALYST</div>
                                  <div className="text-white font-mono text-xs">
                                    {caseItem.assigned_analyst?.slice(0, 8)}...
                                  </div>
                                </div>
                                <div>
                                  <div className="text-purple-400 text-sm font-mono">COMPLEXITY</div>
                                  <Badge className={getSeverityColor(caseItem.severity)}>
                                    {caseItem.severity?.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Incident Report Modal */}
      {showIncidentReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500/30 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-red-400 font-mono">REPORT SECURITY INCIDENT</h2>
              <button 
                onClick={() => setShowIncidentReport(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <EVMIncidentReport onClose={() => setShowIncidentReport(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}