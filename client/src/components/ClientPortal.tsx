import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { evmContractService } from '@/lib/evm-contract';
import { Shield, AlertTriangle, Send, Coins } from 'lucide-react';
import axios from 'axios';

export default function ClientPortal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    affected_systems: '',
    attack_vectors: '',
    evidence_urls: '',
    contact_info: '',
    clt_amount: '100'
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.contact_info) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Connect wallet and get address
      const walletAddress = await evmContractService.connectWallet();
      
      // Step 2: Get CLT balance and mint if needed
      const balance = await evmContractService.getCLTBalance(walletAddress);
      const requiredAmount = parseFloat(formData.clt_amount);
      
      if (balance < requiredAmount) {
        toast({
          title: "Minting CLT Tokens",
          description: `Insufficient balance. Minting ${requiredAmount - balance} CLT tokens...`,
        });
        
        await evmContractService.mintCLT(walletAddress, (requiredAmount - balance + 10).toString());
      }

      // Step 3: Approve CLT spending
      await evmContractService.approveCLT(requiredAmount.toString());

      // Step 4: Create incident report in IPFS first
      const incidentData = {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        client_name: "Client Portal User",
        contact_info: formData.contact_info,
        client_wallet: walletAddress,
        affected_systems: formData.affected_systems,
        attack_vectors: formData.attack_vectors,
        evidence_urls: formData.evidence_urls,
        ai_analysis: `Client-submitted security incident: ${formData.title}. Requires analyst review and validation.`,
        transaction_hash: null, // Will be updated after blockchain transaction
        block_number: null,
        contract_address: null
      };

      console.log('📝 Creating incident report in IPFS:', incidentData);
      const ipfsResponse = await axios.post('/api/incident-reports', incidentData);
      
      toast({
        title: "IPFS Storage Complete",
        description: `Incident report stored with ID: ${ipfsResponse.data.id}`,
      });

      // Step 5: Create ticket on blockchain
      toast({
        title: "Creating Blockchain Ticket",
        description: "Submitting transaction to SOCService contract...",
      });

      const result = await evmContractService.createTicket(
        formData.title,
        requiredAmount.toString()
      );

      // Step 6: Update incident report with blockchain transaction details
      await axios.patch(`/api/incident-reports/${ipfsResponse.data.id}`, {
        transaction_hash: result.hash,
        block_number: result.blockNumber,
        contract_address: evmContractService.getSOCServiceAddress()
      });

      toast({
        title: "Case Submitted Successfully!",
        description: `Ticket created with hash: ${result.hash.substring(0, 10)}... - Case ID: ${ipfsResponse.data.id}`,
        variant: "default"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        affected_systems: '',
        attack_vectors: '',
        evidence_urls: '',
        contact_info: '',
        clt_amount: '100'
      });

    } catch (error: any) {
      console.error('Case submission failed:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold">Client Security Portal</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Submit security incidents for expert analysis. Your case will be stored on IPFS and processed by certified security analysts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Submit Security Incident
          </CardTitle>
          <CardDescription>
            Fill out all details about your security incident. This information will be stored on IPFS and create a blockchain ticket for analyst assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Smart Contract Vulnerability in DEX Protocol"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a comprehensive description of the security incident, including what happened, when it occurred, and any immediate impact..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="affected_systems">Affected Systems</Label>
              <Input
                id="affected_systems"
                placeholder="e.g., Trading Protocol, Oracle, Bridge Contract"
                value={formData.affected_systems}
                onChange={(e) => handleInputChange('affected_systems', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attack_vectors">Attack Vectors</Label>
              <Input
                id="attack_vectors"
                placeholder="e.g., Flash Loan, Reentrancy, Oracle Manipulation"
                value={formData.attack_vectors}
                onChange={(e) => handleInputChange('attack_vectors', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence_urls">Evidence URLs</Label>
            <Input
              id="evidence_urls"
              placeholder="Transaction hashes, contract addresses, or other evidence (comma-separated)"
              value={formData.evidence_urls}
              onChange={(e) => handleInputChange('evidence_urls', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_info">Contact Information *</Label>
              <Input
                id="contact_info"
                placeholder="Your email or preferred contact method"
                value={formData.contact_info}
                onChange={(e) => handleInputChange('contact_info', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clt_amount">CLT Reward Amount</Label>
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <Input
                  id="clt_amount"
                  type="number"
                  placeholder="100"
                  value={formData.clt_amount}
                  onChange={(e) => handleInputChange('clt_amount', e.target.value)}
                  min="10"
                  max="10000"
                />
                <span className="text-sm text-gray-500">CLT</span>
              </div>
              <p className="text-xs text-gray-500">
                Higher rewards attract more experienced analysts (5% dev fee applies)
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Security Case
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>• Your case will be stored on IPFS for decentralized access</p>
            <p>• A blockchain ticket will be created for transparent tracking</p>
            <p>• Certified analysts will be notified for assignment</p>
            <p>• You'll receive updates on case progress and resolution</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}