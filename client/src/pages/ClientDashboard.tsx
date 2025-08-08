
import React, { useState, useEffect } from 'react';
import { WalletGate } from '../components/wallet/WalletGate';
import { AppLayout } from '../components/layout/AppLayout';
import { useWallet } from '../components/providers/WalletProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Upload, 
  Eye, 
  TrendingUp,
  FileText,
  Coins,
  Network,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Activity
} from 'lucide-react';

interface Case {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'analyzing' | 'completed' | 'rejected';
  network: 'ethereum' | 'polygon' | 'iota';
  assignedAnalyst?: string;
  stakingAmount?: number;
  estimatedReward?: number;
  submittedAt: string;
  completedAt?: string;
}

export default function ClientDashboard() {
  const { address } = useWallet();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Form states
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as const,
    category: 'vulnerability' as const,
    network: 'ethereum' as const,
    affectedSystems: '',
    evidenceFiles: [] as File[],
    stakingAmount: 100
  });

  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    totalStaked: 0,
    totalRewardsEarned: 0
  });

  useEffect(() => {
    if (address) {
      loadClientCases();
      loadClientStats();
    }
  }, [address]);

  const loadClientCases = async () => {
    try {
      const response = await fetch(`/api/tickets/client/${address}`);
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const loadClientStats = async () => {
    // Mock stats for demonstration
    setStats({
      totalCases: 12,
      activeCases: 5,
      completedCases: 7,
      totalStaked: 850,
      totalRewardsEarned: 340
    });
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, analyze the incident with AI
      const analysisResponse = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: incidentForm.description,
          caseType: incidentForm.category,
          requestType: 'incident_submission'
        })
      });

      if (!analysisResponse.ok) throw new Error('AI analysis failed');
      const analysis = await analysisResponse.json();

      // Create incident report
      const incidentData = {
        title: analysis.title || incidentForm.title,
        description: incidentForm.description,
        severity: analysis.severity || incidentForm.severity,
        category: incidentForm.category,
        network: incidentForm.network,
        client_name: address,
        contact_info: `${incidentForm.network.toUpperCase()} Wallet: ${address}`,
        client_wallet: address,
        affected_systems: incidentForm.affectedSystems,
        evidence_urls: incidentForm.evidenceFiles.map(f => f.name).join(', '),
        contract_address: '0xE87bFbFC9fC93b94756384e07cCa4B1e857bfC94',
        ai_analysis: analysis.technicalDetails,
        estimated_reward: analysis.estimatedReward || 150,
        required_analysts: analysis.requiredAnalysts || 2,
        submissionType: 'client_incident_report',
        blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        staking_amount: incidentForm.stakingAmount
      };

      const response = await fetch('/api/incident-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });

      if (response.ok) {
        setNotification('✅ Security incident submitted successfully to dSOC network!');
        setIncidentForm({
          title: '',
          description: '',
          severity: 'medium',
          category: 'vulnerability',
          network: 'ethereum',
          affectedSystems: '',
          evidenceFiles: [],
          stakingAmount: 100
        });
        loadClientCases();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification('❌ Failed to submit incident. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setIncidentForm(prev => ({ ...prev, evidenceFiles: files }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'analyzing': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <AppLayout>
      <WalletGate
        requiredRole="Client"
        roleCopy="Connect your wallet to access the dSOC Client Portal. Please connect your wallet with client role to submit and track incidents."
      >
        <div className="max-w-7xl mx-auto space-y-6 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3">
                <Shield className="h-8 w-8" />
                Client Security Portal
              </h1>
              <p className="text-gray-400 mt-2">Submit incidents, track cases, and manage security operations</p>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <Alert className={`${notification.includes('✅') ? 'border-green-500' : 'border-red-500'} bg-gray-800/50`}>
              <AlertDescription>{notification}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalCases}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Active Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.activeCases}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.completedCases}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  Total Staked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.totalStaked} CLT</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">ETH Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">0.00 ETH</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="report" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="report" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </TabsTrigger>
              <TabsTrigger value="cases" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                My Cases
              </TabsTrigger>
              <TabsTrigger value="staking" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Staking
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Report Incident Tab */}
            <TabsContent value="report">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Submit Security Incident
                  </CardTitle>
                  <CardDescription>
                    Report security incidents to the dSOC network for analysis and resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitIncident} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Incident Title</Label>
                        <Input
                          placeholder="Brief description of the incident"
                          value={incidentForm.title}
                          onChange={(e) => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Network</Label>
                        <Select 
                          value={incidentForm.network} 
                          onValueChange={(value) => setIncidentForm(prev => ({ ...prev, network: value as any }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="iota">IOTA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Severity Level</Label>
                        <Select 
                          value={incidentForm.severity} 
                          onValueChange={(value) => setIncidentForm(prev => ({ ...prev, severity: value as any }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select 
                          value={incidentForm.category} 
                          onValueChange={(value) => setIncidentForm(prev => ({ ...prev, category: value as any }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vulnerability">Smart Contract Vulnerability</SelectItem>
                            <SelectItem value="breach">Security Breach</SelectItem>
                            <SelectItem value="malware">Malware Detection</SelectItem>
                            <SelectItem value="phishing">Phishing Attack</SelectItem>
                            <SelectItem value="ddos">DDoS Attack</SelectItem>
                            <SelectItem value="insider_threat">Insider Threat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Incident Description</Label>
                      <Textarea
                        placeholder="Provide detailed description of the security incident..."
                        value={incidentForm.description}
                        onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={6}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Affected Systems</Label>
                      <Input
                        placeholder="List affected systems, contracts, or applications"
                        value={incidentForm.affectedSystems}
                        onChange={(e) => setIncidentForm(prev => ({ ...prev, affectedSystems: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Evidence Files</Label>
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="bg-gray-700 border-gray-600"
                        />
                        {incidentForm.evidenceFiles.length > 0 && (
                          <p className="text-sm text-gray-400">
                            {incidentForm.evidenceFiles.length} file(s) selected
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Staking Amount (CLT)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="1000"
                          value={incidentForm.stakingAmount}
                          onChange={(e) => setIncidentForm(prev => ({ ...prev, stakingAmount: parseInt(e.target.value) || 100 }))}
                          className="bg-gray-700 border-gray-600"
                        />
                        <p className="text-xs text-gray-400">Higher stakes prioritize your case</p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Submit Security Incident
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Cases Tab */}
            <TabsContent value="cases">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    My Security Cases
                  </CardTitle>
                  <CardDescription>
                    Track the status and progress of your submitted security incidents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cases.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-400">No cases submitted yet</h3>
                        <p className="text-gray-500 mt-2">Submit your first security incident to get started</p>
                      </div>
                    ) : (
                      cases.map((case_) => (
                        <div key={case_.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-white">{case_.title}</h3>
                                <Badge className={`${getSeverityColor(case_.severity || 'medium')} text-white`}>
                                  {(case_.severity || 'medium').toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-gray-300">
                                  {(case_.network || 'Scroll').toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(case_.status)}
                                  <span className="capitalize">{case_.status.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Submitted {new Date(case_.submittedAt).toLocaleDateString()}</span>
                                </div>
                                {case_.stakingAmount && (
                                  <div className="flex items-center gap-1">
                                    <Coins className="h-4 w-4" />
                                    <span>{case_.stakingAmount} CLT staked</span>
                                  </div>
                                )}
                              </div>
                              {case_.assignedAnalyst && (
                                <div className="mt-2 text-sm text-gray-400">
                                  <Users className="h-4 w-4 inline mr-1" />
                                  Analyst: {case_.assignedAnalyst.slice(0, 8)}...
                                </div>
                              )}
                            </div>
                            <Button variant="outline" size="sm" className="border-gray-600">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                          {case_.status === 'analyzing' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>Analysis Progress</span>
                                <span>65%</span>
                              </div>
                              <Progress value={65} className="h-2" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staking Tab */}
            <TabsContent value="staking">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Staking & Rewards
                  </CardTitle>
                  <CardDescription>
                    Stake CLT tokens to prioritize your cases and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Available Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">1,250 CLT</div>
                        <p className="text-xs text-gray-400 mt-1">Available for staking</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Total Staked</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{stats.totalStaked} CLT</div>
                        <p className="text-xs text-gray-400 mt-1">Across all cases</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Rewards Earned</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.totalRewardsEarned} CLT</div>
                        <p className="text-xs text-gray-400 mt-1">From completed cases</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-500 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Case Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Critical Cases</span>
                          <span>2/12 (17%)</span>
                        </div>
                        <Progress value={17} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>High Priority</span>
                          <span>3/12 (25%)</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Medium Priority</span>
                          <span>5/12 (42%)</span>
                        </div>
                        <Progress value={42} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Low Priority</span>
                          <span>2/12 (16%)</span>
                        </div>
                        <Progress value={16} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-500 flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Network Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Ethereum</span>
                          <span>7/12 (58%)</span>
                        </div>
                        <Progress value={58} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Polygon</span>
                          <span>3/12 (25%)</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>IOTA</span>
                          <span>2/12 (17%)</span>
                        </div>
                        <Progress value={17} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </WalletGate>
    </AppLayout>
  );
}
