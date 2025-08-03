import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./WalletProvider";
import IncidentReport from "./IncidentReport";
import EVMIncidentReport from "./EVMIncidentReport";
import TicketList from "./TicketList";
import StakingRewards from "./StakingRewards";
import EVMStakingRewards from "./EVMStakingRewards";
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

interface DashboardProps {
  currentRole: string;
}

export default function Dashboard({ currentRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("incidents");
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
            ethBalance: evmContractService.formatETH(ethBalance),
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            {walletType === 'evm' ? 'EVM dSOC Platform' : 'IOTA dSOC Platform'}
          </h1>
          <p className="text-gray-300 mb-8">
            {walletType === 'evm' 
              ? 'Please connect your MetaMask wallet to access EVM features' 
              : 'Please connect your IOTA wallet to access IOTA features'
            }
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "incidents", label: "Report Incident", icon: AlertTriangle },
    { id: "tickets", label: "Ticket Management", icon: Shield },
    { id: "staking", label: "Staking Rewards", icon: TrendingUp },
    { id: "ai", label: "AI Assistant", icon: Brain },
    { id: "audit", label: "Smart Contract Audit", icon: Code },
  ];

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {walletType === 'evm' ? 'EVM' : 'IOTA'} Security Operations Center
        </h1>
        <p className="text-gray-300">
          Role: <Badge variant="outline" className="ml-1 text-blue-400 border-blue-500/30">{currentRole}</Badge>
          {currentAddress && (
            <span className="ml-4 text-sm text-gray-400">
              Connected: {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 ${
              activeTab === tab.id
                ? walletType === 'evm' 
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
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
            {walletType === 'evm' ? <EVMIncidentReport /> : <IncidentReport />}
          </div>
        )}

        {activeTab === "tickets" && (
          <div>
            <TicketList currentRole={currentRole} />
          </div>
        )}

        {activeTab === "staking" && (
          <div>
            {walletType === 'evm' ? <EVMStakingRewards /> : <StakingRewards />}
          </div>
        )}

        {activeTab === "ai" && (
          <div>
            <AIAssistant />
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <SmartContractAudit />
          </div>
        )}
      </div>
    </div>
  );
}