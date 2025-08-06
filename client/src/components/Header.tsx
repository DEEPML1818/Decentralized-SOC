import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Shield, Wallet, ChevronDown, Link, Network, Droplets } from "lucide-react";
import { useWallet } from './WalletProvider';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import BlockchainSelector from "./BlockchainSelector";

interface HeaderProps {
  onRoleChange: (role: string) => void;
  currentRole: string;
}

export default function Header({ onRoleChange, currentRole }: HeaderProps) {
  const iotaAccount = useCurrentAccount();
  const { 
    walletType,
    setWalletType,
    evmAddress, 
    iotaAddress, 
    connectEVMWallet, 
    disconnectEVMWallet,
    isEVMConnected,
    isIOTAConnected
  } = useWallet();
  const { toast } = useToast();
  const [showBlockchainSelector, setShowBlockchainSelector] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'analyst': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'certifier': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };



  const handleEVMConnect = async () => {
    if (isEVMConnected) {
      disconnectEVMWallet();
      toast({
        title: "EVM Wallet Disconnected",
        description: "MetaMask wallet has been disconnected",
      });
    } else {
      try {
        const address = await connectEVMWallet();
        if (address) {
          toast({
            title: "EVM Wallet Connected",
            description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
          });
        }
      } catch (error: any) {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect EVM wallet",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <header className="border-b border-red-500/30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg cyber-pulse">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-400 font-mono">dSOC</h1>
                <p className="text-xs text-gray-400 font-mono">DECENTRALIZED SECURITY OPERATIONS CENTER</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Role Selector - always visible */}
            <Select value={currentRole} onValueChange={onRoleChange}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(currentRole)}>
                    {currentRole}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="client" className="text-white hover:bg-slate-700">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Client
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="analyst" className="text-white hover:bg-slate-700">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Analyst
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="certifier" className="text-white hover:bg-slate-700">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Certifier
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Blockchain Selector */}
            <Button
              variant="outline"
              onClick={() => setShowBlockchainSelector(true)}
              className="border-purple-500/30 text-gray-300 hover:bg-purple-500/10"
            >
              <Network className="h-4 w-4 mr-2" />
              {walletType === 'iota' ? 'IOTA' : 'Scroll EVM'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>

            {/* Navigation Links */}
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-gray-300 hover:bg-blue-500/20"
            >
              <Shield className="h-4 w-4 mr-2" />
              Home
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.location.href = '/faucet'}
              className="text-gray-300 hover:bg-blue-500/20"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Faucet
            </Button>

            {/* Connection Status Display - Hide IOTA when EVM connected */}
            <div className="flex items-center space-x-2">
              {!isEVMConnected && isIOTAConnected && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">
                  🔗 IOTA: {iotaAddress?.slice(0, 6)}...{iotaAddress?.slice(-4)}
                </Badge>
              )}
              {isEVMConnected && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">
                    🔗 EVM: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Wallet Connection Buttons - Smart display */}
            <div className="flex items-center space-x-2">
              {!isEVMConnected && (
                <ConnectButton
                  connectText="🔐 Connect IOTA"
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-4 py-2 rounded-lg font-mono transition-all duration-200 text-sm border border-red-500/30"
                />
              )}
              <Button
                onClick={handleEVMConnect}
                size="sm"
                className={`${
                  isEVMConnected 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'
                } text-white px-4 py-2 rounded-lg font-mono transition-all duration-200 border border-red-500/30`}
              >
                {isEVMConnected ? '🔓 Disconnect EVM' : '🔐 Connect MetaMask'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Selector Modal */}
      <BlockchainSelector
        isOpen={showBlockchainSelector}
        onClose={() => setShowBlockchainSelector(false)}
        onConnected={() => setShowBlockchainSelector(false)}
      />
    </header>
  );
}