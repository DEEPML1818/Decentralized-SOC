import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import CaseDetailModal from "./CaseDetailModal";
import { 
  Search, 
  FileText, 
  Clock, 
  User, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  SortDesc,
  RefreshCw,
  ExternalLink,
  Hash,
  Coins,
  Target,
  Lock,
  Users,
  TrendingUp,
} from "lucide-react";
import { LoadingSpinner } from "./ui/loading-spinner";

interface Case {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  client_name: string;
  contact_info: string; 
  assigned_analyst?: string;
  assigned_certifier?: string;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: string;
  contract_address?: string;
  ticket_id?: number;
  client_wallet?: string;
  created_at: string;
  updated_at: string;
}

interface CasesListProps {
  walletType: 'evm' | 'iota';
}

export default function CasesList({ walletType }: CasesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  // Mock cases for demonstration purposes, replace with actual data fetching
  const mockCases: Case[] = [
    {
      id: 1,
      title: "Critical Vulnerability Detected in Authentication Module",
      description: "An unpatched vulnerability in the user authentication system could allow unauthorized access.",
      severity: "critical",
      status: "in_progress",
      client_name: "CyberSec Corp",
      contact_info: "security@cybersec.com",
      assigned_analyst: "0xAbCdEf1234567890aBcDeF1234567890aBcDeF12",
      transaction_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      block_number: 1234567,
      gas_used: "21000",
      contract_address: "0xAbCdEf1234567890aBcDeF1234567890aBcDeF12",
      ticket_id: 1001,
      client_wallet: "0xAbCdEf1234567890aBcDeF1234567890aBcDeF12",
      created_at: "2023-10-26T10:00:00Z",
      updated_at: "2023-10-26T12:00:00Z",
    },
    {
      id: 2,
      title: "Phishing Attempt Targeting Client Credentials",
      description: "Reports of a sophisticated phishing campaign attempting to steal user login details.",
      severity: "high",
      status: "assigned",
      client_name: "Secure Solutions Ltd",
      contact_info: "support@securesolutions.com",
      assigned_certifier: "0x0987654321fedcba0987654321fedcba09876543",
      created_at: "2023-10-25T09:00:00Z",
      updated_at: "2023-10-25T11:00:00Z",
    },
    {
      id: 3,
      title: "DDoS Attack on Network Infrastructure",
      description: "Sustained distributed denial-of-service attacks are impacting network availability.",
      severity: "medium",
      status: "pending",
      client_name: "CloudFlare Inc.",
      contact_info: "abuse@cloudflare.com",
      created_at: "2023-10-24T14:30:00Z",
      updated_at: "2023-10-24T15:00:00Z",
    },
    {
      id: 4,
      title: "Malware Infection on Endpoint Devices",
      description: "Several employee workstations have been compromised by a new strain of ransomware.",
      severity: "critical",
      status: "completed",
      client_name: "Enterprise Systems",
      contact_info: "itadmin@enterprise.com",
      client_wallet: "0x1234567890abcdef1234567890abcdef12345678",
      created_at: "2023-10-23T11:00:00Z",
      updated_at: "2023-10-23T13:00:00Z",
    },
  ];

  // Fetch incident reports (cases) from the database
  // const { data: cases = [], isLoading, error } = useQuery({
  //   queryKey: ['/api/incident-reports'],
  //   refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  // });

  // Fetch tickets from the database  
  // const { data: tickets = [] } = useQuery({
  //   queryKey: ['/api/tickets'],
  //   refetchInterval: 5000,
  // });

  // Use mock data for now
  const cases = mockCases;
  const isLoading = false;
  const error = null;

  const tickets: Case[] = []; // Mock tickets

  const allCases = [...(Array.isArray(cases) ? cases : []), ...(Array.isArray(tickets) ? tickets : [])];

  const filteredCases = allCases.filter(caseItem => {
    const matchesSearch = caseItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "all" || 
      caseItem.severity?.toLowerCase() === severityFilter;

    const matchesStatus = statusFilter === "all" || 
      caseItem.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-700/30 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-700/30 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-700/30 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-700/30 text-green-400 border-green-500/30';
      default: return 'bg-gray-700/30 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Placeholder for ETH balance
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  
  // Mock function to fetch ETH balance (replace with actual wallet integration)
  useEffect(() => {
    if (walletType === 'evm') {
      const fetchBalance = async () => {
        // In a real app, you'd use a library like ethers.js or web3.js to get the balance
        // For now, we'll use a mock value
        setEthBalance("3.14159"); 
      };
      fetchBalance();
    } else {
      setEthBalance(null);
    }
  }, [walletType]);

  const handleViewDetails = (caseItem: Case) => {
    setSelectedCaseId(caseItem.id);
    toast({
      title: `Viewing Case #${caseItem.id}`,
      description: `Details for: ${caseItem.title}`,
    });
  };

  const handleCloseModal = () => {
    setSelectedCaseId(null);
  };

  if (error) {
    return (
      <Card className="bg-black border-red-500">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load cases. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-black min-h-screen p-8 font-mono text-gray-300">
      {/* Header */}
      <Card className="bg-black border-red-500 mb-8">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              dSOC Security Operations Center
            </div>
            <div className="flex items-center gap-4">
              {walletType === 'evm' && ethBalance && (
                <div className="flex items-center gap-2 text-white">
                  <Coins className="h-5 w-5 text-green-400" />
                  <span>ETH Balance: {ethBalance}</span>
                </div>
              )}
              <Badge variant="outline" className="text-red-400 border-red-500/30">
                {walletType.toUpperCase()} WALLET CONNECTED
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-gray-500">
            Real-time threat intelligence and incident response management.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cases List */}
      <Card className="bg-black border-red-500">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            Active Incidents & Tickets
          </CardTitle>
          <CardDescription className="text-gray-500">
            Monitor and manage ongoing security operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 border-b border-red-500/30 pb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-400" />
              <Input
                placeholder="Search incidents by title, client, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-red-500/30 text-red-300 placeholder-red-400/50 focus:border-red-500 transition-colors font-mono"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-black border-red-500/30 text-red-300 rounded-md px-3 py-2 text-sm focus:border-red-500 transition-colors font-mono appearance-none"
              >
                <option value="all" className="bg-black text-red-300">All Severities</option>
                <option value="critical" className="bg-black text-red-400">Critical</option>
                <option value="high" className="bg-black text-orange-400">High</option>
                <option value="medium" className="bg-black text-yellow-400">Medium</option>
                <option value="low" className="bg-black text-green-400">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border-red-500/30 text-red-300 rounded-md px-3 py-2 text-sm focus:border-red-500 transition-colors font-mono appearance-none"
              >
                <option value="all" className="bg-black text-red-300">All Statuses</option>
                <option value="pending" className="bg-black text-yellow-400">Pending</option>
                <option value="assigned" className="bg-black text-blue-400">Assigned</option>
                <option value="in_progress" className="bg-black text-purple-400">In Progress</option>
                <option value="completed" className="bg-black text-green-400">Completed</option>
                <option value="closed" className="bg-black text-gray-400">Closed</option>
              </select>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
            <p className="text-sm text-gray-400 font-mono">
              {isLoading ? 'Analyzing...' : `${filteredCases.length} incidents found`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-900/20 font-mono"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-scan
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" className="mx-auto mb-4 text-red-500" />
              <p className="text-gray-400 font-mono">Scanning network for threats...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-mono">
                {searchTerm ? 'No matching threats detected.' : 'No active incidents reported.'}
              </p>
              <p className="text-gray-500 text-sm mt-1 font-mono">
                All critical events will be listed here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((caseItem: Case) => (
                <Card key={caseItem.id} className={`bg-black border-2 ${walletType === 'evm' ? 'border-red-500/30 hover:border-red-500/60' : 'border-gray-700/30 hover:border-gray-600'} transition-all cursor-pointer hover:shadow-lg ${walletType === 'evm' ? 'hover:shadow-red-500/20' : 'hover:shadow-blue-500/20'}`} onClick={() => handleViewDetails(caseItem)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${getSeverityColor(caseItem.severity)} cyber-pulse`}>
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-red-400 font-mono text-lg">{caseItem.title}</h3>
                            <p className="text-sm text-gray-400 font-mono">CASE #{caseItem.id} - {caseItem.status?.toUpperCase()}</p>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 line-clamp-2 bg-black/30 p-3 rounded border border-red-500/20 font-mono">
                          {caseItem.description}
                        </p>

                        {/* Blockchain Transaction Data */}
                        {caseItem.transaction_hash && (
                          <div className="bg-black/30 rounded-lg p-3 mb-3 border border-red-500/20 font-mono">
                            <div className="flex items-center gap-2 mb-2">
                              <Hash className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400">Transaction Data</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">TX Hash:</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (caseItem.transaction_hash) window.open(`https://sepolia.scrollscan.com/tx/${caseItem.transaction_hash}`, '_blank'); }}
                                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                  title="View on ScrollScan"
                                >
                                  {caseItem.transaction_hash.slice(0, 10)}...{caseItem.transaction_hash.slice(-6)}
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              </div>
                              {caseItem.block_number && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Block:</span>
                                  <span className="text-green-400">#{caseItem.block_number}</span>
                                </div>
                              )}
                              {caseItem.gas_used && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Gas Used:</span>
                                  <span className="text-yellow-400">{parseFloat(caseItem.gas_used).toLocaleString()}</span>
                                </div>
                              )}
                              {caseItem.ticket_id && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Ticket ID:</span>
                                  <span className="text-purple-400">#{caseItem.ticket_id}</span>
                                </div>
                              )}
                            </div>
                            {caseItem.contract_address && (
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <span className="text-gray-400">Contract:</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (caseItem.contract_address) window.open(`https://sepolia.scrollscan.com/address/${caseItem.contract_address}`, '_blank'); }}
                                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                                  title="View Contract on ScrollScan"
                                >
                                  {caseItem.contract_address.slice(0, 6)}...{caseItem.contract_address.slice(-4)}
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pool Information for EVM Cases */}
                        {walletType === 'evm' && (
                          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-4 font-mono">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-red-400">
                                  <Coins className="h-4 w-4" />
                                  <span className="font-mono">Pool: {(Math.random() * 1000 + 500).toFixed(0)} CLT</span>
                                </div>
                                <div className="flex items-center gap-1 text-red-400">
                                  <Users className="h-4 w-4" />
                                  <span className="font-mono">Analysts: {Math.floor(Math.random() * 10 + 3)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-red-400">
                                  <TrendingUp className="h-4 w-4" />
                                  <span className="font-mono">APY: {(Math.random() * 20 + 15).toFixed(1)}%</span>
                                </div>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono">
                                STAKING ACTIVE
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {caseItem.client_name || 'Anonymous'}
                            </span>
                            {caseItem.client_wallet && (
                              <span className="flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                {caseItem.client_wallet.slice(0, 6)}...{caseItem.client_wallet.slice(-4)}
                              </span>
                            )}
                            {caseItem.assigned_analyst && (
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Analyst: {caseItem.assigned_analyst.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                          <span>{new Date(caseItem.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-4 text-red-400 border-red-500/30 hover:bg-red-900/20 font-mono"
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(caseItem); }}
                      >
                        🔍 ANALYZE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Detail Modal */}
      {selectedCaseId !== null && (
        <CaseDetailModal 
          caseItem={allCases.find(c => c.id === selectedCaseId)!} 
          isOpen={selectedCaseId !== null} 
          onClose={handleCloseModal} 
          walletType={walletType}
        />
      )}
    </div>
  );
}