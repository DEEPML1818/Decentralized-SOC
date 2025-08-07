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
  connectEVMWallet: () => Promise<void>;
  disconnectEVMWallet: () => void;
  isEVMConnected: boolean;
  isIOTAConnected: boolean;
  userRole: string | null;
  assignRole: (role: string) => Promise<boolean>;
  getUserRole: (address: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletType, setWalletType] = useState<WalletType>('iota');
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // IOTA wallet from dapp-kit
  const iotaAccount = useCurrentAccount();
  const iotaAddress = iotaAccount?.address || null;

  const isEVMConnected = !!evmAddress;
  const isIOTAConnected = !!iotaAddress;

  const connectEVMWallet = async (): Promise<void> => {
    try {
      const address = await evmContractService.connectWallet();
      setEvmAddress(address);
      // We will fetch the role after the address is set
    } catch (error: any) {
      console.error('Failed to connect EVM wallet:', error);
      // Re-throw the error so the UI can handle it properly
      throw error;
    }
  };

  const disconnectEVMWallet = () => {
    setEvmAddress(null);
    setWalletType(null);
    setUserRole(null);
    localStorage.removeItem('connectedWallet');
  };

  const assignRole = async (role: string): Promise<boolean> => {
    const currentAddress = evmAddress || iotaAddress;
    if (!currentAddress) return false;

    try {
      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: currentAddress, role })
      });

      if (response.ok) {
        setUserRole(role);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('Role assignment failed:', error);
      return false;
    }
  };

  const getUserRole = async (address: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/roles/${address}`);
      if (response.ok) {
        const data = await response.json();
        return data.role;
      }
    } catch (error) {
      console.error('Failed to get user role:', error);
    }
    return null;
  };

  // Check if EVM wallet is already connected on mount and fetch its role
  useEffect(() => {
    const checkEVMConnectionAndRole = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const account = accounts[0];
            setEvmAddress(account);
            setWalletType('evm');
            const role = await getUserRole(account);
            setUserRole(role);
          }
        } catch (error) {
          console.error('Failed to check EVM connection:', error);
        }
      }
    };

    checkEVMConnectionAndRole();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          const account = accounts[0];
          setEvmAddress(account);
          setWalletType('evm');
          getUserRole(account).then(setUserRole);
        } else {
          setEvmAddress(null);
          setWalletType('iota'); // Default to IOTA if EVM disconnects
          setUserRole(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [getUserRole]); // Depend on getUserRole

  // Fetch IOTA user role when IOTA address is available
  useEffect(() => {
    if (iotaAddress) {
      setWalletType('iota');
      getUserRole(iotaAddress).then(setUserRole);
    }
  }, [iotaAddress]);


  const value = {
    walletType,
    setWalletType,
    evmAddress,
    iotaAddress,
    connectEVMWallet,
    disconnectEVMWallet,
    isEVMConnected: !!evmAddress,
    isIOTAConnected: !!iotaAccount,
    userRole,
    assignRole,
    getUserRole
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