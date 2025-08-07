
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock,
  User,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Wallet
} from "lucide-react";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
  userRole: string;
}

interface TicketDetails {
  id: number;
  title: string;
  description: string;
  severity: string;
  category: string;
  client_address: string;
  analyst_address?: string;
  transaction_hash?: string;
  block_number?: number;
  contract_address?: string;
  stake_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CaseDetailModal({ isOpen, onClose, caseData, userRole }: CaseDetailModalProps) {
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [analysisReport, setAnalysisReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && caseData?.id) {
      loadTicketDetails();
    }
  }, [isOpen, caseData]);

  const loadTicketDetails = async () => {
    setIsLoading(true);
    try {
      // Use the caseData directly since it already contains the ticket information
      if (caseData) {
        const ticketData: TicketDetails = {
          id: caseData.id,
          title: caseData.title,
          description: caseData.description,
          severity: caseData.severity,
          category: caseData.category || 'Security Incident',
          client_address: caseData.client_address || caseData.client_wallet,
          analyst_address: caseData.analyst_address || caseData.assigned_analyst,
          transaction_hash: caseData.transaction_hash,
          block_number: caseData.block_number,
          contract_address: caseData.contract_address,
          stake_amount: caseData.stake_amount || caseData.reward_amount || 0,
          status: caseData.status,
          created_at: caseData.created_at,
          updated_at: caseData.updated_at
        };
        setTicketDetails(ticketData);
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast({
        title: "Error",
        description: "Failed to load ticket details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnalysisReport = async () => {
    if (!analysisReport.trim()) {
      toast({
        title: "Error",
        description: "Please provide an analysis report",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const analystAddress = localStorage.getItem('connectedWallet');

      const response = await fetch(`/api/tickets/${caseData.id}/submit-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analyst_address: analystAddress,
          analysis_text: analysisReport,
          status: 'submitted'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit analysis report');
      }

      toast({
        title: "Success",
        description: "Analysis report submitted successfully!"
      });

      setAnalysisReport("");
      onClose();

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

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-500/20 text-blue-300';
      case 'assigned': return 'bg-yellow-500/20 text-yellow-300';
      case 'in_progress': return 'bg-purple-500/20 text-purple-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'validated': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (!ticketDetails && !isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-red-400">Error Loading Case</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-300">Failed to load case details. Please try again.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Case Details {ticketDetails && `#${ticketDetails.id}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading case details...</p>
          </div>
        ) : ticketDetails ? (
          <div className="space-y-6">
            {/* Case Overview */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">{ticketDetails.title}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getSeverityColor(ticketDetails.severity)}>
                    {ticketDetails.severity}
                  </Badge>
                  <Badge className={getStatusColor(ticketDetails.status)}>
                    {ticketDetails.status}
                  </Badge>
                  <Badge variant="outline" className="text-blue-300 border-blue-500/30">
                    {ticketDetails.category}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300">
                    {ticketDetails.stake_amount} CLT
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{ticketDetails.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Client:</span>
                    <p className="text-white font-mono">{ticketDetails.client_address}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-white">{new Date(ticketDetails.created_at).toLocaleString()}</p>
                  </div>
                  {ticketDetails.analyst_address && (
                    <div>
                      <span className="text-gray-400">Assigned Analyst:</span>
                      <p className="text-white font-mono">{ticketDetails.analyst_address}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Last Updated:</span>
                    <p className="text-white">{new Date(ticketDetails.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Data */}
            {(ticketDetails.transaction_hash || ticketDetails.contract_address || ticketDetails.block_number) && (
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Blockchain Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ticketDetails.transaction_hash && (
                    <div>
                      <span className="text-gray-400">Transaction Hash:</span>
                      <p className="text-white font-mono text-sm break-all">{ticketDetails.transaction_hash}</p>
                    </div>
                  )}
                  {ticketDetails.contract_address && (
                    <div>
                      <span className="text-gray-400">Contract Address:</span>
                      <p className="text-white font-mono text-sm">{ticketDetails.contract_address}</p>
                    </div>
                  )}
                  {ticketDetails.block_number && (
                    <div>
                      <span className="text-gray-400">Block Number:</span>
                      <p className="text-white">{ticketDetails.block_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analysis Section for Analysts */}
            {userRole === "analyst" && ticketDetails.status === "open" && (
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Submit Analysis Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={analysisReport}
                    onChange={(e) => setAnalysisReport(e.target.value)}
                    placeholder="Provide your detailed security analysis and recommendations..."
                    className="bg-slate-900/50 border-gray-600 min-h-[200px]"
                  />
                  <Button
                    onClick={submitAnalysisReport}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Analysis"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status Information */}
            <Card className="bg-slate-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-300 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Case Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white">Case Created</span>
                    <span className="text-gray-400 text-sm ml-auto">
                      {new Date(ticketDetails.created_at).toLocaleString()}
                    </span>
                  </div>

                  {ticketDetails.analyst_address && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-white">Analyst Assigned</span>
                      <span className="text-gray-400 text-sm ml-auto">
                        {ticketDetails.analyst_address.slice(0, 8)}...
                      </span>
                    </div>
                  )}

                  {ticketDetails.status === "completed" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white">Analysis Complete</span>
                      <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
