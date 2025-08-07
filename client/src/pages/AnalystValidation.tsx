import { useState, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Shield, AlertTriangle, Hash, Coins, Upload, Send } from "lucide-react";

export default function AnalystValidation() {
  const [ticketId, setTicketId] = useState("");
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [reportText, setReportText] = useState("");
  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  const fetchTicketDetails = async (id: string) => {
    if (!id || !isEVMConnected) return;
    
    setLoading(true);
    try {
      const ticket = await evmContractService.getTicket(parseInt(id));
      setTicketDetails(ticket);
      
      // Also try to get details from our API
      try {
        const response = await fetch(`/api/incident-reports/${id}`);
        if (response.ok) {
          const apiData = await response.json();
          setTicketDetails((prev: any) => ({ ...prev, ...apiData }));
        }
      } catch (error) {
        console.log('API data not available for this ticket ID');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket details. Please check the ticket ID.",
        variant: "destructive",
      });
      setTicketDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAnalyst = async () => {
    if (!ticketId || !evmAddress) return;
    
    setAssigning(true);
    try {
      // First check if this is a client-created ticket that needs analyst assignment
      if (ticketDetails?.client === evmAddress) {
        // If the current user is the client, they can assign themselves as analyst
        toast({
          title: "Assigning Analyst",
          description: "Please confirm the transaction to assign yourself as the analyst.",
        });
        
        await evmContractService.setAnalyst(ticketId, evmAddress);
        
        toast({
          title: "Analyst Assigned Successfully",
          description: "You are now assigned as the analyst for this ticket.",
        });
        
        // Refresh ticket details
        await fetchTicketDetails(ticketId);
      } else {
        toast({
          title: "Assignment Not Allowed",
          description: "Only the ticket client can assign an analyst.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error assigning analyst:', error);
      let errorMessage = "Failed to assign analyst.";
      
      if (error.message.includes('user rejected')) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message.includes('Only client can assign analyst')) {
        errorMessage = "Only the ticket client can assign an analyst.";
      }
      
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleValidateTicket = async () => {
    if (!ticketId || !evmAddress || !reportText.trim()) return;
    
    setValidating(true);
    try {
      // First submit the analysis report to our API if we have the incident report
      if (ticketDetails?.id) {
        try {
          await fetch(`/api/incident-reports/${ticketDetails.id}/submit-report`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              analyst_address: evmAddress,
              analysis_report: reportText,
              status: 'analyzed'
            }),
          });
        } catch (error) {
          console.log('API report submission not available for this ticket');
        }
      }

      toast({
        title: "Validating Ticket",
        description: "Please confirm the transaction to validate the ticket and claim your reward.",
      });

      const txResult = await evmContractService.validateTicket(ticketId);
      
      toast({
        title: "Ticket Validated Successfully! 🎉",
        description: `Transaction: ${txResult.txHash.slice(0, 8)}... You earned 100 CLT tokens!`,
      });

      // Clear the form
      setReportText("");
      
      // Refresh ticket details
      await fetchTicketDetails(ticketId);
      
    } catch (error: any) {
      console.error('Error validating ticket:', error);
      let errorMessage = "Failed to validate ticket.";
      
      if (error.message.includes('user rejected')) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message.includes('Only analyst can validate')) {
        errorMessage = "Only the assigned analyst can validate this ticket.";
      } else if (error.message.includes('Ticket already validated')) {
        errorMessage = "This ticket has already been validated.";
      }
      
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  const isAnalystAssigned = ticketDetails?.analyst && ticketDetails.analyst !== "0x0000000000000000000000000000000000000000";
  const isCurrentUserAnalyst = isAnalystAssigned && ticketDetails?.analyst === evmAddress;
  const isTicketValidated = ticketDetails?.isValidated;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-400 font-mono mb-2">
            ANALYST VALIDATION
          </h1>
          <p className="text-gray-400 font-mono">
            Assign yourself as analyst and validate completed security analysis tickets
          </p>
        </div>

        {!isEVMConnected && (
          <Card className="bg-red-900/20 border-red-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-mono font-bold">WALLET REQUIRED</h3>
                  <p className="text-gray-400 font-mono">Please connect your EVM wallet to continue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEVMConnected && (
          <>
            <Card className="bg-gray-900/50 border-red-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                  <Hash className="h-5 w-5" />
                  TICKET LOOKUP
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono">
                  Enter the ticket ID you want to validate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="ticketId" className="text-red-400 font-mono">TICKET ID</Label>
                    <Input
                      id="ticketId"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      placeholder="Enter ticket ID (e.g., 0, 1, 2...)"
                      className="bg-black/50 border-red-500/30 text-white font-mono"
                    />
                  </div>
                  <div className="pt-6">
                    <Button
                      onClick={() => fetchTicketDetails(ticketId)}
                      disabled={!ticketId || loading}
                      className="bg-red-600 hover:bg-red-700 font-mono"
                    >
                      {loading ? "LOADING..." : "FETCH TICKET"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {ticketDetails && (
              <Card className="bg-gray-900/50 border-red-500/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                    <Shield className="h-5 w-5" />
                    TICKET DETAILS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <span className="text-red-400">ID:</span>
                      <span className="text-white ml-2">{ticketDetails.id}</span>
                    </div>
                    <div>
                      <span className="text-red-400">TITLE:</span>
                      <span className="text-white ml-2">{ticketDetails.title}</span>
                    </div>
                    <div>
                      <span className="text-red-400">CLIENT:</span>
                      <span className="text-white ml-2">{ticketDetails.client}</span>
                    </div>
                    <div>
                      <span className="text-red-400">ANALYST:</span>
                      <span className="text-white ml-2">
                        {isAnalystAssigned ? ticketDetails.analyst : "Not assigned"}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-400">REWARD:</span>
                      <span className="text-white ml-2">{ticketDetails.rewardAmount} CLT</span>
                    </div>
                    <div>
                      <span className="text-red-400">STATUS:</span>
                      <span className={`ml-2 ${isTicketValidated ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isTicketValidated ? "VALIDATED" : "PENDING"}
                      </span>
                    </div>
                  </div>

                  {!isAnalystAssigned && ticketDetails.client === evmAddress && (
                    <div className="mt-6">
                      <Button
                        onClick={handleAssignAnalyst}
                        disabled={assigning}
                        className="w-full bg-blue-600 hover:bg-blue-700 font-mono"
                      >
                        {assigning ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ASSIGNING...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            ASSIGN MYSELF AS ANALYST
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

                  {isCurrentUserAnalyst && !isTicketValidated && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="analysis-report" className="text-red-400 font-mono">
                          ANALYSIS REPORT (Optional)
                        </Label>
                        <Textarea
                          id="analysis-report"
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          rows={4}
                          className="bg-black/50 border-red-500/30 text-white font-mono mt-2"
                          placeholder="Enter your analysis findings and recommendations..."
                        />
                      </div>
                      
                      <Button
                        onClick={handleValidateTicket}
                        disabled={validating}
                        className="w-full bg-green-600 hover:bg-green-700 font-mono"
                      >
                        {validating ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            VALIDATING...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            VALIDATE TICKET & CLAIM 100 CLT
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

                  {isTicketValidated && (
                    <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded p-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-mono font-bold">TICKET VALIDATED SUCCESSFULLY</span>
                      </div>
                      <p className="text-gray-400 font-mono mt-1">
                        This ticket has been completed and the analyst has claimed their reward.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}