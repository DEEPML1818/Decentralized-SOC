import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./WalletProvider";
import IncidentReport from "./IncidentReport";
import EVMIncidentReport from "./EVMIncidentReport";
import CasesList from "./CasesList";
import UnifiedStakingDashboard from "./UnifiedStakingDashboard";

// Removed unused staking pool components - using only UnifiedStakingDashboard
import CaseDetailModal from "./CaseDetailModal";
import AIAssistant from "./AIAssistant";
import SmartContractAudit from "./SmartContractAudit";
import { evmContractService } from "@/lib/evm-contract";
import {
  Shield,
  AlertTriangle,
  Users,
  TrendingUp,
  Brain,
  Code,
  Coins,
  Activity,
  DollarSign,
  Zap
} from "lucide-react";
import EVMBalanceDisplay from './EVMBalanceDisplay';

interface DashboardProps {
  currentRole: string;
}

export default function Dashboard({ currentRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [evmStats, setEvmStats] = useState({
    ethBalance: "0",
    cltBalance: "0",
    totalStaked: "0",
  });

  const { walletType, evmAddress, iotaAddress, isEVMConnected, isIOTAConnected } = useWallet();
  const { toast } = useToast();

  // Load EVM statistics
  useEffect(() => {
    const loadEVMStats = async () => {
      if (walletType === 'evm' && isEVMConnected && evmAddress) {
        try {
          const [ethBalance, cltBalance, stakeInfo] = await Promise.all([
            evmContractService.getETHBalance(evmAddress),
            evmContractService.getCLTBalance(evmAddress),
            evmContractService.getStakeInfo(evmAddress)
          ]);

          setEvmStats({
            ethBalance: ethBalance,
            cltBalance: evmContractService.formatCLT(cltBalance),
            totalStaked: evmContractService.formatCLT(stakeInfo.amount),
          });
        } catch (error) {
          console.error('Failed to load EVM stats:', error);
        }
      }
    };

    loadEVMStats();
  }, [walletType, isEVMConnected, evmAddress]);

  const isWalletConnected = walletType === 'evm' ? isEVMConnected : isIOTAConnected;
  const currentAddress = walletType === 'evm' ? evmAddress : iotaAddress;

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="cyber-pulse">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </div>
            <h1 className="text-4xl font-bold text-red-500 mb-4 font-mono">dSOC Security Center</h1>
            <p className="text-xl text-gray-300 mb-4">
              {walletType === 'evm' ? 'EVM dSOC Platform' : 'IOTA dSOC Platform'}
            </p>
            <p className="text-gray-300 mb-8">
              {walletType === 'evm' 
                ? 'Please connect your MetaMask wallet to access EVM features' 
                : 'Please connect your IOTA wallet to access IOTA features'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show features based on connected wallet type - prevent confusion
  const tabs = isEVMConnected ? [
    { id: "incidents", label: "🚨 Security Incidents", icon: AlertTriangle },
    { id: "tickets", label: "🛡️ Case Management", icon: Shield },
    { id: "pools", label: "💰 Security Pools", icon: Coins },
    { id: "staking", label: "📈 Staking Hub", icon: TrendingUp },
    { id: "rewards", label: "🎯 Reward Center", icon: DollarSign },
    { id: "ai", label: "🤖 AI Analyst", icon: Brain },
    { id: "audit", label: "🔍 Smart Audit", icon: Code },
  ] : isIOTAConnected ? [
    { id: "incidents", label: "🚨 Security Incidents", icon: AlertTriangle },
    { id: "tickets", label: "🛡️ Case Management", icon: Shield },
    { id: "staking", label: "📈 IOTA Rewards", icon: TrendingUp },
    { id: "ai", label: "🤖 AI Analyst", icon: Brain },
  ] : [];

  const statCards = walletType === 'evm' ? [
    {
      title: "ETH Balance",
      value: `${parseFloat(evmStats.ethBalance).toFixed(4)} ETH`,
      icon: DollarSign,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10 border-orange-500/30"
    },
    {
      title: "CLT Tokens",
      value: `${parseFloat(evmStats.cltBalance).toFixed(2)} CLT`,
      icon: Coins,
      color: "text-green-400",
      bgColor: "bg-green-500/10 border-green-500/30"
    },
    {
      title: "Staked CLT",
      value: `${parseFloat(evmStats.totalStaked).toFixed(2)} CLT`,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30"
    },
    {
      title: "Network",
      value: "Scroll EVM",
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/30"
    }
  ] : [
    {
      title: "Active Tickets",
      value: "12",
      icon: Shield,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30"
    },
    {
      title: "Resolved Issues",
      value: "156",
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-green-500/10 border-green-500/30"
    },
    {
      title: "Total Rewards",
      value: "2,450 IOTA",
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 border-yellow-500/30"
    },
    {
      title: "Network",
      value: "IOTA Testnet",
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="cyber-pulse mb-4">
            <Shield className="h-12 w-12 text-red-500 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-red-500 mb-2 font-mono">
            dSOC Security Center
          </h1>
          <div className="space-y-2">
            <p className="text-gray-300">
              Role: <span className="text-red-400 font-bold">{currentRole}</span> | 
              <span className="text-red-400 font-bold">{isEVMConnected ? 'EVM' : 'IOTA'}</span> Wallet: 
              <span className="text-red-400 font-mono">{currentAddress?.slice(0, 6)}...{currentAddress?.slice(-4)}</span>
            </p>
            {isEVMConnected && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-red-400 text-lg font-mono font-bold cyber-pulse">
                      ⚡ {parseFloat(evmStats.ethBalance).toFixed(6)} ETH
                    </p>
                    <p className="text-xs text-gray-400">Scroll Sepolia Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-400 text-sm font-mono">
                      🪙 {parseFloat(evmStats.cltBalance).toFixed(2)} CLT
                    </p>
                    <p className="text-xs text-gray-400">Available Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-400 text-sm font-mono">
                      🔒 {parseFloat(evmStats.totalStaked).toFixed(2)} CLT
                    </p>
                    <p className="text-xs text-gray-400">Staked Amount</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`cyber-glass ${stat.bgColor} security-scan`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color} font-mono`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-red-500/30">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 font-mono ${
                activeTab === tab.id
                  ? "btn-cyber cyber-pulse text-white"
                  : "text-gray-300 hover:text-red-400 hover:bg-red-950/30 cyber-glass"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "incidents" && (
          <div>
            {walletType === 'evm' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EVMIncidentReport onClose={() => setActiveTab("tickets")} />
                </div>
                <div>
                  <EVMBalanceDisplay />
                </div>
              </div>
            ) : (
              <IncidentReport onClose={() => setActiveTab("tickets")} />
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div>
            <CasesList walletType={walletType} />
          </div>
        )}

        {activeTab === "pools" && isEVMConnected && (
          <div>
            <Card className="cyber-glass bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Security Pools
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Use the CLT Staking Hub for all staking operations with CLT token: 0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveTab("staking")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Go to CLT Staking Hub
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "staking" && (
          <div>
            <UnifiedStakingDashboard />
          </div>
        )}

        {activeTab === "ai" && (
          <div>
            <AIAssistant />
          </div>
        )}

        {activeTab === "rewards" && isEVMConnected && (
          <div>
            <Card className="cyber-glass bg-red-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  CLT Reward Center
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Visit the dedicated Reward Manager to mint CLT tokens for analysts, certifiers, and stakers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.open('/rewards', '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Open Reward Manager
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <SmartContractAudit />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}