import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  BookOpen, 
  ChevronRight, 
  Shield, 
  Wallet, 
  Coins, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Play,
  Settings,
  Database,
  Code
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function UserGuide() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Connect Your Wallet",
      description: "Connect either your IOTA wallet or EVM wallet (MetaMask) to get started",
      icon: <Wallet className="h-6 w-6" />,
      details: [
        "For IOTA: Use the IOTA wallet button in the top right",
        "For EVM: Use MetaMask or compatible wallet",
        "Switch to Scroll Sepolia testnet for EVM operations"
      ]
    },
    {
      title: "Select Your Role",
      description: "Choose your role in the dSOC ecosystem",
      icon: <Users className="h-6 w-6" />,
      details: [
        "Client: Submit security incidents and reports",
        "Analyst: Analyze incidents and provide solutions", 
        "Certifier: Validate analyst reports and solutions"
      ]
    },
    {
      title: "Manage CLT Tokens",
      description: "Stake CLT tokens to participate in the ecosystem",
      icon: <Coins className="h-6 w-6" />,
      details: [
        "Stake CLT tokens to earn rewards",
        "Higher stakes = higher earning potential",
        "Unstake anytime (may have cooldown periods)"
      ]
    },
    {
      title: "Submit Incidents",
      description: "Report security incidents for analysis",
      icon: <FileText className="h-6 w-6" />,
      details: [
        "Provide detailed incident descriptions",
        "Include affected systems and evidence",
        "AI analysis helps categorize severity"
      ]
    },
    {
      title: "Earn Rewards",
      description: "Complete tasks to earn CLT token rewards",
      icon: <CheckCircle className="h-6 w-6" />,
      details: [
        "Analysts earn by providing quality reports",
        "Certifiers earn by validating solutions",
        "Clients can earn by reporting valid incidents"
      ]
    }
  ];

  const blockchainFeatures = [
    {
      title: "IOTA Integration",
      description: "Feeless transactions and data integrity",
      features: ["Zero transaction fees", "Immutable audit trails", "Scalable architecture"]
    },
    {
      title: "EVM Compatibility", 
      description: "Smart contracts on Scroll Sepolia",
      features: ["CLT token staking", "Automated rewards", "Cross-chain interoperability"]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          dSOC User Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Learn how to use the Decentralized Security Operations Center platform
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Features</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Follow these steps to get started with dSOC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      currentStep === index 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-border hover:border-blue-300'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        currentStep === index 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{step.title}</h3>
                          <Badge variant={currentStep === index ? "default" : "secondary"}>
                            Step {index + 1}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{step.description}</p>
                        {currentStep === index && (
                          <ul className="mt-3 space-y-1">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-blue-500" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {blockchainFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Scroll Sepolia Testnet</h4>
                <div className="grid gap-2 text-sm">
                  <div><strong>Chain ID:</strong> 534351</div>
                  <div><strong>RPC URL:</strong> https://sepolia-rpc.scroll.io/</div>
                  <div><strong>Explorer:</strong> https://sepolia.scrollscan.dev/</div>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                if (window.ethereum) {
                  window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: '0x8274F',
                      chainName: 'Scroll Sepolia Testnet',
                      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                      rpcUrls: ['https://sepolia-rpc.scroll.io/'],
                      blockExplorerUrls: ['https://sepolia.scrollscan.dev/']
                    }]
                  });
                }
              }}>
                Add Scroll Sepolia to MetaMask
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Client</CardTitle>
                <CardDescription>Submit security incidents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-semibold">Responsibilities:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Report security incidents</li>
                  <li>• Provide evidence and details</li>
                  <li>• Stake CLT for priority handling</li>
                  <li>• Review analyst reports</li>
                </ul>
                <h4 className="font-semibold mt-4">Rewards:</h4>
                <ul className="text-sm space-y-1">
                  <li>• CLT tokens for valid reports</li>
                  <li>• Staking rewards</li>
                  <li>• Priority support benefits</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Analyst</CardTitle>
                <CardDescription>Analyze and solve incidents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-semibold">Responsibilities:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Investigate security incidents</li>
                  <li>• Provide detailed analysis</li>
                  <li>• Submit solution reports</li>
                  <li>• Stake CLT for credibility</li>
                </ul>
                <h4 className="font-semibold mt-4">Rewards:</h4>
                <ul className="text-sm space-y-1">
                  <li>• CLT tokens per report</li>
                  <li>• Bonus for quality work</li>
                  <li>• Reputation building</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Certifier</CardTitle>
                <CardDescription>Validate reports and solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-semibold">Responsibilities:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Review analyst reports</li>
                  <li>• Validate solutions</li>
                  <li>• Approve token distributions</li>
                  <li>• Maintain quality standards</li>
                </ul>
                <h4 className="font-semibold mt-4">Rewards:</h4>
                <ul className="text-sm space-y-1">
                  <li>• CLT tokens per validation</li>
                  <li>• Higher staking rewards</li>
                  <li>• Governance voting power</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Smart Contract Addresses
              </CardTitle>
              <CardDescription>
                Deployed on Scroll Sepolia Testnet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">CLT Reward Token</h4>
                      <p className="text-sm text-muted-foreground">ERC20 token for rewards</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                        0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403
                      </code>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://sepolia.scrollscan.dev/address/0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403" target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Staking Pool</h4>
                      <p className="text-sm text-muted-foreground">CLT token staking contract</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                        0xB480FA23e8d586Af034aae3CA9a0D111E071a01e
                      </code>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://sepolia.scrollscan.dev/address/0xB480FA23e8d586Af034aae3CA9a0D111E071a01e" target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">SOC Service</h4>
                      <p className="text-sm text-muted-foreground">Main dSOC operations contract</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                        0xE87bFbFC9fC93b94756384e07cCa4B1e857bfC94
                      </code>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://sepolia.scrollscan.dev/address/0xE87bFbFC9fC93b94756384e07cCa4B1e857bfC94" target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">CLT Reward Token</h4>
                  <ul className="text-sm space-y-1">
                    <li>• ERC20 standard compliance</li>
                    <li>• Mintable by contract owner</li>
                    <li>• Used for staking and rewards</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Staking Pool</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Stake CLT tokens</li>
                    <li>• Earn block-based rewards</li>
                    <li>• Withdraw anytime</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">SOC Service</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Create security tickets</li>
                    <li>• Assign analysts</li>
                    <li>• Validate and reward</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <p className="text-muted-foreground">
          Need help? Check our documentation or contact support
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" asChild>
            <a href="https://docs.iota.org" target="_blank">
              IOTA Docs <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://scroll.io/docs" target="_blank">
              Scroll Docs <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}