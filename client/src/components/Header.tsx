import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Shield, Wallet, ChevronDown, Link } from "lucide-react";
import { useWallet } from './WalletProvider';

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'analyst': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'certifier': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const currentAddress = walletType === 'iota' ? iotaAddress : evmAddress;
  const isConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;

  const handleWalletTypeChange = (type: string) => {
    setWalletType(type as 'iota' | 'evm');
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
    <header className="border-b border-gray-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">dSOC</h1>
                <p className="text-xs text-gray-400">Decentralized Security Operations</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Wallet Type Selector */}
            <Select value={walletType} onValueChange={handleWalletTypeChange}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span className="text-sm uppercase">{walletType}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="iota" className="text-white hover:bg-slate-700">
                  <div className="flex items-center space-x-2">
                    <span>IOTA</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      Native
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="evm" className="text-white hover:bg-slate-700">
                  <div className="flex items-center space-x-2">
                    <span>EVM</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Scroll
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {isConnected && (
              <div className="flex items-center space-x-3">
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

                <div className="text-right">
                  <p className="text-sm text-gray-400">Connected to {walletType.toUpperCase()}</p>
                  <p className="text-xs text-white font-mono">
                    {currentAddress?.slice(0, 6)}...{currentAddress?.slice(-4)}
                  </p>
                </div>
              </div>
            )}

            {/* Wallet Connection Buttons */}
            {walletType === 'iota' ? (
              <ConnectButton
                connectText="Connect IOTA"
                connectedText="Connected"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              />
            ) : (
              <Button
                onClick={handleEVMConnect}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                {isEVMConnected ? 'Disconnect EVM' : 'Connect MetaMask'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}