
import { useState, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Shield, AlertTriangle, Hash, Coins, Upload, Send, Users, Star } from "lucide-react";

export default function AnalystValidation() {
  const [ticketId, setTicketId] = useState("");
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submittingAnalysis, setSubmittingAnalysis] = useState(false);
  const [validating, setValidating] = useState(false);
  const [registeringAnalyst, setRegisteringAnalyst] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [analystProfile, setAnalystProfile] = useState({
    name: "",
    expertise: "",
    experience: "",
    certifications: ""
  });
  const [submittedAnalyses, setSubmittedAnalyses] = useState<any[]>([]);
  const [shortlistedAnalysts, setShortlistedAnalysts] = useState<any[]>([]);
  const [isRegisteredAnalyst, setIsRegisteredAnalyst] = useState(false);
  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    checkAnalystRegistration();
  }, [evmAddress]);

  const checkAnalystRegistration = async () => {
    if (!evmAddress) return;
    
    try {
      const response = await fetch(`/api/analysts/${evmAddress}`);
      if (response.ok) {
        const analystData = await response.json();
        setIsRegisteredAnalyst(true);
        setAnalystProfile(analystData);
      }
    } catch (error) {
      console.log('Analyst not registered yet');
    }
  };

  const registerAsAnalyst = async () => {
    if (!evmAddress || !analystProfile.name.trim()) return;
    
    setRegisteringAnalyst(true);
    try {
      // Store analyst profile in IPFS
      const ipfsResponse = await fetch('/api/ipfs/store-analyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: evmAddress,
          profile: analystProfile,
          registrationDate: new Date().toISOString()
        }),
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to store analyst profile in IPFS');
      }

      const ipfsData = await ipfsResponse.json();

      // Register analyst in our database
      const registerResponse = await fetch('/api/analysts/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: evmAddress,
          ...analystProfile,
          ipfsHash: ipfsData.hash
        }),
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register analyst');
      }

      setIsRegisteredAnalyst(true);
      toast({
        title: "Analyst Registration Successful",
        description: "Your profile has been stored in IPFS and registered.",
      });

    } catch (error: any) {
      console.error('Error registering analyst:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register as analyst",
        variant: "destructive",
      });
    } finally {
      setRegisteringAnalyst(false);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    if (!id || !isEVMConnected) return;
    
    setLoading(true);
    try {
      const ticket = await evmContractService.getTicket(parseInt(id));
      setTicketDetails(ticket);
      
      // Fetch submitted analyses and shortlisted analysts
      await Promise.all([
        fetchSubmittedAnalyses(id),
        fetchShortlistedAnalysts(id)
      ]);
      
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

  const fetchSubmittedAnalyses = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/analyses`);
      if (response.ok) {
        const analyses = await response.json();
        setSubmittedAnalyses(analyses);
      }
    } catch (error) {
      console.log('No analyses submitted yet');
    }
  };

  const fetchShortlistedAnalysts = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/shortlisted`);
      if (response.ok) {
        const shortlisted = await response.json();
        setShortlistedAnalysts(shortlisted);
      }
    } catch (error) {
      console.log('No shortlisted analysts yet');
    }
  };

  const submitAnalysis = async () => {
    if (!ticketId || !evmAddress || !analysisText.trim() || !isRegisteredAnalyst) return;
    
    setSubmittingAnalysis(true);
    try {
      // Store analysis in IPFS
      const ipfsResponse = await fetch('/api/ipfs/store-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          analystAddress: evmAddress,
          analysis: analysisText,
          submittedAt: new Date().toISOString(),
          analystProfile: analystProfile
        }),
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to store analysis in IPFS');
      }

      const ipfsData = await ipfsResponse.json();

      // Submit analysis to our API
      const submitResponse = await fetch(`/api/tickets/${ticketId}/submit-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyst_address: evmAddress,
          analysis_text: analysisText,
          ipfs_hash: ipfsData.hash,
          status: 'submitted'
        }),
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit analysis');
      }

      toast({
        title: "Analysis Submitted Successfully! 📋",
        description: "Your analysis has been stored in IPFS and submitted for review.",
      });

      // Clear the form and refresh data
      setAnalysisText("");
      await fetchSubmittedAnalyses(ticketId);
      
    } catch (error: any) {
      console.error('Error submitting analysis:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit analysis",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnalysis(false);
    }
  };

  const validateTicket = async () => {
    if (!ticketId || !evmAddress) return;
    
    setValidating(true);
    try {
      toast({
        title: "Validating Ticket",
        description: "Please confirm the transaction to validate the ticket and claim your reward.",
      });

      const txResult = await evmContractService.validateTicket(ticketId);
      
      toast({
        title: "Ticket Validated Successfully! 🎉",
        description: `Transaction: ${txResult.txHash.slice(0, 8)}... You earned 100 CLT tokens!`,
      });

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
  const userHasSubmittedAnalysis = submittedAnalyses.some(analysis => analysis.analyst_address === evmAddress);
  const isUserShortlisted = shortlistedAnalysts.some(analyst => analyst.address === evmAddress);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-400 font-mono mb-2">
            ANALYST VALIDATION CENTER
          </h1>
          <p className="text-gray-400 font-mono">
            Submit analysis, get shortlisted by certifiers, and validate completed tickets
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
            {/* Analyst Registration Section */}
            {!isRegisteredAnalyst && (
              <Card className="bg-blue-900/20 border-blue-500/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2 font-mono">
                    <Users className="h-5 w-5" />
                    ANALYST REGISTRATION
                  </CardTitle>
                  <CardDescription className="text-gray-400 font-mono">
                    Register your profile to submit analysis reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-blue-400 font-mono">NAME</Label>
                      <Input
                        id="name"
                        value={analystProfile.name}
                        onChange={(e) => setAnalystProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        className="bg-black/50 border-blue-500/30 text-white font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expertise" className="text-blue-400 font-mono">EXPERTISE</Label>
                      <Input
                        id="expertise"
                        value={analystProfile.expertise}
                        onChange={(e) => setAnalystProfile(prev => ({ ...prev, expertise: e.target.value }))}
                        placeholder="Smart Contracts, DeFi, etc."
                        className="bg-black/50 border-blue-500/30 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-blue-400 font-mono">EXPERIENCE</Label>
                    <Input
                      id="experience"
                      value={analystProfile.experience}
                      onChange={(e) => setAnalystProfile(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Years of experience in cybersecurity"
                      className="bg-black/50 border-blue-500/30 text-white font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certifications" className="text-blue-400 font-mono">CERTIFICATIONS</Label>
                    <Textarea
                      id="certifications"
                      value={analystProfile.certifications}
                      onChange={(e) => setAnalystProfile(prev => ({ ...prev, certifications: e.target.value }))}
                      rows={3}
                      className="bg-black/50 border-blue-500/30 text-white font-mono"
                      placeholder="List your relevant certifications..."
                    />
                  </div>
                  <Button
                    onClick={registerAsAnalyst}
                    disabled={registeringAnalyst || !analystProfile.name.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 font-mono"
                  >
                    {registeringAnalyst ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        REGISTERING...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        REGISTER AS ANALYST
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ticket Lookup Section */}
            <Card className="bg-gray-900/50 border-red-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                  <Hash className="h-5 w-5" />
                  TICKET LOOKUP
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono">
                  Enter the ticket ID to submit analysis or validate
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
              <>
                {/* Ticket Details */}
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
                        <span className="text-red-400">ASSIGNED ANALYST:</span>
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

                    {/* Analysis Submission Section */}
                    {isRegisteredAnalyst && !isTicketValidated && !isAnalystAssigned && !userHasSubmittedAnalysis && (
                      <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                        <h3 className="text-yellow-400 font-mono font-bold">SUBMIT YOUR ANALYSIS</h3>
                        <div>
                          <Label htmlFor="analysis" className="text-yellow-400 font-mono">
                            SECURITY ANALYSIS REPORT
                          </Label>
                          <Textarea
                            id="analysis"
                            value={analysisText}
                            onChange={(e) => setAnalysisText(e.target.value)}
                            rows={6}
                            className="bg-black/50 border-yellow-500/30 text-white font-mono mt-2"
                            placeholder="Enter your detailed security analysis, findings, and recommendations..."
                          />
                        </div>
                        
                        <Button
                          onClick={submitAnalysis}
                          disabled={submittingAnalysis || !analysisText.trim()}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 font-mono"
                        >
                          {submittingAnalysis ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              SUBMITTING TO IPFS...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              SUBMIT ANALYSIS FOR REVIEW
                            </div>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Analysis Status */}
                    {userHasSubmittedAnalysis && (
                      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded p-4">
                        <div className="flex items-center gap-2 text-blue-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-mono font-bold">ANALYSIS SUBMITTED</span>
                        </div>
                        <p className="text-gray-400 font-mono mt-1">
                          Your analysis is under review by certifiers.
                          {isUserShortlisted ? " You've been shortlisted!" : " Waiting for shortlisting..."}
                        </p>
                        {isUserShortlisted && (
                          <Badge className="mt-2 bg-green-600">
                            <Star className="h-3 w-3 mr-1" />
                            SHORTLISTED
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Validation Section for Assigned Analyst */}
                    {isCurrentUserAnalyst && !isTicketValidated && (
                      <div className="mt-6 space-y-4 border-t border-green-700 pt-4">
                        <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-mono font-bold">YOU ARE THE ASSIGNED ANALYST</span>
                          </div>
                          <p className="text-gray-400 font-mono mt-1">
                            You can now validate this ticket and claim your reward.
                          </p>
                        </div>
                        
                        <Button
                          onClick={validateTicket}
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

                    {/* Submitted Analyses Display */}
                    {submittedAnalyses.length > 0 && (
                      <div className="mt-6 border-t border-gray-700 pt-4">
                        <h3 className="text-purple-400 font-mono font-bold mb-4">SUBMITTED ANALYSES ({submittedAnalyses.length})</h3>
                        <div className="space-y-3">
                          {submittedAnalyses.map((analysis, index) => (
                            <div key={index} className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-400 font-mono text-sm">
                                  {analysis.analyst_address.slice(0, 8)}...{analysis.analyst_address.slice(-6)}
                                </span>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {analysis.status}
                                  </Badge>
                                  {shortlistedAnalysts.some(a => a.address === analysis.analyst_address) && (
                                    <Badge className="bg-green-600 text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      SHORTLISTED
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm font-mono">
                                {analysis.analysis_text.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
