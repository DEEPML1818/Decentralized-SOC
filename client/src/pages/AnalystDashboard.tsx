import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Brain, Upload, Download, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { evmContractService } from '@/lib/evm-contract';
import { apiRequest } from '@/lib/queryClient';

interface Ticket {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  client_name: string;
  analyst_address: string | null;
  certifier: string | null;
  reward_amount: string;
  staking_pool: string;
  is_validated: boolean;
  created_at: string;
}

export default function AnalystDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  // Get connected wallet address
  useEffect(() => {
    const checkWallet = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    };
    checkWallet();
  }, []);

  // Fetch available tickets for analysts
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/tickets'],
    queryFn: () => apiRequest('/api/tickets'),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Join as analyst mutation
  const joinAsAnalystMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      if (!account) throw new Error('Wallet not connected');
      
      const txResult = await evmContractService.joinAsAnalyst(ticketId.toString());
      console.log('Joined as analyst:', txResult);
      
      // Update backend
      return apiRequest(`/api/tickets/${ticketId}/assign-analyst`, {
        method: 'POST',
        body: JSON.stringify({ analyst_address: account }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully joined as analyst!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to join as analyst: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Submit analysis mutation
  const submitAnalysisMutation = useMutation({
    mutationFn: async ({ ticketId, analysis }: { ticketId: number; analysis: string }) => {
      return apiRequest(`/api/tickets/${ticketId}/submit-report`, {
        method: 'POST',
        body: JSON.stringify({ 
          report: analysis,
          analyst_address: account 
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Submitted",
        description: "Your security analysis has been submitted successfully!",
      });
      setSelectedTicket(null);
      setAnalysisText('');
      setAiAnalysis('');
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to submit analysis: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleJoinAsAnalyst = (ticket: Ticket) => {
    joinAsAnalystMutation.mutate(ticket.id);
  };

  const handleSubmitAnalysis = () => {
    if (!selectedTicket || (!analysisText && !aiAnalysis)) return;
    
    const finalAnalysis = analysisText || aiAnalysis;
    submitAnalysisMutation.mutate({
      ticketId: selectedTicket.id,
      analysis: finalAnalysis,
    });
  };

  const handleAIAnalysis = async (description: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-vulnerability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      
      if (!response.ok) throw new Error('AI analysis failed');
      
      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Unable to generate AI analysis. Please provide manual analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailableTickets = () => {
    return tickets.filter((ticket: Ticket) => 
      !ticket.analyst_address || ticket.analyst_address === account
    );
  };

  const getMyTickets = () => {
    return tickets.filter((ticket: Ticket) => 
      ticket.analyst_address === account
    );
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-6">
                Please connect your EVM wallet to access the Analyst Dashboard
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analyst Dashboard</h1>
          <p className="text-blue-300">Manage security analysis cases and earn CLT rewards</p>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="border-blue-500 text-blue-300">
              Analyst: {account?.slice(0, 8)}...{account?.slice(-6)}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-300">
              Available Cases: {getAvailableTickets().length}
            </Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-300">
              My Cases: {getMyTickets().length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Cases */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-500">Available Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading cases...</p>
                </div>
              ) : getAvailableTickets().length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No available cases</p>
                </div>
              ) : (
                getAvailableTickets().map((ticket: Ticket) => (
                  <Card key={ticket.id} className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white text-sm">{ticket.title}</h3>
                        <Badge className={`${getSeverityColor(ticket.severity)} text-white text-xs`}>
                          {ticket.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        {!ticket.analyst_address ? (
                          <Button
                            size="sm"
                            onClick={() => handleJoinAsAnalyst(ticket)}
                            disabled={joinAsAnalystMutation.isPending}
                            className="bg-blue-500 hover:bg-blue-600 text-xs"
                          >
                            {joinAsAnalystMutation.isPending ? 'Joining...' : 'Join Case'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="bg-green-500 hover:bg-green-600 text-xs"
                          >
                            Analyze
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* My Active Cases */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-500">My Active Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {getMyTickets().length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No active cases</p>
                </div>
              ) : (
                getMyTickets().map((ticket: Ticket) => (
                  <Card key={ticket.id} className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white text-sm">{ticket.title}</h3>
                        <Badge className={`${getSeverityColor(ticket.severity)} text-white text-xs`}>
                          {ticket.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${ticket.is_validated ? 'border-green-500 text-green-300' : 'border-yellow-500 text-yellow-300'}`}
                        >
                          {ticket.is_validated ? 'Completed' : 'In Progress'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-blue-500 hover:bg-blue-600 text-xs"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Security Analysis - Case #{selectedTicket?.id}</DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Case Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Case Information</h4>
                      <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Title:</span>
                          <span className="text-white">{selectedTicket.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Severity:</span>
                          <Badge className={`${getSeverityColor(selectedTicket.severity)} text-white`}>
                            {selectedTicket.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Client:</span>
                          <span className="text-white text-sm">
                            {selectedTicket.client_name?.slice(0, 8)}...{selectedTicket.client_name?.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Description</h4>
                      <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
                        {selectedTicket.description}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">AI-Powered Analysis</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAIAnalysis(selectedTicket.description)}
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
                        disabled={submitAnalysisMutation.isPending || (!analysisText && !aiAnalysis)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        {submitAnalysisMutation.isPending ? (
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}