import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/WalletProvider";
import { useCurrentAccount } from "@iota/dapp-kit";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Code, 
  Zap, 
  Network,
  Wallet,
  Shield,
  Coins,
  Database,
  Globe,
  Settings,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function DAppPage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState<any>(null);
  
  const { walletType, evmAddress, isEVMConnected, isIOTAConnected, connectEVMWallet } = useWallet();
  const iotaAccount = useCurrentAccount();
  const { toast } = useToast();

  const iotaAddress = iotaAccount?.address;

  const handleContractInteraction = async (action: string) => {
    if (!isEVMConnected || !evmAddress) {
      try {
        await connectEVMWallet();
      } catch (error) {
        toast({
          title: "Connection Required",
          description: "Please connect your MetaMask wallet first",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      let result;
      switch (action) {
        case 'mint':
          result = await evmContractService.mintCLTReward(evmAddress!, '100');
          toast({
            title: "Tokens Minted",
            description: `Successfully minted 100 CLT tokens`,
          });
          break;
        case 'balance':
          // This would require implementing a balance check method
          toast({
            title: "Balance Check",
            description: "Balance check functionality would be implemented here",
          });
          break;
        default:
          break;
      }
      setContractData(result);
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to interact with smart contract",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dappFeatures = [
    {
      title: "Smart Contract Interaction",
      description: "Direct interaction with deployed contracts",
      icon: Code,
      color: "blue",
      actions: ["Deploy", "Call Functions", "View State"]
    },
    {
      title: "Token Management",
      description: "Manage CLT tokens and transfers",
      icon: Coins,
      color: "orange",
      actions: ["Mint Tokens", "Transfer", "Check Balance"]
    },
    {
      title: "Network Operations",
      description: "Blockchain network interactions",
      icon: Network,
      color: "purple",
      actions: ["Switch Networks", "Check Status", "Gas Estimation"]
    },
    {
      title: "Decentralized Storage",
      description: "IPFS integration for data storage",
      icon: Database,
      color: "green",
      actions: ["Upload Data", "Retrieve", "Pin Content"]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-500/30 hover:border-blue-500/50 text-blue-400';
      case 'orange': return 'border-orange-500/30 hover:border-orange-500/50 text-orange-400';
      case 'purple': return 'border-purple-500/30 hover:border-purple-500/50 text-purple-400';
      case 'green': return 'border-green-500/30 hover:border-green-500/50 text-green-400';
      default: return 'border-gray-500/30 hover:border-gray-500/50 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header currentRole={selectedRole} onRoleChange={setSelectedRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl cyber-pulse">
                <Code className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-purple-400 mb-4">dSOC dApp Interface</h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Interact directly with smart contracts, manage tokens, and access decentralized features of the dSOC platform
            </p>
          </div>

          {/* Connection Status */}
          <Card className="mb-8 bg-slate-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-300 flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Blockchain Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* IOTA Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-blue-400 font-semibold">IOTA Network</h4>
                    {isIOTAConnected ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                  {isIOTAConnected && iotaAddress && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-blue-300 mb-1">Address:</p>
                      <p className="text-xs font-mono text-blue-200">
                        {iotaAddress.slice(0, 20)}...{iotaAddress.slice(-20)}
                      </p>
                    </div>
                  )}
                </div>

                {/* EVM Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-orange-400 font-semibold">Scroll Sepolia (EVM)</h4>
                    {isEVMConnected ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                  {isEVMConnected && evmAddress ? (
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <p className="text-sm text-orange-300 mb-1">Address:</p>
                      <p className="text-xs font-mono text-orange-200">
                        {evmAddress}
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={connectEVMWallet}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      data-testid="button-connect-evm-dapp"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect MetaMask
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* dApp Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {dappFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`bg-slate-800 ${getColorClasses(feature.color)} transition-colors`}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`h-8 w-8 ${feature.color === 'blue' ? 'text-blue-400' : feature.color === 'orange' ? 'text-orange-400' : feature.color === 'purple' ? 'text-purple-400' : 'text-green-400'}`} />
                      <div>
                        <CardTitle className={feature.color === 'blue' ? 'text-blue-400' : feature.color === 'orange' ? 'text-orange-400' : feature.color === 'purple' ? 'text-purple-400' : 'text-green-400'}>
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {feature.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center text-sm text-gray-300">
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                          {action}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className={`w-full ${feature.color === 'blue' ? 'border-blue-500/30 text-blue-300 hover:bg-blue-500/10' : feature.color === 'orange' ? 'border-orange-500/30 text-orange-300 hover:bg-orange-500/10' : feature.color === 'purple' ? 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10' : 'border-green-500/30 text-green-300 hover:bg-green-500/10'}`}
                      onClick={() => {
                        if (feature.title.includes("Token")) {
                          handleContractInteraction('mint');
                        } else {
                          toast({
                            title: feature.title,
                            description: `${feature.title} functionality would be implemented here`,
                          });
                        }
                      }}
                      disabled={loading}
                      data-testid={`button-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Settings className="h-4 w-4 mr-2" />
                      )}
                      Interact
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick dApp Actions
              </CardTitle>
              <CardDescription>
                Perform common blockchain operations with one click
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={() => handleContractInteraction('mint')}
                  disabled={!isEVMConnected || loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  data-testid="button-quick-mint"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Coins className="h-4 w-4 mr-2" />
                  )}
                  Mint 100 CLT
                </Button>

                <Button
                  onClick={() => handleContractInteraction('balance')}
                  disabled={!isEVMConnected || loading}
                  variant="outline"
                  className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 disabled:opacity-50"
                  data-testid="button-check-balance"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Check Balance
                </Button>

                <Button
                  onClick={() => window.location.href = '/faucet'}
                  variant="outline"
                  className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                  data-testid="button-goto-faucet-from-dapp"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Get Test Tokens
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Info */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              Decentralized Application Interface
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This dApp interface provides direct access to blockchain functionality, smart contract interactions, 
              and decentralized features of the dSOC platform. Connect your wallet to begin interacting with the blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}