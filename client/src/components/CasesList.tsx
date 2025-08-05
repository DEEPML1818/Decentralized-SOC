import { useState } from "react";
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

  // Fetch real tickets/cases from API - real-time integration
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await fetch('/api/tickets');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch tickets`);
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Fetch incident reports from API
  const { data: incidentReports = [], isLoading: reportsLoading, error: reportsError, refetch: refetchIncidentReports } = useQuery({
    queryKey: ['incident-reports'],
    queryFn: async () => {
      const response = await fetch('/api/incident-reports');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch incident reports`);
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Combine tickets and incident reports
  const allCases = [...tickets, ...incidentReports];

  // Apply filters to combined cases
  const filteredCases = allCases.filter((caseItem: Case) => {
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
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <Shield className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleRefresh = () => {
    refetchTickets();
    refetchIncidentReports();
    toast({
      title: "Refreshing Cases",
      description: "Fetching latest case and incident report data...",
    });
  };

  const isLoading = ticketsLoading || reportsLoading;
  const error = ticketsError || reportsError;

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="cyber-glass bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Cases</h3>
            <p className="text-gray-300 mb-4">Failed to fetch case data from the system.</p>
            <Button onClick={handleRefresh} className="btn-cyber">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-500 mb-2 font-mono">
            Security Cases Management
          </h2>
          <p className="text-gray-300 text-sm">
            Real-time case tracking • {walletType.toUpperCase()} Network • {filteredCases.length} cases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-950/30"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="cyber-glass bg-red-900/10 border-red-500/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-red-500/30 text-red-100 placeholder:text-gray-500"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-black/50 border border-red-500/30 rounded-md text-red-100 text-sm"
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
              className="px-3 py-2 bg-black/50 border border-red-500/30 rounded-md text-red-100 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Filter className="h-4 w-4" />
              <span>{filteredCases.length} of {allCases.length} cases</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-300 mt-4">Loading real-time case data...</p>
          </div>
        </div>
      ) : filteredCases.length === 0 ? (
        <Card className="cyber-glass bg-yellow-900/10 border-yellow-500/30">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-400 mb-2">No Cases Found</h3>
            <p className="text-gray-300">
              {allCases.length === 0
                ? "No security cases have been submitted yet."
                : "No cases match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((caseItem: Case) => (
            <Card
              key={caseItem.id}
              className="cyber-glass bg-red-900/10 border-red-500/30 hover:border-red-400/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-red-400 mb-1 font-mono">
                          #{caseItem.id} {caseItem.title}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {caseItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getSeverityColor(caseItem.severity)}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {caseItem.severity?.toUpperCase()}
                      </Badge>

                      <Badge className={getStatusColor(caseItem.status)}>
                        {getStatusIcon(caseItem.status)}
                        <span className="ml-1">{caseItem.status?.replace('_', ' ').toUpperCase()}</span>
                      </Badge>

                      {caseItem.client_wallet && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          <Hash className="h-3 w-3 mr-1" />
                          {caseItem.client_wallet.slice(0, 6)}...{caseItem.client_wallet.slice(-4)}
                        </Badge>
                      )}

                      {caseItem.transaction_hash && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Tx: {caseItem.transaction_hash.slice(0, 6)}...
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="h-4 w-4" />
                        <span>Client: {caseItem.client_name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Created: {formatDate(caseItem.created_at)}</span>
                      </div>

                      {caseItem.assigned_analyst && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Shield className="h-4 w-4" />
                          <span>Analyst: {caseItem.assigned_analyst}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setSelectedCaseId(caseItem.id)}
                      size="sm"
                      className="btn-cyber whitespace-nowrap"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCaseId && (
        <CaseDetailModal
          caseId={selectedCaseId}
          isOpen={selectedCaseId !== null}
          onClose={() => setSelectedCaseId(null)}
          walletType={walletType}
        />
      )}
    </div>
  );
}