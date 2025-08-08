
import React, { useState, useEffect } from 'react';
import { WalletGate } from '../components/wallet/WalletGate';
import { AppLayout } from '../components/layout/AppLayout';
import { useWallet } from '../components/WalletProvider';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye, 
  FileText,
  Coins,
  Brain,
  Search,
  Filter,
  Award,
  Activity,
  Users,
  TrendingUp,
  Hash,
  Download,
  Upload
} from 'lucide-react';

interface IncidentTicket {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'analyzing' | 'completed';
  network: 'ethereum' | 'polygon' | 'iota';
  client_wallet: string;
  evidence_urls: string;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
  assigned_analyst?: string;
  ai_analysis?: string;
  created_at: string;
  estimated_reward?: number;
}

export default function AnalystValidation() {
  const { address, isConnected } = useWallet();
  const [tickets, setTickets] = useState<IncidentTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<IncidentTicket | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    severity: 'all',
    network: 'all',
    status: 'all',
    search: ''
  });

  const [stats, setStats] = useState({
    totalTickets: 0,
    assignedToMe: 0,
    completedCases: 0,
    cltEarned: 0,
    averageRating: 4.8
  });

  useEffect(() => {
    if (isConnected && address) {
      loadIncidentTickets();
      loadAnalystStats();
    }
  }, [isConnected, address]);

  const loadIncidentTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const loadAnalystStats = async () => {
    // Mock stats for demonstration
    setStats({
      totalTickets: 45,
      assignedToMe: 8,
      completedCases: 23,
      cltEarned: 1250,
      averageRating: 4.8
    });
  };

  const handleClaimTicket = async (ticketId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/incident-reports/${ticketId}/assign-analyst`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst_address: address
        })
      });

      if (response.ok) {
        setNotification('✅ Ticket claimed successfully! You can now begin analysis.');
        loadIncidentTickets();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification('❌ Failed to claim ticket. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async (description: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-vulnerability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.response);
      }
    } catch (error) {
      setNotification('❌ AI analysis failed. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitAnalysis = async () => {
    if (!selectedTicket) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/incident-reports/${selectedTicket.id}/submit-report`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst_address: address,
          analysis_report: analysisText || aiAnalysis,
          status: 'analyzed'
        })
      });

      if (response.ok) {
        setNotification('✅ Analysis submitted successfully! Awaiting certification.');
        setSelectedTicket(null);
        setAnalysisText('');
        setAiAnalysis('');
        loadIncidentTickets();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification('❌ Failed to submit analysis. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
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
      case 'analyzing': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'assigned': return <Users className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filters.severity !== 'all' && ticket.severity !== filters.severity) return false;
    if (filters.network !== 'all' && ticket.network !== filters.network) return false;
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const myTickets = filteredTickets.filter(ticket => ticket.assigned_analyst === address);
  const availableTickets = filteredTickets.filter(ticket => !ticket.assigned_analyst);

  return (
    <AppLayout>
      <WalletGate
        requiredRole="Analyst"
        roleCopy="Connect your wallet to access the dSOC Analyst Dashboard. Please connect your wallet with analyst role to access incident tickets."
      >
        <div className="text-white p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between"></div>
          <div>
            <h1 className="text-3xl font-bold text-blue-500 flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Security Analyst Portal
            </h1>
            <p className="text-gray-400 mt-2">Analyze incidents, earn rewards, and protect the ecosystem</p>
          </div>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Analyst</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </Badge>
              </div>
            </CardContent>
          </Card>
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
              <CardTitle className="text-sm font-medium text-gray-400">Available Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{availableTickets.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">My Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{myTickets.length}</div>
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
                CLT Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.cltEarned}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                <Award className="h-4 w-4" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats.averageRating}/5.0</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 bg-gray-700 border-gray-600"
                />
              </div>
              
              <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.network} onValueChange={(value) => setFilters(prev => ({ ...prev, network: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="iota">IOTA</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="analyzing">Analyzing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="available" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Available Tickets ({availableTickets.length})
            </TabsTrigger>
            <TabsTrigger value="assigned" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              My Tickets ({myTickets.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Available Tickets */}
          <TabsContent value="available">
            <div className="space-y-4">
              {availableTickets.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Available Tickets</h3>
                    <p className="text-gray-500">All tickets are currently assigned or completed.</p>
                  </CardContent>
                </Card>
              ) : (
                availableTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-lg">{ticket.title}</h3>
                            <Badge className={`${getSeverityColor(ticket.severity)} text-white`}>
                              {ticket.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {ticket.network.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 mb-4 line-clamp-2">{ticket.description.substring(0, 200)}...</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Client</p>
                              <p className="text-white font-mono">{ticket.client_wallet?.slice(0, 8)}...</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Network</p>
                              <p className="text-white capitalize">{ticket.network}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Estimated Reward</p>
                              <p className="text-yellow-500 font-semibold">{ticket.estimated_reward || 150} CLT</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Submitted</p>
                              <p className="text-white">{new Date(ticket.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-gray-600">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-blue-500">{ticket.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                <div>
                                  <h4 className="font-semibold text-white mb-2">Description</h4>
                                  <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                                {ticket.evidence_urls && (
                                  <div>
                                    <h4 className="font-semibold text-white mb-2">Evidence</h4>
                                    <p className="text-gray-300">{ticket.evidence_urls}</p>
                                  </div>
                                )}
                                {ticket.contract_address && (
                                  <div>
                                    <h4 className="font-semibold text-white mb-2">Contract Address</h4>
                                    <p className="text-gray-300 font-mono">{ticket.contract_address}</p>
                                  </div>
                                )}
                                {ticket.transaction_hash && (
                                  <div>
                                    <h4 className="font-semibold text-white mb-2">Transaction Hash</h4>
                                    <p className="text-gray-300 font-mono">{ticket.transaction_hash}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            onClick={() => handleClaimTicket(ticket.id)}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            {loading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Shield className="h-4 w-4 mr-2" />
                            )}
                            Claim Ticket
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Tickets */}
          <TabsContent value="assigned">
            <div className="space-y-4">
              {myTickets.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Assigned Tickets</h3>
                    <p className="text-gray-500">Claim tickets from the available queue to start analyzing.</p>
                  </CardContent>
                </Card>
              ) : (
                myTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-lg">{ticket.title}</h3>
                            <Badge className={`${getSeverityColor(ticket.severity)} text-white`}>
                              {ticket.severity.toUpperCase()}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              <span className="text-sm text-gray-400 capitalize">{ticket.status}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-400 mb-4">{ticket.description.substring(0, 150)}...</p>
                          
                          {ticket.status === 'analyzing' && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>Analysis Progress</span>
                                <span>In Progress</span>
                              </div>
                              <Progress value={60} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-gray-600"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Brain className="h-4 w-4 mr-2" />
                                Analyze
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-blue-500">Security Analysis: {ticket.title}</DialogTitle>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                                {/* Case Details */}
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-white mb-2">Case Information</h4>
                                    <div className="bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Severity:</span>
                                        <Badge className={`${getSeverityColor(ticket.severity)} text-white text-xs`}>
                                          {ticket.severity.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Network:</span>
                                        <span className="text-white capitalize">{ticket.network}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Reward:</span>
                                        <span className="text-yellow-500">{ticket.estimated_reward || 150} CLT</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-white mb-2">Description</h4>
                                    <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
                                      {ticket.description}
                                    </div>
                                  </div>
                                  
                                  {ticket.evidence_urls && (
                                    <div>
                                      <h4 className="font-semibold text-white mb-2">Evidence Files</h4>
                                      <div className="bg-gray-700/50 p-4 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                          <FileText className="h-4 w-4" />
                                          <span>{ticket.evidence_urls}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-white">AI-Powered Analysis</h4>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAIAnalysis(ticket.description)}
                                        disabled={isAnalyzing}
                                        className="border-gray-600"
                                      >
                                        {isAnalyzing ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        ) : (
                                          <Brain className="h-3 w-3 mr-1" />
                                        )}
                                        {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
                                      </Button>
                                    </div>
                                    {aiAnalysis && (
                                      <div className="bg-blue-900/30 p-4 rounded-lg text-sm text-blue-100 max-h-48 overflow-y-auto">
                                        <div className="whitespace-pre-wrap">{aiAnalysis}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Analysis Form */}
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-white mb-2">Your Analysis Report</h4>
                                    <Textarea
                                      placeholder="Provide your detailed security analysis..."
                                      value={analysisText}
                                      onChange={(e) => setAnalysisText(e.target.value)}
                                      rows={12}
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={handleSubmitAnalysis}
                                      disabled={loading || (!analysisText && !aiAnalysis)}
                                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                                    >
                                      {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                      )}
                                      Submit Analysis
                                    </Button>
                                    
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        if (aiAnalysis) setAnalysisText(aiAnalysis);
                                      }}
                                      disabled={!aiAnalysis}
                                      className="border-gray-600"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Use AI Analysis
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-500">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Response Time</span>
                      <span>4.2 hours</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Client Satisfaction</span>
                      <span>4.8/5.0</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Accuracy Score</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-500">Earnings Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{stats.cltEarned}</div>
                      <div className="text-sm text-gray-400">Total CLT Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">54</div>
                      <div className="text-sm text-gray-400">CLT per Hour</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="text-yellow-500">340 CLT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Month</span>
                      <span className="text-yellow-500">295 CLT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Month</span>
                      <span className="text-yellow-500">428 CLT</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-600">
                    <div className="text-lg font-semibold text-white mb-2">Specializations</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Smart Contracts</Badge>
                      <Badge variant="outline">DeFi Security</Badge>
                      <Badge variant="outline">Oracle Analysis</Badge>
                      <Badge variant="outline">Cross-chain</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </WalletGate>
    </AppLayout>
  );
}
