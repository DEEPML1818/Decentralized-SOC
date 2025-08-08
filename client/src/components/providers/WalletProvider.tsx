import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrentAccount } from '@iota/dapp-kit';
import { evmContractService } from '../../lib/evm-contract';

export interface WalletContext {
  // Basic connection state
  isConnected: boolean
  isEVMConnected: boolean
  isIOTAConnected: boolean
  walletType: 'EVM' | 'IOTA' | null
  address: string | null
  evmAddress: string | null
  iotaAddress: string | null
  roles: string[]
  
  // Connection methods (supporting both naming conventions)
  connectEvm: () => Promise<void>
  connectIota: () => Promise<void>
  connectEVMWallet: () => Promise<void>
  connectIOTAWallet: () => Promise<void>
  disconnect: () => Promise<void>
  disconnectWallet: () => void
  setWalletType: (type: 'EVM' | 'IOTA' | null) => void
  assignRole: (role: string) => Promise<void>
}

const WalletContextProvider = createContext<WalletContext | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletType, setWalletType] = useState<'EVM' | 'IOTA' | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  // IOTA wallet from dapp-kit
  const iotaAccount = useCurrentAccount();
  const iotaAddress = iotaAccount?.address || null;

  const isConnected = !!evmAddress || !!iotaAddress;
  const isEVMConnected = !!evmAddress;
  const isIOTAConnected = !!iotaAddress;
  const address = evmAddress || iotaAddress || null;

  const connectEvm = async (): Promise<void> => {
    try {
      const connectedAddress = await evmContractService.connectWallet();
      setEvmAddress(connectedAddress);
      setWalletType('EVM');
      await fetchUserRoles(connectedAddress);
    } catch (error: any) {
      console.error('Failed to connect EVM wallet:', error);
      throw error;
    }
  };

  const connectIota = async (): Promise<void> => {
    try {
      // IOTA connection is handled automatically by @iota/dapp-kit
      // We just need to set the wallet type when an IOTA account is available
      if (iotaAddress) {
        setWalletType('IOTA');
        await fetchUserRoles(iotaAddress);
      } else {
        throw new Error('IOTA wallet not available');
      }
    } catch (error: any) {
      console.error('Failed to connect IOTA wallet:', error);
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    setEvmAddress(null);
    setWalletType(null);
    setRoles([]);
    localStorage.removeItem('connectedWallet');
  };

  const disconnectWallet = (): void => {
    disconnect();
  };

  const assignRole = async (role: string): Promise<void> => {
    try {
      const currentAddress = address;
      if (!currentAddress) {
        throw new Error('No wallet connected');
      }

      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: currentAddress,
          role: role
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Role assigned:', data);
        await fetchUserRoles(currentAddress);
      } else {
        throw new Error('Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  };

  const fetchUserRoles = async (userAddress: string): Promise<void> => {
    try {
      const response = await fetch(`/api/roles/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      setRoles([]);
    }
  };

  // Handle IOTA account changes
  useEffect(() => {
    if (iotaAddress && walletType === 'IOTA') {
      fetchUserRoles(iotaAddress);
    } else if (iotaAddress && !walletType) {
      setWalletType('IOTA');
      fetchUserRoles(iotaAddress);
    }
  }, [iotaAddress, walletType]);

  // Check if EVM wallet is already connected on mount
  useEffect(() => {
    const checkEVMConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const account = accounts[0];
            setEvmAddress(account);
            setWalletType('EVM');
            await fetchUserRoles(account);
          }
        } catch (error) {
          console.error('Failed to check EVM connection:', error);
        }
      }
    };

    checkEVMConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          const account = accounts[0];
          setEvmAddress(account);
          setWalletType('EVM');
          await fetchUserRoles(account);
        } else {
          setEvmAddress(null);
          setWalletType(null);
          setRoles([]);
        }
      };

      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const contextValue: WalletContext = {
    isConnected,
    isEVMConnected,
    isIOTAConnected,
    walletType,
    address,
    evmAddress,
    iotaAddress,
    roles,
    connectEvm,
    connectIota,
    connectEVMWallet: connectEvm, // Alias for compatibility
    connectIOTAWallet: connectIota, // Alias for compatibility
    disconnect,
    disconnectWallet,
    setWalletType,
    assignRole,
  };

  return (
    <WalletContextProvider.Provider value={contextValue}>
      {children}
    </WalletContextProvider.Provider>
  );
}

export const useWallet = (): WalletContext => {
  const context = useContext(WalletContextProvider);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};