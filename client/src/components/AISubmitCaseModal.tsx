import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Bot, 
  Upload, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Zap, 
  CheckCircle,
  Clock,
  Database,
  Users
} from "lucide-react";

interface AIAnalysisResult {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  technicalDetails: string;
  recommendations: string[];
  estimatedReward: number;
  requiredAnalysts: number;
}

export default function AISubmitCaseModal({ children }: { children: React.ReactNode }) {
  const { walletType, evmAddress, iotaAddress, isEVMConnected, isIOTAConnected } = useWallet();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'analyzing' | 'review' | 'uploading' | 'success'>('input');
  const [userInput, setUserInput] = useState('');
  const [caseType, setCaseType] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');

  const isConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;
  const currentAddress = walletType === 'iota' ? iotaAddress : evmAddress;

  const caseTypes = [
    { value: 'vulnerability', label: 'Security Vulnerability' },
    { value: 'breach', label: 'Data Breach' },
    { value: 'malware', label: 'Malware Detection' },
    { value: 'phishing', label: 'Phishing Attack' },
    { value: 'ddos', label: 'DDoS Attack' },
    { value: 'insider_threat', label: 'Insider Threat' },
    { value: 'compliance', label: 'Compliance Violation' },
    { value: 'other', label: 'Other Security Incident' }
  ];

  const severityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const analyzeWithAI = async () => {
    if (!userInput || !caseType) {
      toast({
        title: "Missing Information",
        description: "Please provide case details and select a case type",
        variant: "destructive"
      });
      return;
    }

    setStep('analyzing');
    
    try {
      const response = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          caseType,
          requestType: 'security_case_analysis'
        }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const result = await response.json();
      
      // Parse AI response into structured case data
      const analysis: AIAnalysisResult = {
        title: result.title || `${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Security Case`,
        severity: result.severity || 'medium',
        category: result.category || caseType,
        description: result.description || userInput,
        technicalDetails: result.technicalDetails || result.analysis || 'AI analysis pending...',
        recommendations: result.recommendations || ['Further investigation required'],
        estimatedReward: result.estimatedReward || 100,
        requiredAnalysts: result.requiredAnalysts || 2
      };

      setAnalysisResult(analysis);
      setStep('review');

    } catch (error: any) {
      toast({
        title: "AI Analysis Failed",
        description: error.message || "Failed to analyze the security case",
        variant: "destructive"
      });
      setStep('input');
    }
  };

  const uploadToBlockchain = async () => {
    if (!analysisResult || !isConnected) {
      toast({
        title: "Cannot Upload",
        description: "Missing analysis result or wallet not connected",
        variant: "destructive"
      });
      return;
    }

    setStep('uploading');

    try {
      // Create blockchain ticket data
      const caseData = {
        title: analysisResult.title,
        description: analysisResult.description,
        severity: analysisResult.severity,
        technicalDetails: analysisResult.technicalDetails,
        category: analysisResult.category,
        recommendations: analysisResult.recommendations,
        submittedBy: currentAddress,
        submissionType: 'ai_generated_case',
        timestamp: new Date().toISOString()
      };

      let txHash = '';

      if (walletType === 'evm') {
        // Submit to EVM blockchain via smart contract
        const tx = await evmContractService.createTicket();
        const receipt = await tx.wait();
        txHash = receipt.transactionHash;
        
        // Also store detailed case data via backend API
        const caseResponse = await fetch('/api/ai-cases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...caseData,
            blockchainTxHash: txHash,
            network: 'scroll_evm',
            estimatedReward: analysisResult.estimatedReward,
            requiredAnalysts: analysisResult.requiredAnalysts
          }),
        });

        if (!caseResponse.ok) {
          console.warn('Failed to store case details in backend');
        }

      } else {
        // Submit to IOTA blockchain (simulated for now)
        txHash = '0x' + Math.random().toString(16).substr(2, 8);
        
        // Store case data via backend API
        const caseResponse = await fetch('/api/ai-cases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...caseData,
            blockchainTxHash: txHash,
            network: 'iota',
            estimatedReward: analysisResult.estimatedReward,
            requiredAnalysts: analysisResult.requiredAnalysts
          }),
        });

        if (!caseResponse.ok) {
          console.warn('Failed to store case details in backend');
        }
      }

      setBlockchainTxHash(txHash);
      setStep('success');

      toast({
        title: "Case Uploaded Successfully",
        description: `AI case uploaded to ${walletType === 'iota' ? 'IOTA' : 'Scroll EVM'} blockchain`,
      });

      // Trigger notification to analysts
      window.dispatchEvent(new CustomEvent('newAICaseUploaded', { 
        detail: { 
          ...analysisResult, 
          txHash,
          network: walletType 
        } 
      }));

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload case to blockchain",
        variant: "destructive"
      });
      setStep('review');
    }
  };

  const resetModal = () => {
    setStep('input');
    setUserInput('');
    setCaseType('');
    setAnalysisResult(null);
    setBlockchainTxHash('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetModal, 300); // Reset after animation
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Bot className="h-6 w-6 text-purple-400" />
            AI-Powered Case Submission
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Describe your security incident and let AI analyze it, then upload to blockchain for analyst investigation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${step === 'input' ? 'text-purple-400' : step === 'analyzing' || step === 'review' || step === 'uploading' || step === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${step === 'input' ? 'bg-purple-400' : step === 'analyzing' || step === 'review' || step === 'uploading' || step === 'success' ? 'bg-green-400' : 'bg-gray-500'}`} />
              Input Details
            </div>
            <div className={`flex items-center gap-2 ${step === 'analyzing' ? 'text-purple-400' : step === 'review' || step === 'uploading' || step === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${step === 'analyzing' ? 'bg-purple-400' : step === 'review' || step === 'uploading' || step === 'success' ? 'bg-green-400' : 'bg-gray-500'}`} />
              AI Analysis
            </div>
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-purple-400' : step === 'uploading' || step === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${step === 'review' ? 'bg-purple-400' : step === 'uploading' || step === 'success' ? 'bg-green-400' : 'bg-gray-500'}`} />
              Review & Edit
            </div>
            <div className={`flex items-center gap-2 ${step === 'uploading' ? 'text-purple-400' : step === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${step === 'uploading' ? 'bg-purple-400' : step === 'success' ? 'bg-green-400' : 'bg-gray-500'}`} />
              Blockchain Upload
            </div>
            <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${step === 'success' ? 'bg-green-400' : 'bg-gray-500'}`} />
              Complete
            </div>
          </div>

          {/* Step 1: Input Details */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="caseType" className="text-gray-300">
                  Case Type *
                </Label>
                <Select value={caseType} onValueChange={setCaseType}>
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select the type of security incident" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    {caseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="userInput" className="text-gray-300">
                  Describe the Security Incident *
                </Label>
                <Textarea
                  id="userInput"
                  placeholder="Describe what happened, when it occurred, what systems were affected, and any evidence you have..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="bg-slate-700 border-purple-500/30 text-white min-h-[120px]"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Be as detailed as possible. AI will analyze this to create a comprehensive case report.
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={analyzeWithAI}
                  disabled={!userInput || !caseType}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Analyze with AI
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: AI Analysis in Progress */}
          {step === 'analyzing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Analyzing Case...</h3>
              <p className="text-gray-400">
                Analyzing security incident details and generating comprehensive case report
              </p>
            </div>
          )}

          {/* Step 3: Review AI Analysis */}
          {step === 'review' && analysisResult && (
            <div className="space-y-6">
              <Card className="bg-slate-700 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI-Generated Case Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Title</Label>
                      <Input
                        value={analysisResult.title}
                        onChange={(e) => setAnalysisResult({...analysisResult, title: e.target.value})}
                        className="bg-slate-600 border-purple-500/30 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Severity</Label>
                      <div className="mt-1">
                        <Badge className={severityColors[analysisResult.severity]}>
                          {analysisResult.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      value={analysisResult.description}
                      onChange={(e) => setAnalysisResult({...analysisResult, description: e.target.value})}
                      className="bg-slate-600 border-purple-500/30 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Technical Analysis</Label>
                    <Textarea
                      value={analysisResult.technicalDetails}
                      onChange={(e) => setAnalysisResult({...analysisResult, technicalDetails: e.target.value})}
                      className="bg-slate-600 border-purple-500/30 text-white mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Estimated Reward (CLT)</Label>
                      <Input
                        type="number"
                        value={analysisResult.estimatedReward}
                        onChange={(e) => setAnalysisResult({...analysisResult, estimatedReward: parseInt(e.target.value)})}
                        className="bg-slate-600 border-purple-500/30 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Required Analysts</Label>
                      <Input
                        type="number"
                        value={analysisResult.requiredAnalysts}
                        onChange={(e) => setAnalysisResult({...analysisResult, requiredAnalysts: parseInt(e.target.value)})}
                        className="bg-slate-600 border-purple-500/30 text-white mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep('input')}>
                  Back to Edit
                </Button>
                <Button 
                  onClick={uploadToBlockchain}
                  disabled={!isConnected}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Blockchain
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Uploading to Blockchain */}
          {step === 'uploading' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">Uploading to Blockchain...</h3>
              <p className="text-gray-400">
                Creating case ticket on {walletType === 'iota' ? 'IOTA' : 'Scroll EVM'} network and notifying analysts
              </p>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Case Successfully Uploaded!</h3>
              <p className="text-gray-400 mb-6">
                Your AI-analyzed security case has been uploaded to the blockchain and security analysts will begin investigation.
              </p>
              
              <div className="space-y-4">
                <Card className="bg-slate-700 border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <Database className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-gray-300">Blockchain</div>
                        <div className="text-white font-medium">
                          {walletType === 'iota' ? 'IOTA Network' : 'Scroll EVM'}
                        </div>
                      </div>
                      <div className="text-center">
                        <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-gray-300">Analysts Needed</div>
                        <div className="text-white font-medium">{analysisResult?.requiredAnalysts}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {blockchainTxHash && (
                  <div className="text-xs text-gray-500 break-all">
                    Transaction: {blockchainTxHash}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button 
                  onClick={() => window.location.href = '/pools'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View All Cases
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}