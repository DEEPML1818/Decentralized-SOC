import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
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
  Brain,
  TrendingUp,
  Users,
  Target,
  Upload,
  Send
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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
  priority: string;
  reportedBy?: string;
  createdAt: string;
}

interface PoolInfo {
  totalStaked: string;
  participantCount: number;
  rewardPool: string;
  stakingDeadline: string;
  analysisProgress: number;
}

export default function CaseDetailModal({ caseId, children }: CaseDetailModalProps) {
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isJoiningPool, setIsJoiningPool] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [hasJoinedPool, setHasJoinedPool] = useState(false);
  const [isAssigningAnalyst, setIsAssigningAnalyst] = useState(false);
  const { toast } = useToast();
  const { evmAddress, isEVMConnected } = useWallet();

  const fetchCaseDetail = async () => {
    if (!caseId) return;

    setLoading(true);
    try {
      // Try incident reports first, then tickets as fallback
      let response = await fetch(`/api/incident-reports/${caseId}`);

      if (!response.ok && response.status === 404) {
        // Fallback to tickets endpoint
        response = await fetch(`/api/tickets/${caseId}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch case details: ${response.status}`);
      }

      const data = await response.json();
      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load case details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const autoAssignAnalyst = async () => {
    if (!evmAddress || !caseId || !caseData) return;

    // Check if this is a client-created ticket and no analyst is assigned yet
    const isClientCreatedTicket = caseData.client_wallet === evmAddress;
    const hasAnalystAssigned = caseData.assigned_analyst && caseData.assigned_analyst !== "0x0000000000000000000000000000000000000000";

    if (isClientCreatedTicket && !hasAnalystAssigned) {
      setIsAssigningAnalyst(true);
      try {
        console.log(`Auto-assigning analyst for ticket ${caseId} to ${evmAddress}`);

        // Call the smart contract setAnalyst function
        await evmContractService.setAnalyst(caseId.toString(), evmAddress);

        // Also update our API
        try {
          await fetch(`/api/incident-reports/${caseId}/assign-analyst`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              analyst_address: evmAddress
            }),
          });
        } catch (apiError) {
          console.log('API assignment failed, but blockchain assignment succeeded');
        }

        // Refresh case data to show the assignment
        await fetchCaseDetail();

        toast({
          title: "Analyst Assigned",
          description: "You have been automatically assigned as the analyst for this ticket.",
        });

      } catch (error: any) {
        console.error('Error auto-assigning analyst:', error);
        if (!error.message.includes('user rejected') && !error.message.includes('Analyst already assigned')) {
          toast({
            title: "Assignment Info",
            description: "Could not auto-assign analyst. You can manually assign from the analyst page if needed.",
          });
        }
      } finally {
        setIsAssigningAnalyst(false);
      }
    }
  };

  const loadPoolInfo = async () => {
    if (!caseId) return;

    try {
      // Check if current user has joined the pool
      const hasJoined = evmAddress && caseData?.assigned_analyst === evmAddress;
      setHasJoinedPool(!!hasJoined);

      // Mock pool data - replace with actual contract calls
      const mockPoolInfo: PoolInfo = {
        totalStaked: "1250.50",
        participantCount: 8,
        rewardPool: "500.00",
        stakingDeadline: "2024-02-15",
        analysisProgress: hasJoined ? 85 : 65
      };
      setPoolInfo(mockPoolInfo);
    } catch (error) {
      console.error('Failed to load pool info:', error);
    }
  };

  const handleJoinSecurityPool = async () => {
    if (!evmAddress || !caseId) {
      toast({
        title: "Authentication Required",
        description: "Please connect your EVM wallet to join the security pool.",
        variant: "destructive",
      });
      return;
    }

    setIsJoiningPool(true);
    try {
      // Call API to assign analyst to the case
      const response = await fetch(`/api/incident-reports/${caseId}/assign-analyst`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyst_address: evmAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join security pool');
      }

      setHasJoinedPool(true);

      // Refresh case data
      await fetchCaseDetail();
      await loadPoolInfo();

      toast({
        title: "Successfully Joined Pool",
        description: "You are now assigned as the security analyst for this case.",
      });
    } catch (error) {
      console.error('Error joining security pool:', error);
      toast({
        title: "Failed to Join Pool",
        description: error instanceof Error ? error.message : "Unable to join security pool.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningPool(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) {
      toast({
        title: "Report Required",
        description: "Please enter your analysis report before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!evmAddress || !caseId) {
      toast({
        title: "Authentication Required",
        description: "Please connect your EVM wallet to submit the report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      // First submit the analysis report to our API
      const response = await fetch(`/api/incident-reports/${caseId}/submit-report`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyst_address: evmAddress,
          analysis_report: reportText,
          status: 'analyzed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // Now create the blockchain transaction to close the case
      toast({
        title: "Creating Blockchain Transaction",
        description: "Please confirm the transaction in MetaMask to close the case on-chain.",
      });

      // Call the smart contract validateTicket function
      const txResult = await evmContractService.validateTicket(caseId.toString());

      // Update the case with transaction details
      await fetch(`/api/incident-reports/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_hash: txResult.txHash,
          block_number: txResult.blockNumber,
          status: 'closed'
        }),
      });

      // Refresh case data
      await fetchCaseDetail();

      toast({
        title: "Case Closed Successfully! 🎉",
        description: `Your analysis has been validated on-chain. Transaction: ${txResult.txHash.slice(0, 8)}... You earned 100 CLT tokens!`,
      });

      // Clear the report text
      setReportText("");

    } catch (error) {
      console.error('Error submitting report:', error);
      let errorMessage = "Unable to submit analysis report.";

      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          errorMessage = "Transaction was cancelled by user.";
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient ETH balance for gas fees.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Failed to Submit Report",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  useEffect(() => {
    if (isOpen && caseId) {
      fetchCaseDetail();
      if (isEVMConnected) { // Only load pool info if EVM is connected
        loadPoolInfo();
      }
    }
  }, [isOpen, caseId, isEVMConnected]);

  // Auto-assign analyst when case data is loaded and user is connected
  useEffect(() => {
    if (caseData && evmAddress && isEVMConnected && !isAssigningAnalyst) {
      autoAssignAnalyst();
    }
  }, [caseData, evmAddress, isEVMConnected]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    switch (priority.toLowerCase()) {
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

  const hasAnalystAssigned = caseData?.assigned_analyst && caseData.assigned_analyst !== "0x0000000000000000000000000000000000000000";

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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-black border-red-500/30 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-3 font-mono">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-400 cyber-pulse" />
            </div>
            SECURITY CASE #{caseId} - CLASSIFIED
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-400"></div>
            <span className="ml-4 text-red-400 font-mono text-lg">ACCESSING CLASSIFIED DATA...</span>
          </div>
        ) : caseData ? (
          <div className="space-y-6">
            {/* Case Status Banner */}
            <div className="bg-gradient-to-r from-red-900/50 to-black border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-mono text-sm">STATUS:</span>
                    <Badge className={`${getStatusColor(caseData.status)} font-mono`}>
                      {caseData.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-mono text-sm">PRIORITY:</span>
                    <Badge className={`${getPriorityColor(caseData.priority)} font-mono`}>
                      {caseData.priority?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
                <div className="text-red-400 font-mono text-sm">
                  CASE ID: #{caseId}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Case Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Case Overview */}
                <Card className="bg-gray-900/50 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                      <FileText className="h-5 w-5" />
                      INCIDENT DETAILS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-red-400 text-sm font-mono">THREAT TYPE:</label>
                      <p className="text-white mt-1 bg-red-900/20 p-2 rounded border border-red-500/30">
                        {caseData.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-red-400 text-sm font-mono">DESCRIPTION:</label>
                      <p className="text-gray-300 mt-1 bg-gray-900/50 p-3 rounded border border-red-500/20">
                        {caseData.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-red-400 text-sm font-mono">REPORTED BY:</label>
                        <p className="text-white font-mono bg-red-900/20 p-2 rounded border border-red-500/30">
                          {caseData.reportedBy?.slice(0, 10)}...{caseData.reportedBy?.slice(-8)}
                        </p>
                      </div>
                      <div>
                        <label className="text-red-400 text-sm font-mono">TIMESTAMP:</label>
                        <p className="text-white font-mono bg-red-900/20 p-2 rounded border border-red-500/30">
                          {new Date(caseData.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Progress */}
                <Card className="bg-gray-900/50 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                      <Activity className="h-5 w-5" />
                      ANALYSIS PROGRESS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-mono">Analysis Completion</span>
                        <span className="text-red-400 font-mono">{poolInfo?.analysisProgress || 0}%</span>
                      </div>
                      <Progress
                        value={poolInfo?.analysisProgress || 0}
                        className="bg-gray-800 border border-red-500/30"
                      />
                      <div className="text-xs text-gray-400 font-mono">
                        Security analysts are currently reviewing this case
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Pool Information */}
              <div className="space-y-6">
                {isEVMConnected && poolInfo && (
                  <Card className="bg-red-900/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                        <Coins className="h-5 w-5" />
                        SECURITY POOL
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-black/50 p-3 rounded border border-red-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-sm font-mono">TOTAL STAKED</span>
                          </div>
                          <p className="text-white text-xl font-mono font-bold">
                            {poolInfo.totalStaked} CLT
                          </p>
                        </div>

                        <div className="bg-black/50 p-3 rounded border border-red-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-sm font-mono">PARTICIPANTS</span>
                          </div>
                          <p className="text-white text-xl font-mono font-bold">
                            {poolInfo.participantCount} Analysts
                          </p>
                        </div>

                        <div className="bg-black/50 p-3 rounded border border-red-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-sm font-mono">REWARD POOL</span>
                          </div>
                          <p className="text-white text-xl font-mono font-bold">
                            {poolInfo.rewardPool} CLT
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-red-500/30" />

                      <div>
                        <span className="text-red-400 text-sm font-mono">DEADLINE:</span>
                        <p className="text-white font-mono">
                          {new Date(poolInfo.stakingDeadline).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        onClick={handleJoinSecurityPool}
                        disabled={isJoiningPool || hasJoinedPool}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-mono disabled:opacity-50"
                      >
                        {isJoiningPool ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            JOINING...
                          </div>
                        ) : hasJoinedPool ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            JOINED POOL
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            JOIN SECURITY POOL
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Report Submission Section - Only show if analyst has joined */}
                {hasJoinedPool && isEVMConnected && (
                  <Card className="bg-red-900/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                        <FileText className="h-5 w-5" />
                        SUBMIT ANALYSIS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="analysis-report" className="text-red-400 font-mono text-sm">
                          SECURITY ANALYSIS REPORT
                        </Label>
                        <Textarea
                          id="analysis-report"
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          rows={6}
                          className="bg-black/50 border-red-500/30 text-white focus:border-red-400 font-mono text-sm mt-2"
                          placeholder="Enter your detailed security analysis, findings, recommendations, and threat assessment..."
                        />
                        <div className="text-xs text-gray-400 font-mono mt-1">
                          Min 50 characters required. Submitting will create a blockchain transaction to close the case.
                        </div>
                      </div>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-mono disabled:opacity-50"
                        onClick={handleSubmitReport}
                        disabled={isSubmittingReport || reportText.length < 50}
                      >
                        {isSubmittingReport ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            SUBMITTING REPORT...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            SUBMIT & CLOSE CASE ON-CHAIN
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                {evmAddress && !hasAnalystAssigned && (
                  <Button
                    onClick={handleJoinSecurityPool}
                    disabled={isJoiningPool}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-mono"
                  >
                    {isJoiningPool ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ASSIGNING & JOINING...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        BECOME ANALYST & JOIN POOL
                      </div>
                    )}
                  </Button>
                )}

                {hasAnalystAssigned && caseData.assigned_analyst === evmAddress && (
                  <div className="text-center p-4 bg-green-900/20 border border-green-600 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-green-400 font-mono">
                      <CheckCircle className="h-5 w-5" />
                      YOU ARE THE ASSIGNED ANALYST
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 font-mono mb-2">ACCESS DENIED</h3>
            <p className="text-gray-400 font-mono">Security case data is classified</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}