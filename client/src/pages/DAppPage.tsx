import { useState, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import EnhancedStakingPools from "@/components/EnhancedStakingPools";
import CasesList from "@/components/CasesList";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Zap, Shield, Target, TrendingUp, Users } from "lucide-react";

export default function DAppPage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  const { isEVMConnected, connectEVMWallet, evmAddress } = useWallet();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isEVMConnected) {
      toast({
        title: "Welcome to dSOC dApp!",
        description: "You're now using Scroll (EVM) blockchain. All transactions use ETH and convert to CLT tokens.",
      });
    }
  }, [isEVMConnected, toast]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectEVMWallet();
      toast({
        title: "EVM Wallet Connected",
        description: "Successfully connected to Scroll Sepolia network",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect EVM wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  if (!isEVMConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="mb-8">
            <Zap className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-orange-400 mb-4">dSOC dApp Platform</h1>
            <p className="text-gray-300 mb-8">
              Connect your MetaMask wallet to access the dSOC decentralized application
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6 mb-8">
            <h3 className="text-orange-300 font-semibold mb-3">dApp Features:</h3>
            <ul className="text-orange-200 text-sm space-y-2 text-left">
              <li>• Pay with ETH for all transactions</li>
              <li>• Earn CLT tokens as rewards</li>
              <li>• Convert CLT back to ETH anytime</li>
              <li>• Fast Scroll Layer 2 transactions</li>
              <li>• EVM-compatible smart contracts</li>
            </ul>
          </div>

          <Button
            onClick={handleConnect}
            disabled={connecting}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
          >
            {connecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
      <Header currentRole={selectedRole} onRoleChange={setSelectedRole} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Platform Overview */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-4 flex items-center gap-3">
            <Shield className="h-10 w-10" />
            dSOC Security Platform
          </h1>
          <p className="text-gray-300 text-lg">
            Stake CLT tokens in security pools, earn rewards, and support decentralized security operations
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Active Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white font-mono">5</p>
              <p className="text-xs text-gray-400">Security staking pools</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total CLT Staked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white font-mono">2,450</p>
              <p className="text-xs text-gray-400">CLT tokens locked</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white font-mono">8</p>
              <p className="text-xs text-gray-400">Security incidents</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-400 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avg APY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white font-mono">15.2%</p>
              <p className="text-xs text-gray-400">Estimated returns</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="staking" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="staking" className="text-sm">Security Staking Pools</TabsTrigger>
            <TabsTrigger value="cases" className="text-sm">Available Cases</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-sm">Role Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="staking" className="space-y-6">
            <Card className="bg-slate-800/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  CLT Reward Distribution via Security Pools
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Each security case creates its own staking pool. Stake CLT tokens to support security analysis and earn rewards.
                  Your staking choice determines which specific security case you're supporting.
                </CardDescription>
              </CardHeader>
            </Card>
            <EnhancedStakingPools />
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <Card className="bg-slate-800/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Cases & Incident Reports
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Browse all available security cases and their associated staking pools. Each case represents a real security incident requiring analysis.
                </CardDescription>
              </CardHeader>
            </Card>
            <CasesList walletType="evm" />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard currentRole={selectedRole} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}