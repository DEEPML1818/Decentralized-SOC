
import React from 'react';
import { ConnectWalletButton } from '../wallet/ConnectWalletButton';
import { Shield } from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <div>
              <span className="text-lg font-bold text-blue-500">dSOC</span>
              <span className="ml-2 text-xs text-gray-400">Decentralized Security Operations Center</span>
            </div>
          </div>
          <ConnectWalletButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
