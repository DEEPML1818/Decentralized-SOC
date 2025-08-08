
import React, { useState } from 'react';
import { useWallet } from '../providers/WalletProvider';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';

function truncate(addr?: string, left = 6, right = 4) {
  if (!addr) return '';
  if (addr.length <= left + right) return addr;
  return `${addr.slice(0, left)}...${addr.slice(-right)}`;
}

export const ConnectWalletButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { 
    isConnected, 
    walletType, 
    address, 
    connectEvm, 
    connectIota,
    disconnect
  } = useWallet();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'EVM' | 'IOTA' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (type: 'EVM' | 'IOTA') => {
    setError(null);
    setLoading(type);
    try {
      if (type === 'EVM') {
        await connectEvm();
      } else {
        await connectIota();
      }
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet');
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setOpen(false);
  };

  if (isConnected) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 border-gray-600 bg-gray-800 text-white hover:bg-gray-700 ${compact ? 'px-2 py-1' : ''}`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          <span className="hidden sm:inline">{walletType}</span>
          <span className="font-mono text-xs">{truncate(address)}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
            <div className="px-4 py-3 text-xs text-gray-400">
              Connected to {walletType}
              <div className="mt-1 font-mono text-white break-all">{address}</div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-2 py-1' : ''}`}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
          <div className="px-4 py-3 text-xs text-gray-400">Choose a wallet to connect</div>
          
          <button
            onClick={() => handleConnect('EVM')}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-700"
            disabled={loading !== null}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">MetaMask</div>
                <div className="text-xs text-gray-400">EVM/Scroll Network</div>
              </div>
            </div>
            {loading === 'EVM' && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            )}
          </button>
          
          <button
            onClick={() => handleConnect('IOTA')}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-700"
            disabled={loading !== null}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">I</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">IOTA Wallet</div>
                <div className="text-xs text-gray-400">@iota/dapp-kit</div>
              </div>
            </div>
            {loading === 'IOTA' && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            )}
          </button>
          
          {error && (
            <div className="px-4 py-2 text-xs text-red-400 bg-red-900/20 border-t border-gray-600">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
