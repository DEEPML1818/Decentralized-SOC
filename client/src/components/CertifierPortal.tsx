import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { evmContractService } from '@/lib/evm-contract';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Award,
  Clock,
  ExternalLink,
  Coins
} from 'lucide-react';
import axios from 'axios';

interface IncidentReport {
  id: number;
  title: string;
  description: string;
  severity: string;
  client_name: string;
  assigned_analyst: string | null;
  assigned_certifier: string | null;
  ai_analysis: string;
  affected_systems: string;
  attack_vectors: string;
  evidence_urls: string;
  transaction_hash: string;
  ticket_id: number;
  status: string;
  created_at: string;
}

export default function CertifierPortal() {
  const [cases, setCases] = useState<IncidentReport[]>([]);
  const [selectedCase, setSelectedCase] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    loadCases();
    connectWallet();
    
    // Auto-refresh every 10 seconds to catch newly analyzed cases
    const interval = setInterval(loadCases, 10000);
    return () => clearInterval(interval);
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
      console.log('📥 Loading analyzed cases from IPFS storage...');
      const response = await axios.get('/api/incident-reports');
      
      // Filter for cases that have analyst reports and are ready for validation
      const analyzedCases = response.data.filter((item: IncidentReport) => 
        item.assigned_analyst && 
        (item.ai_analysis || item.status === 'analyzed') && 
        !['validated', 'completed'].includes(item.status)
      );
      
      console.log('📊 IPFS analyzed cases ready for certification:', analyzedCases.length);
      setCases(analyzedCases);
      
      toast({
        title: "IPFS Data Loaded",
        description: `Loaded ${analyzedCases.length} analyzed cases from decentralized storage`,
      });
    } catch (error) {
      console.error('Failed to load analyzed cases from IPFS:', error);
      toast({
        title: "IPFS Load Failed",
        description: "Failed to load analyzed cases from IPFS decentralized storage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignAsCertifier = async (caseItem: IncidentReport) => {
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
      // Ensure contract service is connected
      try {
        await evmContractService.connectWallet();
        console.log('✅ EVM contract service connected for certifier assignment');
      } catch (error) {
        console.error('❌ Failed to connect EVM contract service:', error);
      }

      // Step 1: Assign as certifier on blockchain
      toast({
        title: "🔄 MetaMask Transaction",
        description: "Please confirm certifier assignment in MetaMask...",
      });

      console.log(`🔗 Starting assignAsCertifier transaction for ticket_id: ${caseItem.ticket_id}`);
      const txResult = await evmContractService.assignAsCertifier(caseItem.ticket_id);
      console.log('✅ Certifier assignment transaction completed:', txResult);

      toast({
        title: "✅ Blockchain Transaction Confirmed",
        description: `TX Hash: ${txResult.txHash?.slice(0, 10)}...`,
        variant: "default"
      });

      // Step 2: Update IPFS record
      await axios.patch(`/api/incident-reports/${caseItem.id}`, {
        assigned_certifier: walletAddress,
        status: 'certifier_assigned',
        transaction_hash: txResult.txHash
      });

      toast({
        title: "🔗 Certifier Assignment Complete!",
        description: `You are now assigned as certifier for case #${caseItem.id}`,
        variant: "default"
      });

      // Refresh cases and select this one
      await loadCases();
      setSelectedCase(caseItem);

    } catch (error: any) {
      console.error('❌ Certifier assignment failed:', error);
      let errorMessage = "Failed to assign as certifier";
      
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message) {
        errorMessage = `Transaction failed: ${error.message}`;
      }

      toast({
        title: "❌ Certifier Assignment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const validateTicket = async () => {
    if (!selectedCase) return;

    setIsValidating(true);

    try {
      // Ensure contract service is connected
      try {
        await evmContractService.connectWallet();
        console.log('✅ EVM contract service connected for validation');
      } catch (error) {
        console.error('❌ Failed to connect EVM contract service:', error);
      }

      // Step 1: Validate ticket on blockchain (earns 100 CLT reward)
      toast({
        title: "🔄 MetaMask Validation",
        description: "Please confirm ticket validation in MetaMask...",
      });

      console.log(`🔗 Starting validateTicket transaction for ticket_id: ${selectedCase.ticket_id}`);
      const txResult = await evmContractService.validateTicket(selectedCase.ticket_id);
      console.log('✅ Ticket validation transaction completed:', txResult);

      toast({
        title: "✅ Validation Transaction Confirmed",
        description: `TX Hash: ${txResult.txHash?.slice(0, 10)}...`,
        variant: "default"
      });

      // Step 2: Update IPFS record as completed
      await axios.patch(`/api/incident-reports/${selectedCase.id}`, {
        status: 'validated',
        validation_transaction_hash: txResult.txHash
      });

      toast({
        title: "🎉 Case Validation Complete!",
        description: "Case validated successfully! You earned 100 CLT tokens as reward.",
        variant: "default"
      });

      // Refresh cases
      await loadCases();
      setSelectedCase(null);

    } catch (error: any) {
      console.error('❌ Validation failed:', error);
      let errorMessage = "Failed to validate case";
      
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message) {
        errorMessage = `Transaction failed: ${error.message}`;
      }

      toast({
        title: "❌ Validation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
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

  const getStatusIcon = (status: string, assigned_certifier: string | null) => {
    if (assigned_certifier === walletAddress) return <ShieldCheck className="h-4 w-4 text-blue-500" />;
    if (assigned_certifier) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading analyzed cases from IPFS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <ShieldCheck className="h-12 w-12 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold">Security Certifier Portal</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Review analyst reports from IPFS, validate security analysis, and complete case resolution with blockchain verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Cases Ready for Validation ({cases.length})
            </CardTitle>
            <CardDescription>
              Analyzed cases from IPFS awaiting certifier validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {cases.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No cases ready for validation</p>
            ) : (
              cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCase?.id === caseItem.id 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(caseItem.status, caseItem.assigned_certifier)}
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

                  <div className="mt-2 text-xs">
                    <span className="text-green-600">
                      Analyst: {caseItem.assigned_analyst?.substring(0, 10)}...
                    </span>
                    {caseItem.assigned_certifier && (
                      <span className="text-purple-600 ml-3">
                        Certifier: {caseItem.assigned_certifier.substring(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Case Details and Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Case Validation
            </CardTitle>
            <CardDescription>
              Review analyst report and validate case resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCase ? (
              <p className="text-center text-gray-500 py-8">Select a case to review analyst report</p>
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
                  <Label className="font-medium">Original Description</Label>
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

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <Label className="font-medium text-blue-700 dark:text-blue-400">
                    Analyst Security Report
                  </Label>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedCase.ai_analysis}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Analyzed by: {selectedCase.assigned_analyst?.substring(0, 10)}...
                  </p>
                </div>

                {selectedCase.evidence_urls && (
                  <div>
                    <Label className="font-medium">Evidence Links</Label>
                    <div className="text-sm text-blue-600 mt-1 flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>{selectedCase.evidence_urls}</span>
                    </div>
                  </div>
                )}

                {/* Certification Action */}
                {!selectedCase.assigned_certifier ? (
                  <Button 
                    onClick={() => assignAsCertifier(selectedCase)}
                    disabled={isAssigning}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAssigning ? "Assigning..." : "Assign Myself as Certifier"}
                  </Button>
                ) : selectedCase.assigned_certifier === walletAddress ? (
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-sm text-purple-700 dark:text-purple-400">
                        ✓ You are assigned as certifier for this case
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Coins className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          Validation Reward: 100 CLT Tokens
                        </span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Validate this case to mark it as solved and earn your reward
                      </p>
                    </div>

                    <Button 
                      onClick={validateTicket}
                      disabled={isValidating}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isValidating ? (
                        "Validating..."
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Validate Case & Mark as Solved
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Already assigned to another certifier
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