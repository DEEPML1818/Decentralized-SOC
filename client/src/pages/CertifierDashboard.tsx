
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  User,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Users,
  Award
} from "lucide-react";

interface CertifierProfile {
  name: string;
  organization: string;
  experience: string;
  certifications: string[];
  walletAddress: string;
  ipfsHash?: string;
}

interface PendingAnalysis {
  id: string;
  ticket_id: string;
  analyst_address: string;
  analysis_text: string;
  submitted_at: string;
  analyst_profile?: {
    name: string;
    expertise: string[];
    experience: string;
  };
}

interface TicketWithAnalyses {
  id: string;
  title: string;
  description: string;
  analysisCount: number;
}

export default function CertifierDashboard() {
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [certifierProfile, setCertifierProfile] = useState<CertifierProfile>({
    name: "",
    organization: "",
    experience: "",
    certifications: [],
    walletAddress: ""
  });
  const [pendingTickets, setPendingTickets] = useState<TicketWithAnalyses[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithAnalyses | null>(null);
  const [ticketAnalyses, setTicketAnalyses] = useState<PendingAnalysis[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isProfileRegistered, setIsProfileRegistered] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const address = localStorage.getItem('connectedWallet') || "";
    setConnectedAddress(address);
    
    if (address) {
      checkCertifierRegistration(address);
      loadPendingTickets();
    }
  }, []);

  const checkCertifierRegistration = async (address: string) => {
    try {
      const response = await fetch(`/api/certifiers/${address}`);
      if (response.ok) {
        const certifier = await response.json();
        setCertifierProfile(certifier);
        setIsProfileRegistered(true);
      }
    } catch (error) {
      console.log("Certifier not registered yet");
    }
  };

  const loadPendingTickets = async () => {
    try {
      const response = await fetch('/api/tickets/pending-analysis');
      if (response.ok) {
        const tickets = await response.json();
        setPendingTickets(tickets);
      }
    } catch (error) {
      console.error('Error loading pending tickets:', error);
    }
  };

  const loadTicketAnalyses = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/analyses`);
      if (response.ok) {
        const analyses = await response.json();
        setTicketAnalyses(analyses);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const registerCertifier = async () => {
    if (!connectedAddress || !certifierProfile.name || !certifierProfile.organization) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsRegistering(true);
    try {
      // Store profile in IPFS
      const ipfsResponse = await fetch('/api/ipfs/store-certifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: connectedAddress,
          profile: certifierProfile,
          registrationDate: new Date().toISOString()
        })
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to store profile in IPFS');
      }

      const ipfsData = await ipfsResponse.json();

      // Register certifier with backend
      const registerResponse = await fetch('/api/certifiers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: connectedAddress,
          ...certifierProfile,
          ipfsHash: ipfsData.hash
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register certifier');
      }

      setIsProfileRegistered(true);
      toast({
        title: "Success",
        description: "Certifier profile registered successfully!"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const shortlistAnalyst = async (analysis: PendingAnalysis) => {
    setIsShortlisting(true);
    try {
      const response = await fetch(`/api/tickets/${analysis.ticket_id}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analyst_address: analysis.analyst_address,
          certifier_address: connectedAddress,
          shortlisted_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to shortlist analyst');
      }

      // Reload analyses to reflect changes
      if (selectedTicket) {
        loadTicketAnalyses(selectedTicket.id);
      }

      toast({
        title: "Success",
        description: "Analyst has been shortlisted for client review"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsShortlisting(false);
    }
  };

  const viewTicketDetails = (ticket: TicketWithAnalyses) => {
    setSelectedTicket(ticket);
    loadTicketAnalyses(ticket.id);
  };

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Wallet Connection Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Please connect your wallet to access the certifier dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isProfileRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Certifier Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={certifierProfile.name}
                  onChange={(e) => setCertifierProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={certifierProfile.organization}
                  onChange={(e) => setCertifierProfile(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Your organization/company"
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  value={certifierProfile.experience}
                  onChange={(e) => setCertifierProfile(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your certification and validation experience..."
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  value={certifierProfile.certifications.join('\n')}
                  onChange={(e) => setCertifierProfile(prev => ({ 
                    ...prev, 
                    certifications: e.target.value.split('\n').filter(c => c.trim())
                  }))}
                  placeholder="List your certifications (one per line)"
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <Button
                onClick={registerCertifier}
                disabled={isRegistering}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isRegistering ? "Registering..." : "Register as Certifier"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Certifier Dashboard</h1>
          <p className="text-gray-300">Welcome back, {certifierProfile.name}</p>
          <p className="text-sm text-gray-400">Organization: {certifierProfile.organization}</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4">
              {pendingTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-slate-800/50 border-gray-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{ticket.title}</CardTitle>
                        <p className="text-gray-300 text-sm mt-1">{ticket.description}</p>
                        <Badge className="bg-blue-500/20 text-blue-300 mt-2">
                          {ticket.analysisCount} Analyses Submitted
                        </Badge>
                      </div>
                      <Button
                        onClick={() => viewTicketDetails(ticket)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {selectedTicket && (
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">
                    Reviewing: {selectedTicket.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="bg-slate-900/50 border-gray-600">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-medium">
                              {analysis.analyst_profile?.name || `Analyst ${analysis.analyst_address.slice(0, 8)}...`}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Submitted: {new Date(analysis.submitted_at).toLocaleDateString()}
                            </p>
                            {analysis.analyst_profile?.expertise && (
                              <div className="flex gap-1 mt-2">
                                {analysis.analyst_profile.expertise.slice(0, 3).map((exp, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {exp}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => shortlistAnalyst(analysis)}
                            disabled={isShortlisting}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Shortlist
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm">
                          {analysis.analysis_text.substring(0, 300)}
                          {analysis.analysis_text.length > 300 && "..."}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTicket(null)}
                    className="w-full"
                  >
                    Back to Pending Reviews
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4">
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Shortlisted Analysts</h3>
              <p className="text-gray-400">View analysts you've shortlisted for client selection</p>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-slate-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Certifier Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <p className="text-white">{certifierProfile.name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Organization</Label>
                  <p className="text-white">{certifierProfile.organization}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Experience</Label>
                  <p className="text-gray-300">{certifierProfile.experience}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Certifications</Label>
                  <ul className="text-gray-300 mt-1">
                    {certifierProfile.certifications.map((cert, index) => (
                      <li key={index}>• {cert}</li>
                    ))}
                  </ul>
                </div>
                {certifierProfile.ipfsHash && (
                  <div>
                    <Label className="text-gray-300">IPFS Hash</Label>
                    <p className="text-gray-400 text-sm font-mono">{certifierProfile.ipfsHash}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
