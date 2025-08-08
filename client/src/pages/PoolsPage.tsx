import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/providers/WalletProvider";
import PoolTicketForm from "@/components/PoolTicketForm";
import PoolTicketList from "@/components/PoolTicketList";
import { 
  Plus, 
  FileText, 
  Users, 
  TrendingUp, 
  Shield,
  ArrowLeft
} from "lucide-react";

export default function PoolsPage() {
  const { walletType, isEVMConnected, isIOTAConnected } = useWallet();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  const isConnected = walletType === 'iota' ? isIOTAConnected : isEVMConnected;

  if (showTicketForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowTicketForm(false)}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pools
            </Button>
          </div>
          
          <PoolTicketForm onClose={() => setShowTicketForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Security Analysis Pools</h1>
                <p className="text-gray-400">
                  Submit tickets, participate in analysis, and earn rewards
                </p>
              </div>
            </div>
            
            {isConnected && (
              <Button
                onClick={() => setShowTicketForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Pool Ticket
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {walletType === 'iota' ? 'IOTA Network' : 'Scroll EVM'}
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              Pool-Based Rewards
            </Badge>
          </div>
        </div>

        {!isConnected ? (
          <Card className="bg-slate-800 border-purple-500/20">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">
                Connect your wallet to participate in security analysis pools and earn CLT rewards
              </p>
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Supported Networks: IOTA & Scroll EVM
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="browse" className="data-[state=active]:bg-purple-600">
                <FileText className="h-4 w-4 mr-2" />
                Browse Pools
              </TabsTrigger>
              <TabsTrigger value="my-pools" className="data-[state=active]:bg-purple-600">
                <Users className="h-4 w-4 mr-2" />
                My Participation
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <PoolTicketList />
            </TabsContent>

            <TabsContent value="my-pools" className="space-y-6">
              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Your Pool Activity</CardTitle>
                  <CardDescription>
                    Track your submissions and participation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Your participation history will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Pools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">127</div>
                    <p className="text-xs text-gray-500">+12 this week</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Active Analysts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">89</div>
                    <p className="text-xs text-gray-500">+5 this week</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">15,432 CLT</div>
                    <p className="text-xs text-gray-500">+2,100 this week</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">94.2%</div>
                    <p className="text-xs text-gray-500">+1.2% this week</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">How Pool Rewards Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-3">Reward Distribution</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Base reward set by ticket submitter</li>
                        <li>• Multiplied by severity level (1x - 3x)</li>
                        <li>• Split equally among qualified analysts</li>
                        <li>• Bonus for high-quality submissions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-3">Quality Assurance</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Certifiers validate all submissions</li>
                        <li>• Consensus required for reward distribution</li>
                        <li>• Reputation system tracks performance</li>
                        <li>• Automated smart contract execution</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}