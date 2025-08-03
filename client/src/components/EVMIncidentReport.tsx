
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
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
  onClose: () => void;
}

export default function EVMIncidentReport({ onClose }: EVMIncidentReportProps) {
  const [incidentData, setIncidentData] = useState({
    title: "",
    description: "",
    category: "",
    severity: "medium",
    stakeAmount: "0.01" // ETH amount
  });
  
  const [evidence, setEvidence] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { isEVMConnected, evmAddress } = useWallet();

  const handleEVMSubmission = async () => {
    if (!isEVMConnected || !evmAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      toast({
        title: "Submitting to Scroll",
        description: `Paying ${incidentData.stakeAmount} ETH and creating ticket...`,
      });

      // Convert evidence to base64 for storage
      const evidenceData = await Promise.all(
        evidence.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          return {
            name: file.name,
            type: file.type,
            data: base64,
          };
        })
      );

      // Submit to EVM contract
      const result = await evmContractService.createTicket(
        incidentData.title,
        incidentData.description,
        incidentData.category,
        evidenceData,
        parseFloat(incidentData.stakeAmount) // ETH amount
      );

      toast({
        title: "EVM Transaction Confirmed!",
        description: `Incident submitted on Scroll. Paid ${incidentData.stakeAmount} ETH. You'll earn CLT tokens upon resolution.`,
      });

      // Reset form
      setIncidentData({
        title: "",
        description: "",
        category: "",
        severity: "medium",
        stakeAmount: "0.01"
      });
      setEvidence([]);
      onClose();

    } catch (error: any) {
      console.error('EVM submission error:', error);
      
      let errorMessage = "Failed to submit incident to EVM";
      if (error.code === 4001) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = "Insufficient ETH for gas fees and stake amount";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "EVM Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-6 w-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-orange-400">EVM Incident Report</h2>
        </div>
        <p className="text-gray-400">Submit security incidents using ETH on Scroll network</p>
        
        {isEVMConnected && (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mt-2">
            Connected: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
          </Badge>
        )}
      </div>

      {/* Form */}
      <div className="grid gap-6">
        {/* Basic Info */}
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Incident Title
              </label>
              <Input
                value={incidentData.title}
                onChange={(e) => setIncidentData({ ...incidentData, title: e.target.value })}
                placeholder="Brief title describing the security incident"
                className="bg-slate-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Category
              </label>
              <select
                value={incidentData.category}
                onChange={(e) => setIncidentData({ ...incidentData, category: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select category</option>
                <option value="smart-contract">Smart Contract Vulnerability</option>
                <option value="defi-exploit">DeFi Protocol Exploit</option>
                <option value="bridge-hack">Bridge Security Issue</option>
                <option value="wallet-compromise">Wallet Compromise</option>
                <option value="phishing">Phishing Attack</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Description
              </label>
              <Textarea
                value={incidentData.description}
                onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })}
                placeholder="Detailed description of the incident, including timeline, impact, and technical details"
                className="bg-slate-700 border-gray-600 text-white min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Evidence Upload */}
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evidence & Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Upload Evidence Files
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full p-2 bg-slate-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
              />
              {evidence.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    {evidence.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ETH Stake */}
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              ETH Stake Amount
            </CardTitle>
            <CardDescription className="text-gray-400">
              Stake ETH to prioritize your incident. You'll earn CLT tokens as rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Stake Amount (ETH)
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={incidentData.stakeAmount}
                onChange={(e) => setIncidentData({ ...incidentData, stakeAmount: e.target.value })}
                placeholder="0.01"
                className="bg-slate-700 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher stakes get priority. Minimum: 0.001 ETH
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEVMSubmission}
          disabled={submitting || !incidentData.title || !incidentData.description || !isEVMConnected}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {submitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Submitting to Scroll...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit for {incidentData.stakeAmount} ETH
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
