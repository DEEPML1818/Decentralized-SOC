import React from 'react';
import { ConnectWalletButton } from '../wallet/ConnectWalletButton';
import { Link, useLocation } from 'wouter';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/70 backdrop-blur w-full">
        <div className="flex items-center justify-between px-4 py-3 w-full">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-xl font-bold text-blue-500">dSOC</span>
                <span className="text-sm text-gray-400">Decentralized SOC</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/">
                <a className={`text-sm px-3 py-2 rounded-md transition-colors ${
                  location === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}>
                  Home
                </a>
              </Link>
              <Link href="/faucet">
                <a className={`text-sm px-3 py-2 rounded-md transition-colors ${
                  location === '/faucet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}>
                  Faucet
                </a>
              </Link>
              <Link href="/dapp">
                <a className={`text-sm px-3 py-2 rounded-md transition-colors ${
                  location === '/dapp' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}>
                  dApp
                </a>
              </Link>
            </nav>
          </div>
          
          <ConnectWalletButton />
        </div>
      </header>
      <main className="w-full p-4 min-h-[calc(100vh-80px)]">{children}</main>
    </div>
  );
};