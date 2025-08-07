
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  CheckCircle,
  Clock,
  Star,
  Users,
  Wallet,
  Shield,
  Eye
} from "lucide-react";
import { setAnalyst } from "@/lib/evm-contract";

interface ClientTicket {
  id: string;
  title: string;
  client_address: string;
  assigned_analyst: string | null;
  reward_amount: number;
  shortlistCount: number;
  status: string;
}

interface ShortlistedAnalyst {
  address: string;
  profile: {
    name: string;
    expertise: string[];
    experience: string;
  } | null;
  analysis_preview: string | null;
  shortlisted_at: string;
  is_selected: boolean;
}

export default function ClientDashboard() {
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [myTickets, setMyTickets] = useState<ClientTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ClientTicket | null>(null);
  const [shortlistedAnalysts, setShortlistedAnalysts] = useState<ShortlistedAnalyst[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const address = localStorage.getItem('connectedWallet') || "";
    setConnectedAddress(address);
    
    if (address) {
      loadMyTickets(address);
    }
  }, []);

  const loadMyTickets = async (address: string) => {
    try {
      const response = await fetch(`/api/tickets/client/${address}`);
      if (response.ok) {
        const tickets = await response.json();
        setMyTickets(tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const loadShortlistedAnalysts = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/shortlisted`);
      if (response.ok) {
        const analysts = await response.json();
        setShortlistedAnalysts(analysts);
      }
    } catch (error) {
      console.error('Error loading shortlisted analysts:', error);
    }
  };

  const selectAnalyst = async (analystAddress: string, ticketId: string) => {
    setIsAssigning(true);
    try {
      // First, assign in backend
      const backendResponse = await fetch(`/api/tickets/${ticketId}/assign-analyst`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analyst_address: analystAddress,
          assigned_by: connectedAddress,
          assigned_at: new Date().toISOString()
        })
      });

      if (!backendResponse.ok) {
        throw new Error('Failed to assign analyst in backend');
      }

      // Then, call the smart contract setAnalyst function
      try {
        const txHash = await setAnalyst(parseInt(ticketId), analystAddress);
        
        toast({
          title: "Success",
          description: `Analyst assigned successfully! Transaction: ${txHash}`,
        });

        console.log(`🔗 Blockchain assignment complete:`, {
          ticketId: ticketId,
          analyst: analystAddress,
          client: connectedAddress,
          txHash: txHash
        });

      } catch (contractError: any) {
        console.error('Contract call failed:', contractError);
        toast({
          title: "Warning", 
          description: "Analyst assigned in system, but blockchain transaction failed. Please try again.",
          variant: "destructive"
        });
      }

      // Reload data
      loadMyTickets(connectedAddress);
      setSelectedTicket(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const viewShortlistedAnalysts = (ticket: ClientTicket) => {
    setSelectedTicket(ticket);
    loadShortlistedAnalysts(ticket.id);
  };

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                Wallet Connection Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Please connect your wallet to access the client dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Client Dashboard</h1>
          <p className="text-gray-300">Manage your security cases and select analysts</p>
          <p className="text-sm text-gray-400">Address: {connectedAddress}</p>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="assigned">Assigned Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            <div className="grid gap-4">
              {myTickets.filter(ticket => !ticket.assigned_analyst).map((ticket) => (
                <Card key={ticket.id} className="bg-slate-800/50 border-gray-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{ticket.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-green-500/20 text-green-300">
                            {ticket.reward_amount} CLT Reward
                          </Badge>
                          <Badge variant="outline">
                            {ticket.shortlistCount} Shortlisted
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => viewShortlistedAnalysts(ticket)}
                        disabled={ticket.shortlistCount === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Select Analyst
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">
                      Status: Awaiting analyst selection
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTicket && (
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">
                    Select Analyst for: {selectedTicket.title}
                  </CardTitle>
                  <p className="text-gray-300">
                    Choose from {shortlistedAnalysts.length} certified analysts
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {shortlistedAnalysts.map((analyst) => (
                    <Card key={analyst.address} className="bg-slate-900/50 border-gray-600">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {analyst.profile?.name || `Analyst ${analyst.address.slice(0, 8)}...`}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Address: {analyst.address}
                            </p>
                            {analyst.profile?.expertise && (
                              <div className="flex gap-1 mt-2">
                                {analyst.profile.expertise.slice(0, 4).map((exp, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {exp}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-gray-400 text-sm mt-2">
                              Shortlisted: {new Date(analyst.shortlisted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => selectAnalyst(analyst.address, selectedTicket.id)}
                              disabled={isAssigning}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              {isAssigning ? "Assigning..." : "Select Analyst"}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {analyst.analysis_preview && (
                        <CardContent>
                          <div className="bg-slate-800/50 p-3 rounded">
                            <h5 className="text-gray-300 text-sm font-medium mb-2">Analysis Preview:</h5>
                            <p className="text-gray-400 text-sm">
                              {analyst.analysis_preview}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                  
                  {shortlistedAnalysts.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">
                        No Analysts Shortlisted Yet
                      </h3>
                      <p className="text-gray-400">
                        Please wait for certifiers to review and shortlist qualified analysts.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelectedTicket(null)}
                    className="w-full"
                  >
                    Back to My Tickets
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            <div className="grid gap-4">
              {myTickets.filter(ticket => ticket.assigned_analyst).map((ticket) => (
                <Card key={ticket.id} className="bg-slate-800/50 border-green-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{ticket.title}</CardTitle>
                        <p className="text-gray-300 text-sm mt-1">
                          Assigned to: {ticket.assigned_analyst}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-green-500/20 text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Analyst Assigned
                          </Badge>
                          <Badge variant="outline">
                            {ticket.reward_amount} CLT
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">
                      Status: Work in progress - analyst is analyzing your case
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myTickets.filter(ticket => ticket.assigned_analyst).length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No Assigned Cases
                </h3>
                <p className="text-gray-400">
                  Cases you assign to analysts will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
