import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Shield,
  AlertTriangle,
  Clock,
  User,
  Hash,
  ExternalLink,
  Coins,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Brain
} from "lucide-react";

interface CaseDetailModalProps {
  caseId: number;
  children?: React.ReactNode;
}

interface CaseDetail {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  client_name: string;
  contact_info: string;
  affected_systems?: string;
  attack_vectors?: string;
  evidence_urls?: string;
  ai_analysis?: string;
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

export default function CaseDetailModal({ caseId, children }: CaseDetailModalProps) {
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchCaseDetail = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/incident-reports/${caseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      const data = await response.json();
      setCaseDetail(data);
    } catch (error) {
      console.error('Error fetching case details:', error);
      toast({
        title: "Error",
        description: "Failed to load case details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && caseId) {
      fetchCaseDetail();
    }
  }, [isOpen, caseId]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="cyber-glass border-red-500/30">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-red-500/30">
        <DialogHeader>
          <DialogTitle className="text-red-400 text-xl font-mono flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Case #{caseId} - Security Incident Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="cyber-pulse">
              <Shield className="h-8 w-8 text-red-500 animate-spin" />
            </div>
          </div>
        ) : caseDetail ? (
          <div className="space-y-6">
            {/* Header Information */}
            <Card className="cyber-glass">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center justify-between">
                  <span>{caseDetail.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(caseDetail.severity)}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {caseDetail.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(caseDetail.status)}>
                      {getStatusIcon(caseDetail.status)}
                      <span className="ml-1">{caseDetail.status.replace('_', ' ').toUpperCase()}</span>
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{caseDetail.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-red-400" />
                      <span className="text-gray-400">Client:</span>
                      <span className="text-white">{caseDetail.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-400" />
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(caseDetail.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-400" />
                      <span className="text-gray-400">Updated:</span>
                      <span className="text-white">{new Date(caseDetail.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {caseDetail.client_wallet && (
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-red-400" />
                        <span className="text-gray-400">Wallet:</span>
                        <span className="text-white font-mono">{caseDetail.client_wallet.slice(0, 10)}...{caseDetail.client_wallet.slice(-6)}</span>
                      </div>
                    )}
                    {caseDetail.contact_info && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-400" />
                        <span className="text-gray-400">Contact:</span>
                        <span className="text-white">{caseDetail.contact_info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Transaction Information */}
            {caseDetail.transaction_hash && (
              <Card className="cyber-glass border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Blockchain Transaction Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 block mb-1">Transaction Hash:</span>
                        <button
                          onClick={() => window.open(`https://sepolia.scrollscan.com/tx/${caseDetail.transaction_hash}`, '_blank')}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-mono"
                          title="View on ScrollScan"
                        >
                          {caseDetail.transaction_hash}
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {caseDetail.block_number && (
                        <div>
                          <span className="text-gray-400 block mb-1">Block Number:</span>
                          <span className="text-green-400 font-mono">#{caseDetail.block_number}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {caseDetail.gas_used && (
                        <div>
                          <span className="text-gray-400 block mb-1">Gas Used:</span>
                          <span className="text-yellow-400 font-mono">{parseFloat(caseDetail.gas_used).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {caseDetail.ticket_id && (
                        <div>
                          <span className="text-gray-400 block mb-1">On-Chain Ticket ID:</span>
                          <span className="text-purple-400 font-mono">#{caseDetail.ticket_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {caseDetail.contract_address && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <span className="text-gray-400 block mb-1">Smart Contract:</span>
                      <button
                        onClick={() => window.open(`https://sepolia.scrollscan.com/address/${caseDetail.contract_address}`, '_blank')}
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors font-mono"
                        title="View Contract on ScrollScan"
                      >
                        {caseDetail.contract_address}
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseDetail.affected_systems && (
                <Card className="cyber-glass border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-orange-400 text-sm">Affected Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">{caseDetail.affected_systems}</p>
                  </CardContent>
                </Card>
              )}

              {caseDetail.attack_vectors && (
                <Card className="cyber-glass border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-red-400 text-sm">Attack Vectors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">{caseDetail.attack_vectors}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Assignment Information */}
            {(caseDetail.assigned_analyst || caseDetail.assigned_certifier) && (
              <Card className="cyber-glass border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Assignment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {caseDetail.assigned_analyst && (
                      <div>
                        <span className="text-gray-400 block mb-1">Assigned Analyst:</span>
                        <span className="text-blue-400 font-mono">{caseDetail.assigned_analyst}</span>
                      </div>
                    )}
                    {caseDetail.assigned_certifier && (
                      <div>
                        <span className="text-gray-400 block mb-1">Assigned Certifier:</span>
                        <span className="text-green-400 font-mono">{caseDetail.assigned_certifier}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {caseDetail.ai_analysis && (
              <Card className="cyber-glass border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Security Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{caseDetail.ai_analysis}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-400">Failed to load case details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}