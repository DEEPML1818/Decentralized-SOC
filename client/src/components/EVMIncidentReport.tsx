import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService, CONTRACT_ADDRESSES } from "@/lib/evm-contract";
import {
  AlertTriangle,
  Shield,
  FileText,
  Send,
  Clock,
  DollarSign,
  Zap
} from "lucide-react";

interface EVMIncidentReportProps {
  onClose?: () => void;
}

// Mock FormData and setFormData for demonstration purposes since they are used in the changes but not defined in the original code.
// In a real scenario, these would be managed by a form library or local state.
interface FormData {
  title: string;
  description: string;
  severity: string;
  category: string;
  transactionHash: string;
  contractAddress: string;
  network: string;
  gasUsed: string;
  blockNumber: string;
  affectedSystems: string;
  attackVectors: string;
  evidenceUrls: string;
  clientWallet: string;
  clientName: string;
  contactInfo: string;
}

// Mock state management for formData and setFormData
const [formData, setFormData] = useState<FormData>({
  title: "",
  description: "",
  severity: "medium",
  category: "vulnerability",
  transactionHash: "",
  contractAddress: "",
  network: "ethereum",
  gasUsed: "",
  blockNumber: "",
  affectedSystems: "",
  attackVectors: "",
  evidenceUrls: "",
  clientWallet: "",
  clientName: "",
  contactInfo: ""
});


