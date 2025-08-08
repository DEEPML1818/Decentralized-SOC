import { useState } from "react";
import { useWallet } from "@/components/providers/WalletProvider";
import Header from "@/components/Header";
import CLTRewardManager from "@/components/CLTRewardManager";

export default function RewardsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('client');
  const { isEVMConnected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      <Header onRoleChange={setSelectedRole} currentRole={selectedRole} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-400 mb-2">CLT Reward Manager</h1>
          <p className="text-gray-300">Mint and distribute CLT token rewards for analysts, certifiers, and stakers</p>
        </div>
        
        <CLTRewardManager />
      </main>
    </div>
  );
}