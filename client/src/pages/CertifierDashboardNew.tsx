import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, FileText, Clock, AlertTriangle, Shield, Award } from 'lucide-react';
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
  report_hash?: string;
}

export default function CertifierDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
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

  // Fetch tickets ready for certification
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/tickets'],
    queryFn: () => apiRequest('/api/tickets'),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Join as certifier mutation
  const joinAsCertifierMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      if (!account) throw new Error('Wallet not connected');
      
      const txResult = await evmContractService.joinAsCertifier(ticketId.toString());
      console.log('Joined as certifier:', txResult);
      
      // Update backend
      return apiRequest(`/api/tickets/${ticketId}/assign-certifier`, {
        method: 'POST',
        body: JSON.stringify({ certifier_address: account }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully joined as certifier!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to join as certifier: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Validate ticket mutation
  const validateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, approved }: { ticketId: number; approved: boolean }) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Call smart contract to validate ticket (only if approved)
      if (approved) {
        const txResult = await evmContractService.validateTicket(ticketId.toString());
        console.log('Ticket validated on blockchain:', txResult);
      }
      
      // Update backend
      return apiRequest(`/api/tickets/${ticketId}/validate`, {
        method: 'POST',
        body: JSON.stringify({ 
          approved,
          certifier_address: account,
          validation_notes: validationNotes 
        }),
      });
    },
    onSuccess: (_, { approved }) => {
      toast({
        title: "Validation Complete",
        description: approved 
          ? "Ticket has been approved and rewards distributed!" 
          : "Ticket has been rejected and returned for revision.",
      });
      setSelectedTicket(null);
      setValidationNotes('');
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to validate ticket: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleJoinAsCertifier = (ticket: Ticket) => {
    joinAsCertifierMutation.mutate(ticket.id);
  };

  const handleValidateTicket = (approved: boolean) => {
    if (!selectedTicket) return;
    
    validateTicketMutation.mutate({
      ticketId: selectedTicket.id,
      approved,
    });
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

  const getReadyForCertificationTickets = () => {
    return tickets.filter((ticket: Ticket) => 
      ticket.analyst_address && 
      ticket.report_hash && 
      (!ticket.certifier || ticket.certifier === account) &&
      !ticket.is_validated
    );
  };

  const getMyCertificationTickets = () => {
    return tickets.filter((ticket: Ticket) => 
      ticket.certifier === account
    );
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-6">
                Please connect your EVM wallet to access the Certifier Dashboard
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-purple-500 hover:bg-purple-600"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Certifier Dashboard</h1>
          <p className="text-purple-300">Review analyst reports and validate security cases</p>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500 text-purple-300">
              <Shield className="h-3 w-3 mr-1" />
              Certifier: {account?.slice(0, 8)}...{account?.slice(-6)}
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-300">
              Ready for Review: {getReadyForCertificationTickets().length}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-300">
              My Reviews: {getMyCertificationTickets().length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ready for Certification */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-500 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ready for Certification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading cases...</p>
                </div>
              ) : getReadyForCertificationTickets().length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No cases ready for certification</p>
                </div>
              ) : (
                getReadyForCertificationTickets().map((ticket: Ticket) => (
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
                          Analyzed: {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        {!ticket.certifier ? (
                          <Button
                            size="sm"
                            onClick={() => handleJoinAsCertifier(ticket)}
                            disabled={joinAsCertifierMutation.isPending}
                            className="bg-purple-500 hover:bg-purple-600 text-xs"
                          >
                            {joinAsCertifierMutation.isPending ? 'Joining...' : 'Join Review'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="bg-blue-500 hover:bg-blue-600 text-xs"
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* My Certifications */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-500 flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {getMyCertificationTickets().length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No certifications yet</p>
                </div>
              ) : (
                getMyCertificationTickets().map((ticket: Ticket) => (
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
                          {ticket.is_validated ? 'Validated' : 'Pending'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-purple-500 hover:bg-purple-600 text-xs"
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

        {/* Certification Review Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Security Certification Review - Case #{selectedTicket?.id}</DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Case Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Case Details</h4>
                      <div className="bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Title:</span>
                          <span className="text-white">{selectedTicket.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Severity:</span>
                          <Badge className={`${getSeverityColor(selectedTicket.severity)} text-white text-xs`}>
                            {selectedTicket.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Client:</span>
                          <span className="text-white text-xs">
                            {selectedTicket.client_name?.slice(0, 8)}...{selectedTicket.client_name?.slice(-6)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Analyst:</span>
                          <span className="text-white text-xs">
                            {selectedTicket.analyst_address?.slice(0, 8)}...{selectedTicket.analyst_address?.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Original Issue Description</h4>
                      <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
                        {selectedTicket.description}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Analyst Security Report</h4>
                      <div className="bg-blue-900/30 p-4 rounded-lg text-sm text-blue-100 max-h-48 overflow-y-auto">
                        {selectedTicket.report_hash ? (
                          <div>
                            <p className="mb-2">✅ Analysis report submitted</p>
                            <p className="text-xs text-blue-300">IPFS Hash: {selectedTicket.report_hash}</p>
                            <div className="mt-3 p-3 bg-gray-800/50 rounded">
                              <p className="text-blue-200">
                                Detailed security analysis has been completed by the assigned analyst. 
                                The report covers vulnerability assessment, risk analysis, and recommended mitigation strategies.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-yellow-300">⏳ Waiting for analyst report...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Certification Actions */}
                {selectedTicket.report_hash && !selectedTicket.is_validated && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Certification Notes</h4>
                      <Textarea
                        placeholder="Add your certification notes and validation comments..."
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        rows={4}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleValidateTicket(true)}
                        disabled={validateTicketMutation.isPending}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        {validateTicketMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Approve & Validate
                      </Button>
                      
                      <Button
                        onClick={() => handleValidateTicket(false)}
                        disabled={validateTicketMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject & Return
                      </Button>
                    </div>
                    
                    <div className="bg-purple-900/30 p-4 rounded-lg">
                      <p className="text-purple-200 text-sm">
                        <strong>💰 Certification Rewards:</strong> Upon approval, you will receive 50 CLT tokens, 
                        the analyst will receive 100 CLT tokens, and stakers will receive rewards from the pool.
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedTicket.is_validated && (
                  <div className="bg-green-900/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-300">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Case Certified and Completed</span>
                    </div>
                    <p className="text-green-200 text-sm mt-2">
                      This security case has been successfully validated and rewards have been distributed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}