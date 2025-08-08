import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "./providers/WalletProvider";
import { ConnectButton } from "@iota/dapp-kit";
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
  Zap,
} from "lucide-react";
import EVMBalanceDisplay from "./EVMBalanceDisplay";

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
  // Assume these are available from your context or props
  const userRole = currentRole; // Replace with actual role state if dynamic
  const assignRole = async (role: string) => {
    // Mock function for role assignment
    console.log(`Assigning role: ${role}`);
    // In a real app, this would involve a contract call or API request
    // For now, we'll simulate success and update the local state if needed
    return true; // Simulate success
  };
  const getDefaultTabForRole = (role: string) => {
    switch (role) {
      case "analyst":
        return "incidents";
      case "certifier":
        return "tickets";
      case "client":
        return "incidents";
      default:
        return "incidents";
    }
  };

  const {
    walletType,
    evmAddress,
    iotaAddress,
    isEVMConnected,
    isIOTAConnected,
    connectEVMWallet,
    setWalletType,
  } = useWallet();
  const { toast } = useToast();

  // Load EVM statistics
  useEffect(() => {
    const loadEVMStats = async () => {
      if (walletType === "evm" && isEVMConnected && evmAddress) {
        try {
          const [ethBalance, cltBalance, stakeInfo] = await Promise.all([
            evmContractService.getETHBalance(evmAddress),
            evmContractService.getCLTBalance(evmAddress),
            evmContractService.getStakeInfo(evmAddress),
          ]);

          setEvmStats({
            ethBalance: ethBalance,
            cltBalance: evmContractService.formatCLT(cltBalance),
            totalStaked: evmContractService.formatCLT(stakeInfo.amount),
          });
        } catch (error) {
          console.error("Failed to load EVM stats:", error);
        }
      }
    };

    loadEVMStats();
  }, [walletType, isEVMConnected, evmAddress]);

  const isWalletConnected =
    walletType === "evm" ? isEVMConnected : isIOTAConnected;
  const currentAddress = walletType === "evm" ? evmAddress : iotaAddress;

  const handlePortalAccess = async (portalType: string) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to access portals",
        variant: "destructive",
      });
      return;
    }

    const currentAddress = evmAddress || iotaAddress;
    if (!currentAddress) {
      toast({
        title: "No Wallet Address",
        description: "Unable to detect wallet address",
        variant: "destructive",
      });
      return;
    }

    // Auto-assign role if user doesn't have one
    if (!userRole) {
      try {
        const success = await assignRole(portalType);
        if (success) {
          toast({
            title: "Role Assigned",
            description: `You have been assigned the ${portalType} role`,
          });
        } else {
          toast({
            title: "Role Assignment Failed",
            description: "Unable to assign role. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to assign role",
          variant: "destructive",
        });
        return;
      }
    }

    // Check if user has the required role for this portal
    if (userRole !== portalType && userRole !== "admin") {
      toast({
        title: "Access Denied",
        description: `This portal requires ${portalType} role. Your current role: ${userRole || "none"}`,
        variant: "destructive",
      });
      return;
    }

    setActiveTab(getDefaultTabForRole(portalType));
    toast({
      title: "Portal Access Granted",
      description: `Welcome to the ${portalType} portal`,
    });
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="cyber-pulse">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </div>
            <h1 className="text-4xl font-bold text-red-500 mb-4 font-mono">
              dSOC Security Center
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              {walletType === "evm"
                ? "EVM dSOC Platform"
                : "IOTA dSOC Platform"}
            </p>
            <p className="text-gray-300 mb-8">
              {walletType === "evm"
                ? "Please connect your MetaMask wallet to access EVM features"
                : "Please connect your IOTA wallet to access IOTA features"}
            </p>

            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
              <h3 className="text-red-400 font-semibold mb-4">
                Connect Your Wallet
              </h3>
              {walletType === "evm" ? (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    To access the EVM dSOC platform, connect your MetaMask
                    wallet
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        await connectEVMWallet();
                        toast({
                          title: "Wallet Connected",
                          description: "Successfully connected to EVM wallet",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Connection Failed",
                          description:
                            error.message || "Failed to connect wallet",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Connect MetaMask
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    To access the IOTA dSOC platform, connect your IOTA wallet
                  </p>
                  <ConnectButton />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
              >
                Back to Home
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setWalletType(walletType === "evm" ? "iota" : "evm")
                }
                className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
              >
                Switch to {walletType === "evm" ? "IOTA" : "EVM"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show features based on connected wallet type - prevent confusion
  const tabs = isEVMConnected
    ? [
        {
          id: "incidents",
          label: "🚨 Security Incidents",
          icon: AlertTriangle,
        },
        { id: "tickets", label: "🛡️ Case Management", icon: Shield },
        { id: "staking", label: "📈 Staking Hub", icon: TrendingUp },
        { id: "rewards", label: "🎯 Reward Center", icon: DollarSign },
        { id: "ai", label: "🤖 AI Analyst", icon: Brain },
        { id: "audit", label: "🔍 Smart Audit", icon: Code },
      ]
    : isIOTAConnected
      ? [
          {
            id: "incidents",
            label: "🚨 Security Incidents",
            icon: AlertTriangle,
          },
          { id: "tickets", label: "🛡️ Case Management", icon: Shield },
          { id: "staking", label: "📈 IOTA Rewards", icon: TrendingUp },
          { id: "ai", label: "🤖 AI Analyst", icon: Brain },
        ]
      : [];

  const statCards =
    walletType === "evm"
      ? [
          {
            title: "ETH Balance",
            value: `${parseFloat(evmStats.ethBalance).toFixed(4)} ETH`,
            icon: DollarSign,
            color: "text-orange-400",
            bgColor: "bg-orange-500/10 border-orange-500/30",
          },
          {
            title: "CLT Tokens",
            value: `${parseFloat(evmStats.cltBalance).toFixed(2)} CLT`,
            icon: Coins,
            color: "text-green-400",
            bgColor: "bg-green-500/10 border-green-500/30",
          },
          {
            title: "Staked CLT",
            value: `${parseFloat(evmStats.totalStaked).toFixed(2)} CLT`,
            icon: TrendingUp,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10 border-blue-500/30",
          },
          {
            title: "Network",
            value: "Scroll EVM",
            icon: Zap,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10 border-purple-500/30",
          },
        ]
      : [
          {
            title: "Connected Address",
            value: iotaAddress
              ? `${iotaAddress.slice(0, 8)}...${iotaAddress.slice(-6)}`
              : "Not Connected",
            icon: Shield,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10 border-blue-500/30",
          },
          {
            title: "Wallet Status",
            value: isIOTAConnected ? "Connected" : "Disconnected",
            icon: Activity,
            color: isIOTAConnected ? "text-green-400" : "text-red-400",
            bgColor: isIOTAConnected
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30",
          },
          {
            title: "Current Role",
            value: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
            icon: Users,
            color: "text-yellow-400",
            bgColor: "bg-yellow-500/10 border-yellow-500/30",
          },
          {
            title: "Network",
            value: "IOTA Testnet",
            icon: Zap,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10 border-purple-500/30",
          },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="cyber-pulse mb-4">
            <Shield className="text-red-500 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-red-500 mb-2 font-mono">
            dSOC Security Center
          </h1>
          <div className="space-y-2">
            <p className="text-gray-300">
              Role:{" "}
              <span className="text-red-400 font-bold">{currentRole}</span> |
              <span className="text-red-400 font-bold">
                {isEVMConnected ? "EVM" : "IOTA"}
              </span>{" "}
              Wallet:
              <span className="text-red-400 font-mono">
                {currentAddress?.slice(0, 6)}...{currentAddress?.slice(-4)}
              </span>
            </p>

            {/* Quick Access Buttons */}
            <div className="flex gap-2 justify-center mt-4">
              <Button
                onClick={() => (window.location.href = "/analyst")}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 font-mono"
              >
                📊 Analyst Portal
              </Button>
              <Button
                onClick={() => (window.location.href = "/certifier")}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 font-mono"
              >
                ⭐ Certifier Portal
              </Button>
              <Button
                onClick={() => (window.location.href = "/client")}
                size="sm"
                className="bg-green-600 hover:bg-green-700 font-mono"
              >
                🏢 Client Portal
              </Button>
            </div>
            {isEVMConnected && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-red-400 text-lg font-mono font-bold cyber-pulse">
                      ⚡ {parseFloat(evmStats.ethBalance).toFixed(6)} ETH
                    </p>
                    <p className="text-xs text-gray-400">
                      Scroll Sepolia Balance
                    </p>
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

        {/* Current Role & Balance Display */}
        <Card className="bg-slate-800/50 border-red-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-semibold">
                    Security Officer
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300">
                      Role:{" "}
                      <Badge
                        className={`${
                          userRole === "analyst"
                            ? "bg-blue-500"
                            : userRole === "certifier"
                              ? "bg-purple-500"
                              : userRole === "client"
                                ? "bg-green-500"
                                : "bg-gray-500"
                        } text-white text-xs`}
                      >
                        {userRole || "None"}
                      </Badge>
                    </span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-300">
                      {walletType === "evm" ? "EVM" : "IOTA"} Wallet:
                      <span className="ml-1 font-mono text-xs">
                        {isWalletConnected
                          ? `${(evmAddress || iotaAddress)?.slice(0, 6)}...${(evmAddress || iotaAddress)?.slice(-4)}`
                          : "Not connected"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {walletType === "evm" && isEVMConnected && (
                <EVMBalanceDisplay address={evmAddress!} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className={`cyber-glass ${stat.bgColor} security-scan`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color} font-mono`}>
                      {stat.value}
                    </p>
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
              {walletType === "evm" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <EVMIncidentReport
                      onClose={() => setActiveTab("tickets")}
                    />
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
                    Visit the dedicated Reward Manager to mint CLT tokens for
                    analysts, certifiers, and stakers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.open("/rewards", "_blank")}
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
