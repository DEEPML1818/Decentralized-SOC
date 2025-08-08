
import React from 'react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { useWallet } from '../providers/WalletProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

type Role = 'Client' | 'Analyst' | 'Certifier';

interface WalletGateProps {
  requiredRole?: Role;
  roleCopy?: string;
  className?: string;
  children: React.ReactNode;
}

export const WalletGate: React.FC<WalletGateProps> = ({
  requiredRole,
  roleCopy,
  className,
  children,
}) => {
  const { isConnected, roles, address } = useWallet();
  
  // Check if user has the required role
  const hasRole = requiredRole ? roles.includes(requiredRole) : true;

  const getDefaultRoleCopy = (role?: Role) => {
    switch (role) {
      case 'Analyst':
        return 'Connect your wallet to access the dSOC Analyst Dashboard. Please connect your wallet with analyst role to access incident tickets.';
      case 'Certifier':
        return 'Connect your wallet to access the dSOC Certifier Dashboard. Please connect your wallet with certifier role to review and approve reports.';
      case 'Client':
        return 'Connect your wallet to access the dSOC Client Portal. Please connect your wallet with client role to submit and track incidents.';
      default:
        return 'Connect your wallet to continue using the dSOC platform.';
    }
  };

  if (!isConnected) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 ${className}`}>
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-blue-500 mb-4" />
            <CardTitle className="text-2xl text-blue-500">
              dSOC {requiredRole || 'Security'} Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-500/30 bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                {roleCopy || getDefaultRoleCopy(requiredRole)}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <ConnectWalletButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasRole && requiredRole) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 ${className}`}>
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-2xl text-red-500">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500/30 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">
                Your wallet is connected but does not have the required <strong>{requiredRole}</strong> role.
                Current roles: {roles.length ? roles.join(', ') : 'None'}
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-gray-400">
              <p>Connected Address:</p>
              <p className="font-mono text-xs text-white break-all">{address}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">
                Contact support or request access to the {requiredRole} role.
              </p>
              <ConnectWalletButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};
