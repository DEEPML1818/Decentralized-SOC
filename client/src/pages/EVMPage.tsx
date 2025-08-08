
import { useState, useEffect } from "react";
import { useWallet } from "@/components/providers/WalletProvider";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Wallet, Zap } from "lucide-react";

export default function EVMPage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  const { isEVMConnected, connectEVMWallet, evmAddress } = useWallet();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isEVMConnected) {
      toast({
        title: "Welcome to Scroll dSOC!",
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
            <h1 className="text-4xl font-bold text-orange-400 mb-4">Scroll dSOC Platform</h1>
            <p className="text-gray-300 mb-8">
              Connect your MetaMask wallet to access the EVM-powered dSOC platform
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6 mb-8">
            <h3 className="text-orange-300 font-semibold mb-3">EVM Features:</h3>
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
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Connect MetaMask Wallet
              </>
            )}
          </Button>

          <p className="text-gray-400 text-sm mt-4">
            Make sure you're connected to Scroll Sepolia Testnet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
      <Header currentRole={selectedRole} onRoleChange={setSelectedRole} />
      <Dashboard currentRole={selectedRole} />
    </div>
  );
}
