
import { useState, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Shield, AlertTriangle, Star, Users, UserCheck, Eye, ThumbsUp } from "lucide-react";

export default function ClientDashboard() {
  const [clientTickets, setClientTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [shortlistedAnalysts, setShortlistedAnalysts] = useState<any[]>([]);
  const [assigningAnalyst, setAssigningAnalyst] = useState(false);
  const [loading, setLoading] = useState(true);

  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (isEVMConnected && evmAddress) {
      loadClientTickets();
    }
  }, [isEVMConnected, evmAddress]);

  const loadClientTickets = async () => {
    if (!evmAddress) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/client/${evmAddress}`);
      if (response.ok) {
        const tickets = await response.json();
        setClientTickets(tickets);
      }
    } catch (error) {
      console.error('Error loading client tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShortlistedAnalysts = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/shortlisted`);
      if (response.ok) {
        const shortlisted = await response.json();
        setShortlistedAnalysts(shortlisted);
      }
    } catch (error) {
      console.error('Error loading shortlisted analysts:', error);
    }
  };

  const viewTicketDetails = async (ticket: any) => {
    setSelectedTicket(ticket);
    await loadShortlistedAnalysts(ticket.id.toString());
  };

  const selectAnalyst = async (analystAddress: string) => {
    if (!selectedTicket) return;
    
    setAssigningAnalyst(true);
    try {
      // Call smart contract to assign analyst
      toast({
        title: "Assigning Analyst",
        description: "Please confirm the transaction to assign the selected analyst.",
      });

      await evmContractService.setAnalyst(selectedTicket.id.toString(), analystAddress);

      // Update our API
      const response = await fetch(`/api/tickets/${selectedTicket.id}/assign-analyst`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyst_address: analystAddress,
          assigned_by: evmAddress,
          assigned_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update analyst assignment in database');
      }

      toast({
        title: "Analyst Assigned Successfully! 🎯",
        description: "The selected analyst has been assigned to your ticket.",
      });

      // Refresh tickets
      await loadClientTickets();
      if (selectedTicket) {
        const updatedTicket = { ...selectedTicket, assigned_analyst: analystAddress };
        setSelectedTicket(updatedTicket);
      }

    } catch (error: any) {
      console.error('Error assigning analyst:', error);
      let errorMessage = "Failed to assign analyst.";
      
      if (error.message.includes('user rejected')) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message.includes('Analyst already assigned')) {
        errorMessage = "An analyst has already been assigned to this ticket.";
      }
      
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAssigningAnalyst(false);
    }
  };

  if (!isEVMConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-mono font-bold">WALLET REQUIRED</h3>
                  <p className="text-gray-400 font-mono">Please connect your EVM wallet to access client features</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">
            CLIENT DASHBOARD
          </h1>
          <p className="text-gray-400 font-mono">
            Select qualified analysts from certified shortlists for your security tickets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Tickets List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2 font-mono">
                  <Shield className="h-5 w-5" />
                  YOUR TICKETS
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 font-mono mt-2">Loading...</p>
                  </div>
                ) : clientTickets.length === 0 ? (
                  <p className="text-gray-400 font-mono text-center py-4">No tickets found</p>
                ) : (
                  <div className="space-y-3">
                    {clientTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-green-900/30 border-green-400'
                            : 'bg-gray-800/50 border-gray-600 hover:border-green-500'
                        }`}
                        onClick={() => viewTicketDetails(ticket)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-mono text-sm">#{ticket.id}</span>
                          <div className="flex gap-1">
                            {ticket.assigned_analyst ? (
                              <Badge className="bg-green-600 text-xs">
                                <UserCheck className="h-3 w-3 mr-1" />
                                ASSIGNED
                              </Badge>
                            ) : ticket.shortlistCount > 0 ? (
                              <Badge className="bg-yellow-600 text-xs">
                                {ticket.shortlistCount} shortlisted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm font-mono truncate">
                          {ticket.title}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Reward: {ticket.reward_amount || '100'} CLT
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analyst Selection */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="bg-gray-900/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2 font-mono">
                    <Users className="h-5 w-5" />
                    SELECT ANALYST - TICKET #{selectedTicket.id}
                  </CardTitle>
                  <CardDescription className="text-gray-300 font-mono">
                    {selectedTicket.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTicket.assigned_analyst ? (
                    <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-mono font-bold">ANALYST ASSIGNED</span>
                      </div>
                      <p className="text-gray-300 font-mono mt-2">
                        Assigned Analyst: {selectedTicket.assigned_analyst.slice(0, 8)}...{selectedTicket.assigned_analyst.slice(-6)}
                      </p>
                      <p className="text-gray-400 font-mono text-sm mt-1">
                        The analyst can now begin working on your security analysis.
                      </p>
                    </div>
                  ) : shortlistedAnalysts.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-gray-400 font-mono text-center">
                        No analysts have been shortlisted yet. Please wait for certifiers to review submissions.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-bold">
                          SHORTLISTED ANALYSTS ({shortlistedAnalysts.length})
                        </span>
                      </div>
                      
                      {shortlistedAnalysts.map((analyst, index) => (
                        <div key={index} className="bg-gray-800/50 border border-gray-600 rounded p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-blue-400 font-mono text-sm">
                                {analyst.address.slice(0, 8)}...{analyst.address.slice(-6)}
                              </span>
                              <div className="text-xs text-gray-400 mt-1">
                                Shortlisted by certified reviewer
                              </div>
                            </div>
                            <Badge className="bg-green-600">
                              <Star className="h-3 w-3 mr-1" />
                              VERIFIED
                            </Badge>
                          </div>
                          
                          {analyst.profile && (
                            <div className="bg-black/30 rounded p-3 mb-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">Name:</span>
                                  <span className="text-white ml-2">{analyst.profile.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Expertise:</span>
                                  <span className="text-white ml-2">{analyst.profile.expertise}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Experience:</span>
                                  <span className="text-white ml-2">{analyst.profile.experience}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={() => selectAnalyst(analyst.address)}
                              disabled={assigningAnalyst}
                              className="bg-green-600 hover:bg-green-700 font-mono"
                            >
                              {assigningAnalyst ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ASSIGNING...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <ThumbsUp className="h-4 w-4" />
                                  SELECT THIS ANALYST
                                </div>
                              )}
                            </Button>
                            
                            {analyst.analysis_preview && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-mono"
                                onClick={() => {
                                  // Show analysis preview modal
                                  toast({
                                    title: "Analysis Preview",
                                    description: analyst.analysis_preview.substring(0, 100) + "...",
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                PREVIEW ANALYSIS
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/50 border-green-500/30">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-mono">
                    Select a ticket from the list to view shortlisted analysts and make your selection
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
