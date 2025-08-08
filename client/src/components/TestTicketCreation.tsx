import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { evmContractService } from '@/lib/evm-contract';
import { useWallet } from '@/components/providers/WalletProvider';
import { TestTube, Zap, AlertTriangle } from 'lucide-react';

export function TestTicketCreation() {
  const { toast } = useToast();
  const { evmAddress, isEVMConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [testTitle, setTestTitle] = useState('Test Security Incident #' + Date.now());
  const [testAmount, setTestAmount] = useState('100');

  const handleTestCreateTicket = async () => {
    if (!isEVMConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      toast({
        title: "🧪 Testing Ticket Creation",
        description: "Creating test ticket with CLT tokens...",
      });

      console.log('Testing ticket creation with:', { testTitle, testAmount, evmAddress });

      const result = await evmContractService.createTicket(testTitle, testAmount);

      console.log('Test ticket creation result:', result);

      toast({
        title: "✅ Test Successful!",
        description: `Ticket created! ID: ${result.ticketId}, TX: ${result.txHash?.slice(0, 10)}...`,
      });

      // Update the test title for next test
      setTestTitle('Test Security Incident #' + Date.now());

    } catch (error: any) {
      console.error('Test ticket creation failed:', error);
      
      let errorMessage = "Failed to create test ticket";
      
      if (error.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient ETH for gas fees";
      } else if (error.message?.includes('user rejected')) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message?.includes('CLT balance')) {
        errorMessage = error.message;
      } else if (error.code === 4001) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEVMConnected) {
    return (
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Connect MetaMask</h3>
          <p className="text-gray-300">
            Please connect your MetaMask wallet to test ticket creation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <TestTube className="h-5 w-5" />
          Test Ticket Creation
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Test the createTicket function with automatic CLT minting
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test Title
          </label>
          <Input
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            placeholder="Test incident title"
            className="bg-gray-800/50 border-blue-500/30 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CLT Amount
          </label>
          <Input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            placeholder="100"
            className="bg-gray-800/50 border-blue-500/30 text-white"
          />
        </div>

        <Button
          onClick={handleTestCreateTicket}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Creating Test Ticket...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Test Create Ticket
            </>
          )}
        </Button>

        <div className="text-xs text-gray-400 mt-4">
          <p>This will:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your CLT balance</li>
            <li>Mint CLT tokens if needed (up to 1000)</li>
            <li>Approve CLT spending</li>
            <li>Create ticket on SOC contract</li>
            <li>Return ticket ID and staking pool</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}