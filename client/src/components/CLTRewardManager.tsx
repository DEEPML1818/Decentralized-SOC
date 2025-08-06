import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./WalletProvider";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Coins, 
  Award, 
  Users, 
  Shield,
  Target,
  ArrowUpCircle,
  ExternalLink,
  RefreshCw,
  Wallet,
  Activity
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface RewardStats {
  totalRewardsMinted: number;
  analystRewards: number;
  certifierRewards: number;
  stakerRewards: number;
  userCLTBalance: number;
}

interface RewardHistory {
  id: number;
  recipient: string;
  amount: string;
  type: 'analyst' | 'certifier' | 'staker';
  txHash: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function CLTRewardManager() {
  const [rewardStats, setRewardStats] = useState<RewardStats>({
    totalRewardsMinted: 0,
    analystRewards: 0,
    certifierRewards: 0,
    stakerRewards: 0,
    userCLTBalance: 0
  });

  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [rewardAmount, setRewardAmount] = useState("50");
  const [rewardType, setRewardType] = useState<'analyst' | 'certifier' | 'staker'>('analyst');
  const [ticketId, setTicketId] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (isEVMConnected && evmAddress) {
      loadRewardData();
    }
  }, [isEVMConnected, evmAddress]);

  const loadRewardData = async () => {
    if (!evmAddress) return;

    try {
      setIsLoading(true);

      // Get user's CLT balance
      const cltBalanceBN = await evmContractService.getCLTBalance(evmAddress);
      const cltBalance = parseFloat(evmContractService.formatCLT(cltBalanceBN));

      setRewardStats({
        totalRewardsMinted: 1250, // Mock data - in real app, fetch from events
        analystRewards: 800,
        certifierRewards: 300,
        stakerRewards: 150,
        userCLTBalance: cltBalance
      });

      // Mock reward history - in real app, fetch from blockchain events
      setRewardHistory([
        {
          id: 1,
          recipient: evmAddress,
          amount: "50",
          type: 'analyst',
          txHash: "0x123...abc",
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      ]);

    } catch (error) {
      console.error("Error loading reward data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load reward information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintReward = async () => {
    if (!recipientAddress || !rewardAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter recipient address and reward amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMinting(true);

      let result;
      if (rewardType === 'analyst' && ticketId) {
        result = await evmContractService.mintAnalystReward(recipientAddress, parseInt(ticketId));
      } else if (rewardType === 'certifier' && ticketId) {
        result = await evmContractService.mintCertifierReward(recipientAddress, parseInt(ticketId));
      } else if (rewardType === 'staker') {
        result = await evmContractService.mintStakerReward(recipientAddress, rewardAmount);
      } else {
        result = await evmContractService.mintReward(recipientAddress, rewardAmount, rewardType);
      }

      toast({
        title: "Reward Minted Successfully!",
        description: `${rewardAmount} CLT tokens minted for ${rewardType}`,
      });

      // Add to history
      const newReward: RewardHistory = {
        id: rewardHistory.length + 1,
        recipient: recipientAddress,
        amount: rewardAmount,
        type: rewardType,
        txHash: result.hash,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      setRewardHistory([newReward, ...rewardHistory]);

      // Update stats
      setRewardStats(prev => ({
        ...prev,
        totalRewardsMinted: prev.totalRewardsMinted + parseFloat(rewardAmount),
        [rewardType === 'analyst' ? 'analystRewards' : 
         rewardType === 'certifier' ? 'certifierRewards' : 'stakerRewards']: 
        prev[rewardType === 'analyst' ? 'analystRewards' : 
           rewardType === 'certifier' ? 'certifierRewards' : 'stakerRewards'] + parseFloat(rewardAmount)
      }));

      // Reset form
      setRecipientAddress("");
      setRewardAmount(rewardType === 'analyst' ? "50" : rewardType === 'certifier' ? "30" : "25");
      setTicketId("");

    } catch (error) {
      console.error("Error minting reward:", error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint CLT reward",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRewardData();
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Reward data has been updated",
    });
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'analyst': return <Users className="h-4 w-4" />;
      case 'certifier': return <Shield className="h-4 w-4" />;
      case 'staker': return <Target className="h-4 w-4" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'analyst': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'certifier': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'staker': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (!isEVMConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            CLT Reward Manager
          </CardTitle>
          <CardDescription>
            Connect your EVM wallet to manage CLT token rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please connect your EVM wallet to access reward management
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reward Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              Your CLT Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardStats.userCLTBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">CLT Tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Analyst Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardStats.analystRewards}</div>
            <p className="text-xs text-muted-foreground">CLT Minted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Certifier Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardStats.certifierRewards}</div>
            <p className="text-xs text-muted-foreground">CLT Minted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              Staker Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardStats.stakerRewards}</div>
            <p className="text-xs text-muted-foreground">CLT Minted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mint" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mint">Mint Rewards</TabsTrigger>
          <TabsTrigger value="history">Reward History</TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Mint CLT Rewards
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              <CardDescription>
                Mint CLT tokens as rewards for analysts, certifiers, and stakers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Recipient Address</Label>
                  <Input
                    id="recipientAddress"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewardType">Reward Type</Label>
                  <Select value={rewardType} onValueChange={(value: 'analyst' | 'certifier' | 'staker') => {
                    setRewardType(value);
                    // Set default amounts
                    setRewardAmount(value === 'analyst' ? "50" : value === 'certifier' ? "30" : "25");
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analyst">Analyst (50 CLT)</SelectItem>
                      <SelectItem value="certifier">Certifier (30 CLT)</SelectItem>
                      <SelectItem value="staker">Staker (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rewardAmount">Reward Amount (CLT)</Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    placeholder="50"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                  />
                </div>
                {(rewardType === 'analyst' || rewardType === 'certifier') && (
                  <div className="space-y-2">
                    <Label htmlFor="ticketId">Ticket ID (Optional)</Label>
                    <Input
                      id="ticketId"
                      type="number"
                      placeholder="123"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleMintReward}
                disabled={isMinting || !recipientAddress || !rewardAmount}
                className="w-full"
              >
                {isMinting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                )}
                {isMinting ? 'Minting...' : `Mint ${rewardAmount} CLT Tokens`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Reward History
              </CardTitle>
              <CardDescription>
                Recent CLT token reward distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rewardHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reward history available
                </p>
              ) : (
                <div className="space-y-3">
                  {rewardHistory.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getRewardTypeIcon(reward.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{reward.amount} CLT</span>
                            <Badge variant="outline" className={getRewardTypeColor(reward.type)}>
                              {reward.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            To: {reward.recipient.slice(0, 8)}...{reward.recipient.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reward.status === 'completed' ? 'default' : 'secondary'}>
                          {reward.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://sepolia.scrollscan.dev/tx/${reward.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}