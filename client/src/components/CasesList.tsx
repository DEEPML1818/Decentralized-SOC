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
  Lock
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

  // Fetch incident reports (cases) from the database
  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['/api/incident-reports'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Fetch tickets from the database  
  const { data: tickets = [] } = useQuery({
    queryKey: ['/api/tickets'],
    refetchInterval: 5000,
  });

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
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
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
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Previously Opened Cases
            <Badge variant="outline" className="ml-2 text-blue-400 border-blue-500/30">
              {walletType.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-300">
            View and manage all security incidents and tickets in the dSOC network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases by title, description, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 transition-colors"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {isLoading ? 'Loading...' : `${filteredCases.length} case${filteredCases.length !== 1 ? 's' : ''} found`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-400">Loading cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm ? 'No cases match your search' : 'No cases found'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Cases will appear here once incident reports are submitted
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredCases.map((caseItem: Case) => (
                <Card key={caseItem.id} className="bg-gray-800/50 border-gray-600 hover:border-gray-500 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white">{caseItem.title}</h3>
                          <Badge className={getSeverityColor(caseItem.severity)}>
                            {caseItem.severity || 'Medium'}
                          </Badge>
                          <Badge className={getStatusColor(caseItem.status)} variant="outline">
                            {getStatusIcon(caseItem.status)}
                            <span className="ml-1">{caseItem.status || 'Pending'}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {caseItem.description}
                        </p>
                        
                        {/* Blockchain Transaction Data */}
                        {caseItem.transaction_hash && (
                          <div className="bg-gray-800/30 rounded p-3 mb-3 border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Hash className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400">Blockchain Transaction</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">TX Hash:</span>
                                <button
                                  onClick={() => {
                                    if (caseItem.transaction_hash) {
                                      window.open(`https://sepolia.scrollscan.com/tx/${caseItem.transaction_hash}`, '_blank');
                                    }
                                  }}
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
                                  onClick={() => {
                                    if (caseItem.contract_address) {
                                      window.open(`https://sepolia.scrollscan.com/address/${caseItem.contract_address}`, '_blank');
                                    }
                                  }}
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
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {caseItem.client_name || 'Anonymous'}
                            </span>
                            {caseItem.client_wallet && (
                              <span className="flex items-center gap-1">
                                <Coins className="h-3 w-3" />
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
                        className="ml-4 text-gray-300 hover:text-white border-gray-600 hover:border-gray-500"
                        onClick={() => {
                          toast({
                            title: "Case Details",
                            description: `Viewing case: ${caseItem.title}`,
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}