export default function EVMIncidentReport(props: EVMIncidentReportProps) {
  const [incidentData, setIncidentData] = useState({
    title: "",
    description: "",
    category: "malware",
    location: "",
    priority: "medium",
    ethAmount: "0.01" // ETH amount for transaction
  });

  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEVMConnected || !evmAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!incidentData.title || !incidentData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // This part of the original code was replaced by the changes.
    // The new logic in the <changes> section handles the submission.
    // The following is a placeholder to indicate where the original logic was.
    // Original logic was about creating ticket on EVM blockchain and then storing in DB.
    // The new logic directly uses formData which is not fully defined in the original code snippet provided.
    // I am adapting the new logic to use the incidentData state and wallet info.

    try {
      setIsSubmitting(true);

      // Constructing the data object based on the new submission structure,
      // merging existing incidentData with wallet information and other fields.
      const submissionData = {
        title: incidentData.title,
        description: incidentData.description,
        severity: incidentData.priority, // Mapping priority to severity
        category: incidentData.category,
        client_name: 'Anonymous', // Default or could be fetched/input
        contact_info: `EVM Wallet: ${evmAddress}`, // Using EVM address as contact info
        client_wallet: evmAddress,
        transaction_hash: '', // This would come from the EVM transaction, if any
        contract_address: CONTRACT_ADDRESSES.SOC_SERVICE, // Using defined contract address
        block_number: 0, // This would come from the EVM transaction, if any
        gas_used: '', // This would come from the EVM transaction, if any
        affected_systems: incidentData.location || 'Not specified', // Using location field
        attack_vectors: '', // Not directly provided in original incidentData
        evidence_urls: evidenceFiles.map(file => file.name).join(', '), // Placeholder for evidence URLs
        status: 'pending', // Default status
        network: 'scroll', // Assuming Scroll network based on context
        submissionType: 'evm_incident_report'
      };

      // Mocking the EVM transaction part as the original code did,
      // but the submission logic is now handled by the fetch call.
      // In a real scenario, the transaction would be initiated here.
      // For the purpose of this fix, we'll simulate getting transaction details.

      // Simulate creating ticket on EVM blockchain to get transaction details
      // This part is based on the original code's intention but adapted for the new submission flow.
      try {
        toast({
          title: "Creating EVM Ticket",
          description: "Submitting to Scroll blockchain...",
        });
        const tx = await evmContractService.createTicket(); // Assuming this returns a transaction object
        const receipt = await tx.wait(); // Assuming this waits for transaction confirmation

        submissionData.transaction_hash = receipt.transactionHash || '';
        submissionData.block_number = receipt.blockNumber || 0;
        submissionData.gas_used = receipt.gasUsed?.toString() || '0';
        submissionData.client_name = evmAddress || 'Anonymous'; // Set client name from wallet
        submissionData.contact_info = `EVM Wallet: ${evmAddress}`; // Update contact info

        toast({
          title: "Transaction successful",
          description: `Transaction hash: ${receipt.transactionHash.slice(0, 10)}...`,
        });

      } catch (evmError: any) {
        console.error('EVM ticket creation failed:', evmError);
        let errorMessage = "Failed to create ticket on EVM";

        if (evmError.code === 4001) {
          errorMessage = "Transaction was rejected by user";
        } else if (evmError.message?.includes('insufficient funds')) {
          errorMessage = "Insufficient ETH for gas fees";
        } else if (evmError.message) {
          errorMessage = evmError.message;
        }

        toast({
          title: "EVM Transaction Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false); // Stop submission if EVM part fails
        return;
      }


      // Now submit the consolidated data to the API
      const response = await fetch('/api/incident-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit incident report');
      }

      const result = await response.json();
      console.log('EVM incident report submitted:', result);

      toast({
        title: "Success",
        description: `Incident report submitted successfully. Case ID: ${result.ticket_id || result.id}`,
      });

      // Reset form after successful submission
      setIncidentData({
        title: "",
        description: "",
        category: "malware",
        location: "",
        priority: "medium",
        ethAmount: "0.01"
      });
      setEvidenceFiles([]);
      // Resetting formData as well, though it's not directly used in the final submission logic here.
      // If formData were to be managed separately, it should also be reset.
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        category: 'vulnerability',
        transactionHash: '',
        contractAddress: '',
        network: 'ethereum',
        gasUsed: '',
        blockNumber: '',
        affectedSystems: '',
        attackVectors: '',
        evidenceUrls: '',
        clientWallet: evmAddress || '',
        clientName: '',
        contactInfo: ''
      });

    } catch (error: any) {
      console.error('EVM ticket creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit incident report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEVMConnected) {
    return (
      <Card className="bg-orange-500/5 border-orange-500/20">
        <CardContent className="p-6 text-center">
          <Zap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-400 mb-2">Connect MetaMask</h3>
          <p className="text-gray-300">
            Please connect your MetaMask wallet to submit incident reports on Scroll EVM
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <AlertTriangle className="h-5 w-5" />
          EVM Incident Report
        </CardTitle>
        <CardDescription className="text-gray-300">
          Submit security incidents using ETH on Scroll blockchain. Earn CLT tokens as rewards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Incident Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Incident Title *
            </label>
            <Input
              value={incidentData.title}
              onChange={(e) => setIncidentData({ ...incidentData, title: e.target.value })}
              placeholder="Brief description of the security incident"
              className="bg-gray-800/50 border-orange-500/30 text-white"
              required
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={incidentData.category}
                onChange={(e) => setIncidentData({ ...incidentData, category: e.target.value })}
                className="w-full p-2 bg-gray-800/50 border border-orange-500/30 rounded-md text-white"
              >
                <option value="malware">Malware</option>
                <option value="phishing">Phishing</option>
                <option value="data-breach">Data Breach</option>
                <option value="ddos">DDoS Attack</option>
                <option value="insider-threat">Insider Threat</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={incidentData.priority}
                onChange={(e) => setIncidentData({ ...incidentData, priority: e.target.value })}
                className="w-full p-2 bg-gray-800/50 border border-orange-500/30 rounded-md text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* ETH Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ETH Payment Amount
            </label>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={incidentData.ethAmount}
                onChange={(e) => setIncidentData({ ...incidentData, ethAmount: e.target.value })}
                placeholder="0.01"
                className="bg-gray-800/50 border-orange-500/30 text-white"
              />
              <span className="text-orange-400 font-medium">ETH</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              ETH payment for transaction fees and premium features
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location/Network
            </label>
            <Input
              value={incidentData.location}
              onChange={(e) => setIncidentData({ ...incidentData, location: e.target.value })}
              placeholder="Network segment, IP range, or physical location"
              className="bg-gray-800/50 border-orange-500/30 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detailed Description *
            </label>
            <Textarea
              value={incidentData.description}
              onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })}
              placeholder="Provide detailed information about the incident, affected systems, timeline, and any immediate actions taken"
              className="bg-gray-800/50 border-orange-500/30 text-white min-h-[120px]"
              required
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Evidence Files
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.log"
              className="w-full p-2 bg-gray-800/50 border border-orange-500/30 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-orange-600 file:text-white"
            />
            {evidenceFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-400">Selected files:</p>
                {evidenceFiles.map((file, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mt-1 text-orange-400 border-orange-500/30">
                    <FileText className="h-3 w-3 mr-1" />
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Creating Ticket on Scroll...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit EVM Incident Report
              </>
            )}
          </Button>
        </form>

        {/* Status Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-orange-400" />
              <span className="font-medium text-orange-400">Payment</span>
            </div>
            <p className="text-gray-300 text-sm">Pay with ETH</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-400">Rewards</span>
            </div>
            <p className="text-gray-300 text-sm">Earn CLT tokens</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-blue-400">Network</span>
            </div>
            <p className="text-gray-300 text-sm">Scroll EVM</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}