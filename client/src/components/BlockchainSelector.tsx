import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/components/providers/WalletProvider";
import { ConnectButton } from "@iota/dapp-kit";
import { useToast } from "@/hooks/use-toast";
import { Network, Wallet, ShieldCheck, Zap } from "lucide-react";

interface BlockchainSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export default function BlockchainSelector({ isOpen, onClose, onConnected }: BlockchainSelectorProps) {
  const { walletType, setWalletType, connectEVMWallet, isEVMConnected, isIOTAConnected } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const blockchains = [
    {
      id: 'iota' as const,
      name: 'IOTA',
      description: 'Feeless and sustainable blockchain',
      icon: Network,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      features: [
        'Zero transaction fees',
        'Environmentally friendly',
        'Quantum resistant',
        'Fast finality'
      ],
      isConnected: isIOTAConnected
    },
    {
      id: 'evm' as const,
      name: 'Scroll (EVM)',
      description: 'Ethereum Layer 2 scaling solution',
      icon: ShieldCheck,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      features: [
        'EVM compatible',
        'Low gas fees',
        'High throughput',
        'Ethereum security'
      ],
      isConnected: isEVMConnected
    }
  ];

  const handleIOTAConnect = () => {
    setWalletType('iota');
    // IOTA connection is handled by the ConnectButton component
  };

  const handleEVMConnect = async () => {
    setConnecting(true);
    try {
      setWalletType('evm');
      await connectEVMWallet();
      toast({
        title: "EVM Wallet Connected",
        description: "Successfully connected to Scroll Sepolia",
      });
      onConnected();
      onClose();
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

  const handleBlockchainSelect = (blockchainId: 'iota' | 'evm') => {
    if (blockchainId === 'iota') {
      handleIOTAConnect();
    } else {
      handleEVMConnect();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Choose Your Blockchain
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {blockchains.map((blockchain) => {
            const Icon = blockchain.icon;
            return (
              <Card
                key={blockchain.id}
                className={`cursor-pointer transition-all hover:scale-105 bg-slate-800 border-purple-500/20 hover:border-purple-500/40 ${
                  walletType === blockchain.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setWalletType(blockchain.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${blockchain.bgColor}`}>
                        <Icon className={`h-6 w-6 ${blockchain.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{blockchain.name}</CardTitle>
                        <p className="text-gray-400 text-sm">{blockchain.description}</p>
                      </div>
                    </div>
                    {blockchain.isConnected && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    {blockchain.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                        <Zap className="h-3 w-3 text-purple-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {blockchain.id === 'iota' && walletType === 'iota' && (
                    <div className="w-full">
                      <ConnectButton
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        connectText="Connect IOTA Wallet"
                      />
                    </div>
                  )}
                  
                  {blockchain.id === 'evm' && walletType === 'evm' && (
                    <Button
                      onClick={handleEVMConnect}
                      disabled={connecting || blockchain.isConnected}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {connecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Connecting...
                        </>
                      ) : blockchain.isConnected ? (
                        'EVM Connected'
                      ) : (
                        'Connect EVM Wallet'
                      )}
                    </Button>
                  )}
                  
                  {walletType !== blockchain.id && (
                    <Button
                      variant="outline"
                      onClick={() => setWalletType(blockchain.id)}
                      className="w-full border-purple-500/30 text-gray-300 hover:bg-purple-500/10"
                    >
                      Select {blockchain.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-purple-500/20">
          <p className="text-sm text-gray-400 text-center mb-4">
            Choose your blockchain network. IOTA and EVM are completely separate - transactions will only go to your selected network.
          </p>
          
          {(isIOTAConnected || isEVMConnected) && (
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  onConnected();
                  onClose();
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Enter Platform
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}