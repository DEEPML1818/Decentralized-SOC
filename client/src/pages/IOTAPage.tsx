
import { useState, useEffect } from "react";
import { useCurrentAccount } from "@iota/dapp-kit";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

export default function IOTAPage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  const { toast } = useToast();
  const iotaAccount = useCurrentAccount();

  useEffect(() => {
    if (iotaAccount) {
      toast({
        title: "Welcome to IOTA dSOC!",
        description: "You're now using the IOTA blockchain for all transactions",
      });
    }
  }, [iotaAccount, toast]);

  if (!iotaAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">IOTA dSOC Platform</h1>
          <p className="text-gray-300 mb-8">Please connect your IOTA wallet to continue</p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <p className="text-blue-300 text-sm">
              This page is exclusively for IOTA blockchain users. All transactions will use IOTA tokens.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <Header currentRole={selectedRole} onRoleChange={setSelectedRole} />
      <Dashboard currentRole={selectedRole} />
    </div>
  );
}
