
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrentAccount } from '@iota/dapp-kit';
import { evmContractService } from '@/lib/evm-contract';

// Completely separate blockchain types - no mixing
export type WalletType = 'iota' | 'evm';

interface WalletContextType {
  walletType: WalletType; // Selected blockchain - either IOTA OR EVM, never both
  setWalletType: (type: WalletType) => void;
  evmAddress: string | null; // EVM-only wallet address
  iotaAddress: string | null; // IOTA-only wallet address
  connectEVMWallet: () => Promise<string | null>;
  disconnectEVMWallet: () => void;
  isEVMConnected: boolean;
  isIOTAConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletType, setWalletType] = useState<WalletType>('iota');
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  
  // IOTA wallet from dapp-kit
  const iotaAccount = useCurrentAccount();
  const iotaAddress = iotaAccount?.address || null;
  
  const isEVMConnected = !!evmAddress;
  const isIOTAConnected = !!iotaAddress;

  const connectEVMWallet = async (): Promise<string | null> => {
    try {
      const address = await evmContractService.connectWallet();
      setEvmAddress(address);
      return address;
    } catch (error: any) {
      console.error('Failed to connect EVM wallet:', error);
      // Re-throw the error so the UI can handle it properly
      throw error;
    }
  };

  const disconnectEVMWallet = () => {
    setEvmAddress(null);
  };

  // Check if EVM wallet is already connected on mount
  useEffect(() => {
    const checkEVMConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setEvmAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to check EVM connection:', error);
        }
      }
    };

    checkEVMConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setEvmAddress(accounts[0]);
        } else {
          setEvmAddress(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const value: WalletContextType = {
    walletType,
    setWalletType,
    evmAddress,
    iotaAddress,
    connectEVMWallet,
    disconnectEVMWallet,
    isEVMConnected,
    isIOTAConnected,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Global window ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}
