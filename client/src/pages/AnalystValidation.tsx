
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
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Send,
  Shield,
  Award,
  Users,
  Eye
} from "lucide-react";

interface AnalystProfile {
  name: string;
  expertise: string[];
  experience: string;
  certifications: string[];
  walletAddress: string;
  ipfsHash?: string;
}

interface TicketAnalysis {
  ticketId: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  reward: number;
  status: 'open' | 'submitted' | 'shortlisted' | 'assigned' | 'completed';
}

interface AnalysisSubmission {
  id: string;
  ticket_id: string;
  analyst_address: string;
  analysis_text: string;
  ipfs_hash?: string;
  status: 'submitted' | 'shortlisted' | 'selected';
  submitted_at: string;
  is_shortlisted: boolean;
}

export default function AnalystValidation() {
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [analystProfile, setAnalystProfile] = useState<AnalystProfile>({
    name: "",
    expertise: [],
    experience: "",
    certifications: [],
    walletAddress: ""
  });
  const [availableTickets, setAvailableTickets] = useState<TicketAnalysis[]>([]);
  const [mySubmissions, setMySubmissions] = useState<AnalysisSubmission[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketAnalysis | null>(null);
  const [analysisText, setAnalysisText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isProfileRegistered, setIsProfileRegistered] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Get connected wallet address
    const address = localStorage.getItem('connectedWallet') || "";
    setConnectedAddress(address);
    
    if (address) {
      checkAnalystRegistration(address);
      loadAvailableTickets();
      loadMySubmissions(address);
    }
  }, []);

  const checkAnalystRegistration = async (address: string) => {
    try {
      const response = await fetch(`/api/analysts/${address}`);
      if (response.ok) {
        const analyst = await response.json();
        setAnalystProfile(analyst);
        setIsProfileRegistered(true);
      }
    } catch (error) {
      console.log("Analyst not registered yet");
    }
  };

  const loadAvailableTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const tickets = await response.json();
        // Convert to TicketAnalysis format and filter open tickets
        const formattedTickets = tickets
          .filter((ticket: any) => ticket.status === 'open')
          .map((ticket: any) => ({
            ticketId: ticket.id.toString(),
            title: ticket.title,
            description: ticket.description,
            severity: ticket.severity || 'medium',
            category: ticket.category || 'security',
            reward: ticket.stake_amount || 100,
            status: 'open' as const
          }));
        setAvailableTickets(formattedTickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const loadMySubmissions = async (address: string) => {
    try {
      // Load submissions from global state
      const submissions = (globalThis as any).analysisSubmissions || [];
      const mySubmissions = submissions.filter((s: any) => s.analyst_address === address);
      setMySubmissions(mySubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const registerAnalyst = async () => {
    if (!connectedAddress || !analystProfile.name || analystProfile.expertise.length === 0) {
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
      const ipfsResponse = await fetch('/api/ipfs/store-analyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: connectedAddress,
          profile: analystProfile,
          registrationDate: new Date().toISOString()
        })
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to store profile in IPFS');
      }

      const ipfsData = await ipfsResponse.json();

      // Register analyst with backend
      const registerResponse = await fetch('/api/analysts/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: connectedAddress,
          ...analystProfile,
          ipfsHash: ipfsData.hash
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register analyst');
      }

      setIsProfileRegistered(true);
      toast({
        title: "Success",
        description: "Analyst profile registered successfully!"
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

  const submitAnalysis = async () => {
    if (!selectedTicket || !analysisText.trim()) {
      toast({
        title: "Error", 
        description: "Please select a ticket and provide analysis",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Store analysis in IPFS
      const ipfsResponse = await fetch('/api/ipfs/store-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketId: selectedTicket.ticketId,
          analystAddress: connectedAddress,
          analysis: analysisText,
          submittedAt: new Date().toISOString(),
          analystProfile: analystProfile
        })
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to store analysis in IPFS');
      }

      const ipfsData = await ipfsResponse.json();

      // Submit analysis to backend
      const submitResponse = await fetch(`/api/tickets/${selectedTicket.ticketId}/submit-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analyst_address: connectedAddress,
          analysis_text: analysisText,
          ipfs_hash: ipfsData.hash,
          status: 'submitted'
        })
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit analysis');
      }

      setAnalysisText("");
      setSelectedTicket(null);
      loadMySubmissions(connectedAddress);

      toast({
        title: "Success",
        description: "Analysis submitted successfully! Awaiting certifier review."
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExpertise = (expertise: string) => {
    if (expertise && !analystProfile.expertise.includes(expertise)) {
      setAnalystProfile(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertise]
      }));
    }
  };

  const removeExpertise = (expertise: string) => {
    setAnalystProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Wallet Connection Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Please connect your wallet to access the analyst dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isProfileRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <User className="h-6 w-6" />
                Analyst Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={analystProfile.name}
                  onChange={(e) => setAnalystProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  value={analystProfile.experience}
                  onChange={(e) => setAnalystProfile(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your cybersecurity experience..."
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <div>
                <Label>Expertise Areas *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add expertise (e.g., Smart Contracts, DeFi, Web3)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addExpertise((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="bg-slate-900/50 border-gray-600"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {analystProfile.expertise.map((exp, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-500/20 text-blue-300 cursor-pointer"
                      onClick={() => removeExpertise(exp)}
                    >
                      {exp} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  value={analystProfile.certifications.join('\n')}
                  onChange={(e) => setAnalystProfile(prev => ({ 
                    ...prev, 
                    certifications: e.target.value.split('\n').filter(c => c.trim())
                  }))}
                  placeholder="List your certifications (one per line)"
                  className="bg-slate-900/50 border-gray-600"
                />
              </div>

              <Button
                onClick={registerAnalyst}
                disabled={isRegistering}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isRegistering ? "Registering..." : "Register as Analyst"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Analyst Dashboard</h1>
          <p className="text-gray-300">Welcome back, {analystProfile.name}</p>
          <p className="text-sm text-gray-400">Address: {connectedAddress}</p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="available">Available Cases</TabsTrigger>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4">
              {availableTickets.map((ticket) => (
                <Card key={ticket.ticketId} className="bg-slate-800/50 border-gray-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{ticket.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={ticket.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {ticket.severity}
                          </Badge>
                          <Badge variant="outline">{ticket.category}</Badge>
                          <Badge className="bg-green-500/20 text-green-300">
                            {ticket.reward} CLT
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Analyze
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">{ticket.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTicket && (
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400">Submit Analysis for: {selectedTicket.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    placeholder="Provide your detailed security analysis..."
                    className="bg-slate-900/50 border-gray-600 min-h-[200px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={submitAnalysis}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Analysis"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTicket(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <div className="grid gap-4">
              {mySubmissions.map((submission) => (
                <Card key={submission.id} className="bg-slate-800/50 border-gray-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Ticket #{submission.ticket_id}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={
                            submission.status === 'selected' ? 'default' :
                            submission.is_shortlisted ? 'secondary' : 'outline'
                          }>
                            {submission.status === 'selected' ? 'Selected' :
                             submission.is_shortlisted ? 'Shortlisted' : 'Submitted'}
                          </Badge>
                        </div>
                      </div>
                      {submission.status === 'selected' && (
                        <Badge className="bg-green-500/20 text-green-300">
                          <Award className="h-4 w-4 mr-1" />
                          Chosen
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-2">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {submission.analysis_text.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
              {mySubmissions.length === 0 && (
                <Card className="bg-slate-800/50 border-gray-600">
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No submissions yet. Start analyzing cases to earn rewards!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-slate-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Analyst Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <p className="text-white">{analystProfile.name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Experience</Label>
                  <p className="text-gray-300">{analystProfile.experience}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analystProfile.expertise.map((exp, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Certifications</Label>
                  <ul className="text-gray-300 mt-1">
                    {analystProfile.certifications.map((cert, index) => (
                      <li key={index}>• {cert}</li>
                    ))}
                  </ul>
                </div>
                {analystProfile.ipfsHash && (
                  <div>
                    <Label className="text-gray-300">IPFS Hash</Label>
                    <p className="text-gray-400 text-sm font-mono">{analystProfile.ipfsHash}</p>
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
