import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/providers/WalletProvider";
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

export default function EVMIncidentReport(props: EVMIncidentReportProps) {
  const [incidentData, setIncidentData] = useState({
    title: "",
    description: "",
    category: "malware",
    location: "",
    priority: "medium",
    cltAmount: "100", // CLT tokens for staking pool
    affectedSystems: "",
    attackVectors: ""
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

    try {
      setIsSubmitting(true);

      // Ensure wallet connection and signer initialization
      console.log('Ensuring wallet connection...');
      await evmContractService.connectWallet();

      // Create ticket using new SOCService contract
      console.log('Creating ticket with CLT amount:', incidentData.cltAmount);
      
      toast({
        title: "Creating Security Ticket",
        description: "Processing CLT token requirements and blockchain transaction...",
      });
      
      const createResult = await evmContractService.createTicket(
        incidentData.title,
        incidentData.cltAmount
      );

      console.log('Ticket created:', createResult);

      // Store in backend database
      const evidenceUrls = evidenceFiles.map(file => file.name).join(', ');
      
      const response = await fetch('/api/incident-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: incidentData.title,
          description: incidentData.description,
          severity: incidentData.priority,
          client_name: evmAddress,
          contact_info: `EVM Wallet: ${evmAddress}`,
          client_wallet: evmAddress,
          affected_systems: incidentData.affectedSystems || 'Not specified',
          attack_vectors: incidentData.attackVectors,
          evidence_urls: evidenceUrls,
          contract_address: CONTRACT_ADDRESSES.SOC_SERVICE,
          block_number: createResult.blockNumber || 0,
          transaction_hash: createResult.txHash || '',
          staking_pool_address: createResult.stakingPoolAddress || '',
          ticket_id: createResult.ticketId || null,
          clt_staked: incidentData.cltAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store incident report');
      }

      toast({
        title: "Security Incident Reported Successfully! 🎯",
        description: `Ticket #${createResult.ticketId} created with ${incidentData.cltAmount} CLT staked. Transaction: ${createResult.txHash?.slice(0, 10)}...`,
      });

      // Reset form
      setIncidentData({
        title: "",
        description: "",
        category: "malware",
        location: "",
        priority: "medium",
        cltAmount: "100",
        affectedSystems: "",
        attackVectors: ""
      });
      setEvidenceFiles([]);
      
      if (props.onClose) {
        props.onClose();
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error Creating Ticket",
        description: error.message || "Failed to create security ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEVMConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 p-4 flex items-center justify-center">
        <Card className="bg-orange-500/5 border-orange-500/20 max-w-md">
          <CardContent className="p-8 text-center">
            <Zap className="h-16 w-16 text-orange-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-orange-400 mb-4">Connect MetaMask</h3>
            <p className="text-gray-300 text-lg">
              Please connect your MetaMask wallet to submit incident reports on Scroll EVM
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400 text-2xl">
              <AlertTriangle className="h-6 w-6" />
              EVM Incident Report
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
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

          {/* CLT Stake Amount and Affected Systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CLT Stake Amount *
              </label>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-400" />
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={incidentData.cltAmount}
                  onChange={(e) => setIncidentData({ ...incidentData, cltAmount: e.target.value })}
                  placeholder="100"
                  className="bg-gray-800/50 border-orange-500/30 text-white"
                  required
                />
                <span className="text-orange-400 font-medium">CLT</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                CLT tokens to stake for security analysis pool
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Affected Systems
              </label>
              <Input
                value={incidentData.affectedSystems}
                onChange={(e) => setIncidentData({ ...incidentData, affectedSystems: e.target.value })}
                placeholder="Database servers, user accounts, etc."
                className="bg-gray-800/50 border-orange-500/30 text-white"
              />
            </div>
          </div>

          {/* Attack Vectors */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attack Vectors
            </label>
            <Input
              value={incidentData.attackVectors}
              onChange={(e) => setIncidentData({ ...incidentData, attackVectors: e.target.value })}
              placeholder="SQL injection, phishing, malware, etc."
              className="bg-gray-800/50 border-orange-500/30 text-white"
            />
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
                Processing CLT Transaction...
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
            <p className="text-gray-300 text-sm">Stake CLT tokens</p>
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
      </div>
    </div>
  );
}