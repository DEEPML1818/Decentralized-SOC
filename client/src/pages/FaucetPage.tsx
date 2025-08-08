import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/providers/WalletProvider";
import { useCurrentAccount } from "@iota/dapp-kit";
import Header from "@/components/Header";
import { evmContractService } from "@/lib/evm-contract";
import { 
  Coins, 
  Droplets, 
  Wallet, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Network,
  Zap,
  RefreshCw
} from "lucide-react";

interface FaucetRequest {
  address: string;
  amount: string;
  txHash?: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export default function FaucetPage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  const [loading, setLoading] = useState(false);
  const [iotaLoading, setIotaLoading] = useState(false);
  const [evmLoading, setEvmLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('100');
  const [recentRequests, setRecentRequests] = useState<FaucetRequest[]>([]);
  
  const { walletType, evmAddress, isEVMConnected, isIOTAConnected, connectEVMWallet } = useWallet();
  const iotaAccount = useCurrentAccount();
  const { toast } = useToast();

  const iotaAddress = iotaAccount?.address;
  
  const faucetOptions = [
    { amount: '50', label: 'Small', description: 'Good for testing' },
    { amount: '100', label: 'Medium', description: 'Standard amount' },
    { amount: '250', label: 'Large', description: 'For extensive testing' },
  ];

  const handleCLTFaucet = async (amount: string) => {
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

    setEvmLoading(true);
    try {
      const result = await evmContractService.mintCLT(evmAddress!, amount);
      const txHash = result.txHash;
      
      const newRequest: FaucetRequest = {
        address: evmAddress!,
        amount: `${amount} CLT`,
        txHash,
        timestamp: Date.now(),
        status: 'completed'
      };
      
      setRecentRequests(prev => [newRequest, ...prev.slice(0, 4)]);
      
      toast({
        title: "CLT Tokens Minted!",
        description: `Successfully minted ${amount} CLT tokens to your wallet`,
      });
    } catch (error: any) {
      const newRequest: FaucetRequest = {
        address: evmAddress!,
        amount: `${amount} CLT`,
        timestamp: Date.now(),
        status: 'failed'
      };
      
      setRecentRequests(prev => [newRequest, ...prev.slice(0, 4)]);
      
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint CLT tokens",
        variant: "destructive",
      });
    } finally {
      setEvmLoading(false);
    }
  };

  const handleIOTAFaucet = async () => {
    if (!isIOTAConnected || !iotaAddress) {
      toast({
        title: "Connection Required",
        description: "Please connect your IOTA wallet first",
        variant: "destructive",
      });
      return;
    }

    setIotaLoading(true);
    try {
      // Since this is a testnet faucet, we'll provide instructions
      // In a real implementation, this would call the IOTA testnet faucet API
      
      toast({
        title: "IOTA Testnet Faucet",
        description: "Please visit https://faucet.testnet.iota.org/ to get IOTA testnet tokens",
      });
      
      // Open the IOTA faucet in a new tab
      window.open('https://faucet.testnet.iota.org/', '_blank');
      
      const newRequest: FaucetRequest = {
        address: iotaAddress,
        amount: "1000 IOTA",
        timestamp: Date.now(),
        status: 'pending'
      };
      
      setRecentRequests(prev => [newRequest, ...prev.slice(0, 4)]);
      
    } catch (error: any) {
      toast({
        title: "Faucet Error",
        description: error.message || "Failed to access IOTA faucet",
        variant: "destructive",
      });
    } finally {
      setIotaLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header currentRole={selectedRole} onRoleChange={setSelectedRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg cyber-pulse">
                <Droplets className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-blue-400 mb-4">dSOC Token Faucet</h1>
            <p className="text-gray-300 text-lg">
              Get test tokens for the dSOC platform development and testing
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* CLT Token Faucet */}
            <Card className="bg-slate-800 border-orange-500/30 hover:border-orange-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-orange-400" />
                  <div>
                    <CardTitle className="text-orange-400">CLT Token Faucet</CardTitle>
                    <CardDescription>Get CLT tokens for EVM testing on Scroll Sepolia</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEVMConnected ? (
                  <div className="text-center py-4">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">Connect your MetaMask wallet to get CLT tokens</p>
                    <Button 
                      onClick={connectEVMWallet}
                      className="bg-orange-600 hover:bg-orange-700"
                      data-testid="button-connect-metamask"
                    >
                      Connect MetaMask
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <span className="text-sm text-orange-300">Connected Address:</span>
                        <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-orange-300">Select Amount</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {faucetOptions.map((option) => (
                          <Button
                            key={option.amount}
                            variant="outline"
                            className="bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-300"
                            onClick={() => setCustomAmount(option.amount)}
                            data-testid={`button-amount-${option.amount}`}
                          >
                            {option.amount} CLT
                          </Button>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="custom-amount" className="text-orange-300">Custom Amount</Label>
                        <Input
                          id="custom-amount"
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="bg-slate-700 border-orange-500/30 text-orange-300"
                          placeholder="Enter amount"
                          data-testid="input-custom-amount"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCLTFaucet(customAmount)}
                      disabled={evmLoading || !customAmount || parseFloat(customAmount) <= 0}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                      data-testid="button-claim-clt"
                    >
                      {evmLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Minting CLT...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Claim {customAmount} CLT
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* IOTA Token Faucet */}
            <Card className="bg-slate-800 border-blue-500/30 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Network className="h-6 w-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-blue-400">IOTA Token Faucet</CardTitle>
                    <CardDescription>Get IOTA testnet tokens for testing</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isIOTAConnected ? (
                  <div className="text-center py-4">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">Connect your IOTA wallet to get testnet tokens</p>
                    <p className="text-xs text-gray-500">Use the IOTA wallet connection in the header</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <span className="text-sm text-blue-300">Connected Address:</span>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {iotaAddress?.slice(0, 6)}...{iotaAddress?.slice(-4)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="text-blue-300 font-medium mb-2">Standard Amount</h4>
                        <p className="text-blue-200 text-sm mb-3">1000 IOTA testnet tokens</p>
                        <p className="text-xs text-gray-400">
                          Will redirect to official IOTA testnet faucet
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleIOTAFaucet}
                      disabled={iotaLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      data-testid="button-claim-iota"
                    >
                      {iotaLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Opening Faucet...
                        </>
                      ) : (
                        <>
                          <Droplets className="h-4 w-4 mr-2" />
                          Get IOTA Tokens
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          {recentRequests.length > 0 && (
            <Card className="mt-8 bg-slate-800 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Faucet Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRequests.map((request, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="text-white font-medium">{request.amount}</p>
                          <p className="text-xs text-gray-400">
                            {request.address?.slice(0, 6)}...{request.address?.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.txHash && (
                          <p className="text-xs text-gray-400 mt-1">
                            TX: {request.txHash.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card className="mt-8 bg-slate-800 border-gray-600">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-cyan-400 font-semibold mb-2">CLT Tokens</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Used for staking in security cases</li>
                    <li>• Reward token for analysts and certifiers</li>
                    <li>• Required for creating tickets</li>
                    <li>• ERC-20 compatible on Scroll</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">IOTA Tokens</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Gas fees for IOTA transactions</li>
                    <li>• Required for IOTA dApp interactions</li>
                    <li>• Testnet tokens only for development</li>
                    <li>• Zero-fee microtransactions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}