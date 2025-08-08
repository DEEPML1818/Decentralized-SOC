
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useWallet } from './providers/WalletProvider';
import { evmContractService } from '@/lib/evm-contract';
import { useToast } from '@/hooks/use-toast';
import { Wallet, RefreshCw, DollarSign, Zap } from 'lucide-react';

export default function EVMBalanceDisplay() {
  const { evmAddress, isEVMConnected } = useWallet();
  const { toast } = useToast();
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalance = async () => {
    if (!evmAddress || !isEVMConnected) return;

    try {
      setIsLoading(true);
      const balance = await evmContractService.getETHBalance(evmAddress);
      setEthBalance(balance);
    } catch (error: any) {
      console.error('Error fetching ETH balance:', error);
      toast({
        title: "Balance Fetch Failed",
        description: error.message || "Failed to fetch ETH balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalance();
    setIsRefreshing(false);
    toast({
      title: "Balance Updated",
      description: "ETH balance has been refreshed",
    });
  };

  useEffect(() => {
    if (isEVMConnected && evmAddress) {
      fetchBalance();
    }
  }, [evmAddress, isEVMConnected]);

  if (!isEVMConnected) {
    return (
      <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet className="h-6 w-6 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-orange-400 mb-2">EVM Wallet Not Connected</h3>
          <p className="text-gray-400 text-sm">Connect your MetaMask wallet to view ETH balance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-blue-400">ETH Balance</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Wallet Address:</span>
            <Badge variant="outline" className="text-xs font-mono">
              {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Network:</span>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Scroll Sepolia
            </Badge>
          </div>

          <div className="pt-2 border-t border-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-400">Loading balance...</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <Zap className="h-6 w-6 text-blue-400" />
                  {parseFloat(ethBalance).toFixed(6)} ETH
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Native balance on Scroll Sepolia Testnet
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
