import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Clock, 
  Users, 
  Coins, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Play,
  Award,
  Eye,
  UserCheck
} from "lucide-react";

interface PoolTicket {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  rewardAmount: string;
  requiredAnalysts: number;
  timeline: string;
  status: 'open' | 'in_progress' | 'completed' | 'verified';
  submittedBy: string;
  createdAt: string;
  participatingAnalysts?: string[];
  submissions?: any[];
}

export default function PoolTicketList() {
  const { walletType, evmAddress, iotaAddress, isEVMConnected, isIOTAConnected } = useWallet();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<PoolTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<PoolTicket | null>(null);

  const isConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;
  const currentAddress = walletType === 'iota' ? iotaAddress : evmAddress;

  const severityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const statusColors = {
    open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    verified: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  // Mock data for demonstration
  const mockTickets: PoolTicket[] = [
    {
      id: '1',
      title: 'Smart Contract Vulnerability Assessment',
      description: 'Analyze potential reentrancy vulnerabilities in DeFi lending protocol',
      severity: 'high',
      rewardAmount: '500',
      requiredAnalysts: 2,
      timeline: 'high',
      status: 'open',
      submittedBy: '0x1234...5678',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      participatingAnalysts: []
    },
    {
      id: '2', 
      title: 'API Security Review',
      description: 'Comprehensive security audit of REST API endpoints and authentication mechanisms',
      severity: 'medium',
      rewardAmount: '250',
      requiredAnalysts: 1,
      timeline: 'normal',
      status: 'in_progress',
      submittedBy: '0x9876...4321',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      participatingAnalysts: ['0xaaaa...bbbb']
    },
    {
      id: '3',
      title: 'Critical Infrastructure Breach Analysis',
      description: 'Immediate investigation of suspected APT activity in network infrastructure',
      severity: 'critical',
      rewardAmount: '1000',
      requiredAnalysts: 3,
      timeline: 'urgent',
      status: 'completed',
      submittedBy: '0x5555...6666',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      participatingAnalysts: ['0xaaaa...bbbb', '0xcccc...dddd', '0xeeee...ffff']
    }
  ];

  useEffect(() => {
    loadTickets();
    
    // Listen for new tickets
    const handleNewTicket = (event: CustomEvent) => {
      setTickets(prev => [event.detail, ...prev]);
    };
    
    window.addEventListener('poolTicketSubmitted', handleNewTicket as EventListener);
    
    return () => {
      window.removeEventListener('poolTicketSubmitted', handleNewTicket as EventListener);
    };
  }, [isConnected, walletType]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // In a real implementation, load from smart contracts and backend
      if (walletType === 'evm' && isEVMConnected) {
        // Load from EVM smart contract
        // const contractTickets = await evmContractService.getOpenPools();
        setTickets(mockTickets);
      } else if (walletType === 'iota' && isIOTAConnected) {
        // Load from IOTA smart contract
        setTickets(mockTickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setTickets(mockTickets); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const joinPool = async (ticketId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to join a pool",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (walletType === 'evm') {
        // Join pool via EVM smart contract
        const tx = await evmContractService.joinPool(ticketId);
        await tx.wait();
        
        toast({
          title: "Joined Pool",
          description: "Successfully joined the analysis pool on Scroll EVM",
        });
      } else {
        // Join pool via IOTA smart contract (mock)
        toast({
          title: "Joined Pool",
          description: "Successfully joined the analysis pool on IOTA",
        });
      }

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              status: 'in_progress' as const,
              participatingAnalysts: [...(ticket.participatingAnalysts || []), currentAddress || '']
            }
          : ticket
      ));

    } catch (error: any) {
      toast({
        title: "Failed to Join Pool",
        description: error.message || "Failed to join the analysis pool",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAnalysis = async (ticketId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected", 
        description: "Please connect your wallet to submit analysis",
        variant: "destructive"
      });
      return;
    }

    // This would open a detailed analysis submission form
    toast({
      title: "Analysis Submission",
      description: "Opening analysis submission form...",
    });
    
    // Here you would open a modal or navigate to analysis submission page
    window.dispatchEvent(new CustomEvent('openAnalysisSubmission', { 
      detail: { ticketId } 
    }));
  };

  const claimReward = async (ticketId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (walletType === 'evm') {
        // Claim reward via EVM smart contract
        const tx = await evmContractService.claimPoolReward(ticketId);
        await tx.wait();
        
        toast({
          title: "Reward Claimed",
          description: "Successfully claimed your analysis reward",
        });
      } else {
        // Claim reward via IOTA smart contract (mock)
        toast({
          title: "Reward Claimed",
          description: "Successfully claimed your analysis reward on IOTA",
        });
      }

    } catch (error: any) {
      toast({
        title: "Failed to Claim Reward",
        description: error.message || "Failed to claim reward",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActionButton = (ticket: PoolTicket) => {
    const isParticipating = ticket.participatingAnalysts?.includes(currentAddress || '');
    const isOwner = ticket.submittedBy === currentAddress;

    if (isOwner) {
      return (
        <Button size="sm" variant="outline" disabled>
          <Eye className="h-4 w-4 mr-2" />
          Owner
        </Button>
      );
    }

    switch (ticket.status) {
      case 'open':
        return (
          <Button 
            size="sm" 
            onClick={() => joinPool(ticket.id)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Join Pool
          </Button>
        );
      
      case 'in_progress':
        if (isParticipating) {
          return (
            <Button 
              size="sm" 
              onClick={() => submitAnalysis(ticket.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Analysis
            </Button>
          );
        }
        return (
          <Button size="sm" variant="outline" disabled>
            <Users className="h-4 w-4 mr-2" />
            In Progress
          </Button>
        );

      case 'completed':
        if (isParticipating) {
          return (
            <Button 
              size="sm" 
              onClick={() => claimReward(ticket.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Award className="h-4 w-4 mr-2" />
              Claim Reward
            </Button>
          );
        }
        return (
          <Button size="sm" variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </Button>
        );

      case 'verified':
        return (
          <Button size="sm" variant="outline" disabled>
            <UserCheck className="h-4 w-4 mr-2" />
            Verified
          </Button>
        );

      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">
          Connect your wallet to view and participate in security analysis pools
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Analysis Pools</h2>
          <p className="text-gray-400">
            Join pools, contribute analysis, and earn CLT rewards
          </p>
        </div>
        
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {walletType === 'iota' ? 'IOTA Network' : 'Scroll EVM'} • {tickets.length} Pools
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading pools...</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card className="bg-slate-800 border-purple-500/20">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Pools Available</h3>
            <p className="text-gray-400">
              Be the first to submit a security analysis pool ticket
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="bg-slate-800 border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-white">{ticket.title}</CardTitle>
                      <Badge className={severityColors[ticket.severity]}>
                        {ticket.severity.toUpperCase()}
                      </Badge>
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {ticket.description}
                    </CardDescription>
                  </div>
                  
                  <div className="text-right">
                    {getActionButton(ticket)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-green-400">
                      <Coins className="h-4 w-4" />
                      <span>{ticket.rewardAmount} CLT</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-400">
                      <Users className="h-4 w-4" />
                      <span>{ticket.participatingAnalysts?.length || 0}/{ticket.requiredAnalysts} analysts</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(ticket.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="text-gray-500 text-xs">
                    By {ticket.submittedBy.slice(0, 6)}...{ticket.submittedBy.slice(-4)}
                  </div>
                </div>

                {ticket.participatingAnalysts && ticket.participatingAnalysts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Participating Analysts:</div>
                    <div className="flex gap-2">
                      {ticket.participatingAnalysts.map((analyst, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {analyst.slice(0, 6)}...{analyst.slice(-4)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}