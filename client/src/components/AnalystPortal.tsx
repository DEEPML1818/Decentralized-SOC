import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { evmContractService } from '@/lib/evm-contract';
import { 
  Search, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User,
  Zap,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';

interface IncidentReport {
  id: number;
  title: string;
  description: string;
  severity: string;
  client_name: string;
  contact_info: string;
  client_wallet: string;
  affected_systems: string;
  attack_vectors: string;
  evidence_urls: string;
  ai_analysis: string;
  assigned_analyst: string | null;
  transaction_hash: string;
  block_number: number;
  created_at: string;
  ticket_id: number;
  status: string;
}

export default function AnalystPortal() {
  const [cases, setCases] = useState<IncidentReport[]>([]);
  const [selectedCase, setSelectedCase] = useState<IncidentReport | null>(null);
  const [analystReport, setAnalystReport] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    loadCases();
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const address = await evmContractService.connectWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const loadCases = async () => {
    try {
      console.log('📥 Loading cases from IPFS storage...');
      const response = await axios.get('/api/incident-reports');
      console.log('📊 IPFS cases loaded:', response.data.length, 'incidents');
      setCases(response.data);
      
      toast({
        title: "IPFS Data Loaded",
        description: `Loaded ${response.data.length} cases from decentralized storage`,
      });
    } catch (error) {
      console.error('Failed to load cases from IPFS:', error);
      toast({
        title: "IPFS Load Failed",
        description: "Failed to load cases from IPFS decentralized storage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignAsAnalyst = async (caseItem: IncidentReport) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);

    try {
      // Convert case ID to ticket ID (arrays start from 0, so case 1 = ticket 0)
      const ticketId = caseItem.id - 1;
      console.log(`🔗 Assigning as analyst for case: ${caseItem.id} ticket_id: ${ticketId}`);

      // Call blockchain assignAsAnalyst function
      const txResult = await evmContractService.assignAsAnalyst(ticketId);
      console.log('✅ Blockchain assignment successful:', txResult);

      // Update IPFS record with wallet address
      await axios.patch(`/api/incident-reports/${caseItem.id}`, {
        assigned_analyst: walletAddress,
        status: 'assigned'
      });

      toast({
        title: "🔗 Assigned as Analyst",
        description: `Case #${caseItem.id} assigned to ${walletAddress.substring(0, 10)}...`,
        variant: "default"
      });

      // Refresh cases and select this one
      await loadCases();
      setSelectedCase(caseItem);

    } catch (error: any) {
      console.error('Assignment failed:', error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Transaction failed",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const submitAnalystReport = async () => {
    if (!selectedCase || !analystReport.trim()) {
      toast({
        title: "Missing Report",
        description: "Please write your analysis report",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReport(true);

    try {
      // Store analyst report in IPFS
      toast({
        title: "Storing Report",
        description: "Saving analysis to IPFS...",
      });

      console.log('📊 Storing analyst report for case ID:', selectedCase.id);
      console.log('📝 Report content length:', analystReport.length, 'characters');
      
      await axios.patch(`/api/incident-reports/${selectedCase.id}`, {
        ai_analysis: analystReport,
        status: 'analyzed',
        analyst_address: walletAddress
      });

      toast({
        title: "Report Submitted!",
        description: "Your analysis has been stored on IPFS and is ready for certifier validation",
        variant: "default"
      });

      // Clear form and refresh
      setAnalystReport('');
      await loadCases();

    } catch (error: any) {
      console.error('Report submission failed:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string, assigned_analyst: string | null) => {
    if (assigned_analyst === walletAddress) return <User className="h-4 w-4 text-blue-500" />;
    if (assigned_analyst) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading cases from IPFS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Search className="h-12 w-12 text-green-500 mr-3" />
          <h1 className="text-3xl font-bold">Security Analyst Portal</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Review security incidents stored on IPFS, assign yourself to cases, and submit detailed analysis reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Available Cases ({cases.length})
            </CardTitle>
            <CardDescription>
              Cases loaded from IPFS decentralized storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {cases.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No cases available in IPFS</p>
            ) : (
              cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCase?.id === caseItem.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(caseItem.status, caseItem.assigned_analyst)}
                      <h3 className="font-medium text-sm">{caseItem.title}</h3>
                    </div>
                    <Badge className={`text-white ${getSeverityColor(caseItem.severity)}`}>
                      {caseItem.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    Case #{caseItem.id} • Ticket #{caseItem.ticket_id}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {caseItem.description}
                  </p>

                  {caseItem.assigned_analyst && (
                    <div className="mt-2 text-xs text-blue-600">
                      Assigned: {caseItem.assigned_analyst.substring(0, 10)}...
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Case Details and Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Case Analysis
            </CardTitle>
            <CardDescription>
              Review case details and submit your security analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCase ? (
              <p className="text-center text-gray-500 py-8">Select a case to view details</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedCase.title}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Severity:</span>
                      <Badge className={`ml-2 text-white ${getSeverityColor(selectedCase.severity)}`}>
                        {selectedCase.severity}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Case ID:</span> #{selectedCase.id}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {selectedCase.description}
                  </p>
                </div>

                {selectedCase.affected_systems && (
                  <div>
                    <Label className="font-medium">Affected Systems</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {selectedCase.affected_systems}
                    </p>
                  </div>
                )}

                {selectedCase.attack_vectors && (
                  <div>
                    <Label className="font-medium">Attack Vectors</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {selectedCase.attack_vectors}
                    </p>
                  </div>
                )}

                {selectedCase.evidence_urls && (
                  <div>
                    <Label className="font-medium">Evidence</Label>
                    <div className="text-sm text-blue-600 mt-1 flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>{selectedCase.evidence_urls}</span>
                    </div>
                  </div>
                )}

                {/* Assignment Action */}
                {!selectedCase.assigned_analyst ? (
                  <Button 
                    onClick={() => assignAsAnalyst(selectedCase)}
                    disabled={isAssigning}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isAssigning ? "Assigning..." : "Assign as Analyst"}
                  </Button>
                ) : selectedCase.assigned_analyst === walletAddress ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        ✓ You are assigned to this case
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="analyst-report">Your Analysis Report</Label>
                      <Textarea
                        id="analyst-report"
                        placeholder="Provide your detailed security analysis, vulnerability assessment, recommendations, and findings..."
                        value={analystReport}
                        onChange={(e) => setAnalystReport(e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                    </div>

                    <Button 
                      onClick={submitAnalystReport}
                      disabled={isSubmittingReport || !analystReport.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmittingReport ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Submit Analysis Report
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Already assigned to another analyst
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}