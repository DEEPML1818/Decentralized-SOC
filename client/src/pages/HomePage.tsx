import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/providers/WalletProvider";
import { useCurrentAccount } from "@iota/dapp-kit";
import Header from "@/components/Header";
import { 
  Shield, 
  Droplets, 
  Wallet, 
  Network,
  Zap,
  ArrowRight,
  CheckCircle,
  Globe
} from "lucide-react";

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  
  // Safely access wallet context with fallback values
  let walletType: string | null = null;
  let evmAddress: string | null = null;
  let isEVMConnected = false;
  let isIOTAConnected = false;
  let connectEVMWallet: () => void = () => {}; // Provide a no-op function

  try {
    const walletContext = useWallet();
    walletType = walletContext.walletType;
    evmAddress = walletContext.evmAddress;
    isEVMConnected = walletContext.isEVMConnected;
    isIOTAConnected = walletContext.isIOTAConnected;
    connectEVMWallet = walletContext.connectEVMWallet;
  } catch (error) {
    console.warn('WalletProvider not found, using default values');
  }

  const iotaAccount = useCurrentAccount();
  const iotaAddress = iotaAccount?.address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header currentRole={selectedRole} onRoleChange={setSelectedRole} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl cyber-pulse">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-blue-400 mb-6">
              dSOC Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Decentralized Security Operations Center - A blockchain-powered platform for security incident management and token distribution
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/faucet'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                data-testid="button-goto-faucet"
              >
                <Droplets className="h-5 w-5 mr-2" />
                Get Test Tokens
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={() => window.location.href = '/dapp'}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                data-testid="button-goto-dapp"
              >
                <Zap className="h-5 w-5 mr-2" />
                Launch dApp
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {/* Token Faucet Feature */}
            <Card className="bg-slate-800 border-blue-500/30 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Droplets className="h-8 w-8 text-blue-400" />
                  <div>
                    <CardTitle className="text-blue-400">Token Faucet</CardTitle>
                    <CardDescription>Get test tokens for development</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    CLT token minting for EVM
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    IOTA testnet token access
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Multiple preset amounts
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/faucet'}
                  className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  data-testid="button-faucet-feature"
                >
                  Access Faucet
                </Button>
              </CardContent>
            </Card>

            {/* Dual Blockchain Support */}
            <Card className="bg-slate-800 border-purple-500/30 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Network className="h-8 w-8 text-purple-400" />
                  <div>
                    <CardTitle className="text-purple-400">Dual Blockchain</CardTitle>
                    <CardDescription>IOTA and EVM compatibility</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <Globe className="h-4 w-4 text-orange-400 mr-2" />
                    IOTA: Zero-fee transactions
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Zap className="h-4 w-4 text-orange-400 mr-2" />
                    EVM: MetaMask compatible
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Shield className="h-4 w-4 text-orange-400 mr-2" />
                    Scroll Sepolia testnet
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Integration */}
            <Card className="bg-slate-800 border-green-500/30 hover:border-green-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Wallet className="h-8 w-8 text-green-400" />
                  <div>
                    <CardTitle className="text-green-400">Wallet Integration</CardTitle>
                    <CardDescription>Seamless wallet connections</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    MetaMask support
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    IOTA dApp Kit integration
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Automatic network switching
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Status */}
          <Card className="bg-slate-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-300 flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Current Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-blue-400 font-semibold">IOTA Wallet</h4>
                  {isIOTAConnected && iotaAddress ? (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Connected
                      </Badge>
                      <span className="text-sm text-gray-300 font-mono">
                        {iotaAddress.slice(0, 6)}...{iotaAddress.slice(-4)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Not Connected
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Use wallet selector in header
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-orange-400 font-semibold">EVM Wallet (MetaMask)</h4>
                  {isEVMConnected && evmAddress ? (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Connected
                      </Badge>
                      <span className="text-sm text-gray-300 font-mono">
                        {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Not Connected
                      </Badge>
                      <Button
                        size="sm"
                        onClick={connectEVMWallet}
                        className="bg-orange-600 hover:bg-orange-700 text-xs"
                        data-testid="button-connect-evm"
                      >
                        Connect MetaMask
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Info */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              dSOC - Decentralized Security Operations Center
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A blockchain-powered platform for security incident management, featuring dual blockchain support, 
              token distribution through faucets, and seamless wallet integration for development and testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}