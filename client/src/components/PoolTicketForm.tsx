import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Plus, 
  Coins, 
  Users, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Target,
  DollarSign,
  FileText,
  Camera,
  Upload
} from "lucide-react";

interface PoolTicket {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  rewardAmount: string;
  requiredAnalysts: number;
  timeline: string;
  status: 'open' | 'in_progress' | 'completed' | 'verified';
  submittedBy: string;
  createdAt: string;
}

export default function PoolTicketForm({ onClose }: { onClose: () => void }) {
  const { walletType, evmAddress, iotaAddress, isEVMConnected, isIOTAConnected } = useWallet();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: '',
    rewardAmount: '',
    requiredAnalysts: 1,
    timeline: '',
    attachments: [] as File[]
  });
  
  const [loading, setLoading] = useState(false);

  const isConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;
  const currentAddress = walletType === 'iota' ? iotaAddress : evmAddress;

  const severityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const getSeverityMultiplier = (severity: string) => {
    switch (severity) {
      case 'low': return 1;
      case 'medium': return 1.5;
      case 'high': return 2;
      case 'critical': return 3;
      default: return 1;
    }
  };

  const calculateRewardPool = () => {
    const baseAmount = parseFloat(formData.rewardAmount) || 0;
    const severityMultiplier = getSeverityMultiplier(formData.severity);
    const analystMultiplier = formData.requiredAnalysts;
    return (baseAmount * severityMultiplier * analystMultiplier).toFixed(2);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit a pool ticket",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.severity || !formData.rewardAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const totalReward = calculateRewardPool();
      
      if (walletType === 'evm') {
        // Submit to EVM smart contract
        const tx = await evmContractService.openPool({
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          rewardAmount: totalReward,
          requiredAnalysts: formData.requiredAnalysts,
          timeline: formData.timeline
        });
        
        await tx.wait();
        
        toast({
          title: "Pool Ticket Submitted",
          description: `Successfully opened pool with ${totalReward} CLT reward on Scroll EVM`,
        });
      } else {
        // Submit to IOTA smart contract (mock for now)
        toast({
          title: "Pool Ticket Submitted", 
          description: `Successfully opened pool with ${totalReward} CLT reward on IOTA`,
        });
      }

      // Store ticket details locally/backend for tracking
      const ticket: PoolTicket = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        severity: formData.severity as any,
        rewardAmount: totalReward,
        requiredAnalysts: formData.requiredAnalysts,
        timeline: formData.timeline,
        status: 'open',
        submittedBy: currentAddress || '',
        createdAt: new Date().toISOString()
      };

      // Here you would typically send to backend
      console.log('New pool ticket:', ticket);
      
      onClose();
      
      // Trigger refresh of ticket list
      window.dispatchEvent(new CustomEvent('poolTicketSubmitted', { detail: ticket }));
      
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit pool ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 text-center">
        <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connect Wallet Required</h3>
        <p className="text-gray-400 mb-4">
          You need to connect your wallet to submit a pool ticket
        </p>
        <Button onClick={onClose} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Submit Pool Ticket</h2>
        <p className="text-gray-400">
          Create a security analysis pool and set rewards for analysts
        </p>
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mt-2">
          {walletType === 'iota' ? 'IOTA Network' : 'Scroll EVM'}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the security issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-slate-700 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the security issue, affected systems, and analysis requirements"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-slate-700 border-purple-500/30 text-white min-h-[120px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity" className="text-gray-300">
                    Severity Level *
                  </Label>
                  <Select 
                    value={formData.severity} 
                    onValueChange={(value) => handleInputChange('severity', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      <SelectItem value="low">
                        <Badge className={severityColors.low}>Low</Badge>
                      </SelectItem>
                      <SelectItem value="medium">
                        <Badge className={severityColors.medium}>Medium</Badge>
                      </SelectItem>
                      <SelectItem value="high">
                        <Badge className={severityColors.high}>High</Badge>
                      </SelectItem>
                      <SelectItem value="critical">
                        <Badge className={severityColors.critical}>Critical</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeline" className="text-gray-300">
                    Expected Timeline
                  </Label>
                  <Select 
                    value={formData.timeline} 
                    onValueChange={(value) => handleInputChange('timeline', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      <SelectItem value="urgent">Urgent (24 hours)</SelectItem>
                      <SelectItem value="high">High (3 days)</SelectItem>
                      <SelectItem value="normal">Normal (1 week)</SelectItem>
                      <SelectItem value="low">Low (2 weeks)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reward" className="text-gray-300">
                    Base Reward Amount (CLT) *
                  </Label>
                  <Input
                    id="reward"
                    type="number"
                    placeholder="100"
                    value={formData.rewardAmount}
                    onChange={(e) => handleInputChange('rewardAmount', e.target.value)}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="analysts" className="text-gray-300">
                    Required Analysts
                  </Label>
                  <Select 
                    value={formData.requiredAnalysts.toString()} 
                    onValueChange={(value) => handleInputChange('requiredAnalysts', parseInt(value))}
                  >
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      <SelectItem value="1">1 Analyst</SelectItem>
                      <SelectItem value="2">2 Analysts</SelectItem>
                      <SelectItem value="3">3 Analysts</SelectItem>
                      <SelectItem value="5">5 Analysts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Attachments (Optional)
                </Label>
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png,.zip"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Click to upload files or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, images, archives (max 10MB each)
                    </p>
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-700 rounded p-2">
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttachment(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reward Summary */}
        <div className="space-y-6">
          <Card className="bg-slate-800 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Reward Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Base Amount:</span>
                  <span className="text-white">{formData.rewardAmount || '0'} CLT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Severity Multiplier:</span>
                  <span className="text-white">{getSeverityMultiplier(formData.severity)}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Analysts Required:</span>
                  <span className="text-white">{formData.requiredAnalysts}</span>
                </div>
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-300">Total Pool:</span>
                    <span className="text-green-400">{calculateRewardPool()} CLT</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  * Rewards distributed equally among qualified analysts upon completion
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Process Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Pool opens for analyst participation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Analysts submit security analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Certifiers validate submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Rewards distributed automatically</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.title || !formData.description || !formData.severity || !formData.rewardAmount}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Pool Ticket
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}