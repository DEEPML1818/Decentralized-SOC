
import { useState, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Shield, AlertTriangle, Hash, Star, Users, ThumbsUp, Eye } from "lucide-react";

export default function CertifierDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [submittedAnalyses, setSubmittedAnalyses] = useState<any[]>([]);
  const [shortlisting, setShortlisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRegisteredCertifier, setIsRegisteredCertifier] = useState(false);
  const [certifierProfile, setCertifierProfile] = useState({
    name: "",
    organization: "",
    experience: "",
    certifications: ""
  });
  const [registeringCertifier, setRegisteringCertifier] = useState(false);

  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (isEVMConnected) {
      checkCertifierRegistration();
      loadPendingTickets();
    }
  }, [isEVMConnected]);

  const checkCertifierRegistration = async () => {
    if (!evmAddress) return;
    
    try {
      const response = await fetch(`/api/certifiers/${evmAddress}`);
      if (response.ok) {
        const certifierData = await response.json();
        setIsRegisteredCertifier(true);
        setCertifierProfile(certifierData);
      }
    } catch (error) {
      console.log('Certifier not registered yet');
    }
  };

  const registerAsCertifier = async () => {
    if (!evmAddress || !certifierProfile.name.trim()) return;
    
    setRegisteringCertifier(true);
    try {
      // Store certifier profile in IPFS
      const ipfsResponse = await fetch('/api/ipfs/store-certifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: evmAddress,
          profile: certifierProfile,
          registrationDate: new Date().toISOString()
        }),
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to store certifier profile in IPFS');
      }

      const ipfsData = await ipfsResponse.json();

      // Register certifier in our database
      const registerResponse = await fetch('/api/certifiers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: evmAddress,
          ...certifierProfile,
          ipfsHash: ipfsData.hash
        }),
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register certifier');
      }

      setIsRegisteredCertifier(true);
      toast({
        title: "Certifier Registration Successful",
        description: "Your profile has been stored in IPFS and registered.",
      });

    } catch (error: any) {
      console.error('Error registering certifier:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register as certifier",
        variant: "destructive",
      });
    } finally {
      setRegisteringCertifier(false);
    }
  };

  const loadPendingTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets/pending-analysis');
      if (response.ok) {
        const pendingTickets = await response.json();
        setTickets(pendingTickets);
      }
    } catch (error) {
      console.error('Error loading pending tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysesForTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/analyses`);
      if (response.ok) {
        const analyses = await response.json();
        setSubmittedAnalyses(analyses);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const shortlistAnalyst = async (ticketId: string, analystAddress: string) => {
    if (!isRegisteredCertifier) return;
    
    setShortlisting(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyst_address: analystAddress,
          certifier_address: evmAddress,
          shortlisted_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to shortlist analyst');
      }

      toast({
        title: "Analyst Shortlisted",
        description: "The analyst has been added to the shortlist for client selection.",
      });

      // Refresh analyses
      await loadAnalysesForTicket(ticketId);

    } catch (error: any) {
      console.error('Error shortlisting analyst:', error);
      toast({
        title: "Shortlisting Failed",
        description: error.message || "Failed to shortlist analyst",
        variant: "destructive",
      });
    } finally {
      setShortlisting(false);
    }
  };

  const viewTicketDetails = async (ticket: any) => {
    setSelectedTicket(ticket);
    await loadAnalysesForTicket(ticket.id.toString());
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
                  <p className="text-gray-400 font-mono">Please connect your EVM wallet to access certifier features</p>
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
          <h1 className="text-4xl font-bold text-purple-400 font-mono mb-2">
            CERTIFIER DASHBOARD
          </h1>
          <p className="text-gray-400 font-mono">
            Review and shortlist qualified analysts for security analysis tickets
          </p>
        </div>

        {/* Certifier Registration */}
        {!isRegisteredCertifier && (
          <Card className="bg-purple-900/20 border-purple-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2 font-mono">
                <Shield className="h-5 w-5" />
                CERTIFIER REGISTRATION
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Register as a certified reviewer to shortlist analysts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-purple-400 font-mono">NAME</Label>
                  <Input
                    id="name"
                    value={certifierProfile.name}
                    onChange={(e) => setCertifierProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    className="bg-black/50 border-purple-500/30 text-white font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="organization" className="text-purple-400 font-mono">ORGANIZATION</Label>
                  <Input
                    id="organization"
                    value={certifierProfile.organization}
                    onChange={(e) => setCertifierProfile(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="Your organization"
                    className="bg-black/50 border-purple-500/30 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="experience" className="text-purple-400 font-mono">EXPERIENCE</Label>
                <Input
                  id="experience"
                  value={certifierProfile.experience}
                  onChange={(e) => setCertifierProfile(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Years of experience in security certification"
                  className="bg-black/50 border-purple-500/30 text-white font-mono"
                />
              </div>
              <Button
                onClick={registerAsCertifier}
                disabled={registeringCertifier || !certifierProfile.name.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 font-mono"
              >
                {registeringCertifier ? "REGISTERING..." : "REGISTER AS CERTIFIER"}
              </Button>
            </CardContent>
          </Card>
        )}

        {isRegisteredCertifier && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Tickets List */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2 font-mono">
                    <Users className="h-5 w-5" />
                    PENDING REVIEW
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
                      <p className="text-gray-400 font-mono mt-2">Loading...</p>
                    </div>
                  ) : tickets.length === 0 ? (
                    <p className="text-gray-400 font-mono text-center py-4">No pending tickets</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-3 rounded border cursor-pointer transition-colors ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-purple-900/30 border-purple-400'
                              : 'bg-gray-800/50 border-gray-600 hover:border-purple-500'
                          }`}
                          onClick={() => viewTicketDetails(ticket)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-mono text-sm">#{ticket.id}</span>
                            <Badge variant="outline" className="text-xs">
                              {ticket.analysisCount || 0} analyses
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm font-mono truncate">
                            {ticket.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ticket Details and Analyses */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <Card className="bg-gray-900/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2 font-mono">
                      <Eye className="h-5 w-5" />
                      TICKET #{selectedTicket.id} - REVIEW ANALYSES
                    </CardTitle>
                    <CardDescription className="text-gray-300 font-mono">
                      {selectedTicket.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submittedAnalyses.length === 0 ? (
                      <p className="text-gray-400 font-mono text-center py-8">
                        No analyses submitted yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {submittedAnalyses.map((analysis, index) => (
                          <div key={index} className="bg-gray-800/50 border border-gray-600 rounded p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-blue-400 font-mono text-sm">
                                  {analysis.analyst_address.slice(0, 8)}...{analysis.analyst_address.slice(-6)}
                                </span>
                                <div className="text-xs text-gray-400 mt-1">
                                  Submitted: {new Date(analysis.submitted_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {analysis.status}
                                </Badge>
                                {analysis.is_shortlisted && (
                                  <Badge className="bg-green-600 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    SHORTLISTED
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-black/30 rounded p-3 mb-3">
                              <p className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                                {analysis.analysis_text}
                              </p>
                            </div>

                            {!analysis.is_shortlisted && (
                              <Button
                                onClick={() => shortlistAnalyst(selectedTicket.id.toString(), analysis.analyst_address)}
                                disabled={shortlisting}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 font-mono"
                              >
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                SHORTLIST ANALYST
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900/50 border-purple-500/30">
                  <CardContent className="p-8 text-center">
                    <Hash className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-mono">
                      Select a ticket from the list to review submitted analyses
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
