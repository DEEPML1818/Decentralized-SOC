import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { runAudit, quickScan } from "@/lib/audit-service";
import {
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  FileText,
  Sparkles,
  Target,
  Activity,
  Clock,
  Code
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface QuickScanResult {
  score: number;
  issues: Array<{
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
  }>;
}

export default function SmartContractAudit() {
  const [contractCode, setContractCode] = useState("");
  const [auditReport, setAuditReport] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [quickScanResult, setQuickScanResult] = useState<QuickScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { toast } = useToast();

  const handleFullAudit = async () => {
    if (!contractCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter smart contract code to audit",
        variant: "destructive",
      });
      return;
    }

    setIsAuditing(true);
    try {
      const report = await runAudit(contractCode);
      setAuditReport(report || "No audit report generated."); // Ensure report is not undefined
      toast({
        title: "Audit Complete",
        description: "Smart contract audit has been completed successfully",
      });
    } catch (error: any) {
      console.error("Audit failed:", error); // Log the error for debugging
      toast({
        title: "Audit Failed",
        description: `Failed to complete the audit. Please try again. ${error.message || ''}`, // Display error message
        variant: "destructive",
      });
      setAuditReport("Audit failed to generate a report. Please check the console for details.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleQuickScan = async () => {
    if (!contractCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter smart contract code to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const result = await quickScan(contractCode);
      setQuickScanResult(result);
      toast({
        title: "Quick Scan Complete",
        description: "Security scan completed successfully",
      });
    } catch (error: any) {
      console.error("Scan failed:", error); // Log the error for debugging
      toast({
        title: "Scan Failed",
        description: `Failed to complete the security scan. ${error.message || ''}`, // Display error message
        variant: "destructive",
      });
      setQuickScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 2) return 'text-green-400';
    if (score <= 4) return 'text-yellow-400';
    if (score <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const exampleContracts = {
    move: `module dsoc::SOCService {
    use iota::object::{Self, UID};
    use iota::tx_context::{Self, TxContext};
    use iota::transfer;
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;

    struct Ticket has key, store {
        id: UID,
        title: string::String,
        description: string::String,
        category: string::String,
        priority: u8,
        status: u8,
        stake_amount: u64,
        client: address,
        analyst: option::Option<address>,
        created_at: u64,
    }

    public fun create_ticket(
        title: vector<u8>,
        description: vector<u8>,
        category: vector<u8>,
        priority: u8,
        stake: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let ticket = Ticket {
            id: object::new(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            category: string::utf8(category),
            priority,
            status: 0, // Open
            stake_amount: coin::value(&stake),
            client: tx_context::sender(ctx),
            analyst: option::none(),
            created_at: tx_context::epoch(ctx),
        };

        transfer::share_object(ticket);
        transfer::public_transfer(stake, @treasury);
    }
}`,
    solidity: `pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }

    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }
}`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-5">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Smart Contract Auditor
            </h1>
          </div>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            AI-powered security analysis for smart contracts - Powered by Google Gemini
          </p>
        </div>

        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600 text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Full Audit
            </TabsTrigger>
            <TabsTrigger value="scan" className="data-[state=active]:bg-blue-600 text-lg">
              <Zap className="h-5 w-5 mr-2" />
              Quick Scan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-7">
            {/* Contract Input */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-3 text-2xl">
                  <Code className="h-6 w-6" />
                  Contract Code Input
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Paste your smart contract code for comprehensive security analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Textarea
                  placeholder="Paste your smart contract code here..."
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  className="min-h-96 bg-slate-700/50 border-gray-600/30 text-gray-300 font-mono text-lg"
                />

                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setContractCode(exampleContracts.move)}
                    className="border-blue-500/30 hover:bg-blue-500/20 text-lg"
                  >
                    Load Move Example
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setContractCode(exampleContracts.solidity)}
                    className="border-green-500/30 hover:bg-green-500/20 text-lg"
                  >
                    Load Solidity Example
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setContractCode("")}
                    className="border-gray-500/30 hover:bg-gray-500/20 text-lg"
                  >
                    Clear
                  </Button>
                </div>

                <Button
                  onClick={handleFullAudit}
                  disabled={isAuditing || !contractCode.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-5 text-xl"
                  size="lg"
                >
                  {isAuditing ? (
                    <>
                      <Activity className="h-6 w-6 mr-3 animate-spin" />
                      Running Full Security Audit...
                    </>
                  ) : (
                    <>
                      <Shield className="h-6 w-6 mr-3" />
                      Run Full Security Audit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Audit Report */}
            {auditReport && (
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-3 text-2xl">
                    <CheckCircle className="h-6 w-6" />
                    Audit Report
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Comprehensive security analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div className="bg-slate-700/30 rounded-lg p-5 border border-gray-600/30">
                      <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
                        {auditReport.split('\n').map((line, index) => {
                          if (line.startsWith('#')) {
                            return <h2 key={index} className="text-white font-bold text-2xl mb-3">{line.replace(/^#+\s*/, '')}</h2>;
                          }
                          if (line.startsWith('##')) {
                            return <h3 key={index} className="text-purple-300 font-semibold text-xl mb-3">{line.replace(/^#+\s*/, '')}</h3>;
                          }
                          if (line.startsWith('- ') || line.startsWith('* ')) {
                            return <p key={index} className="text-blue-300 ml-4 text-lg">{line}</p>;
                          }
                          if (line.trim() === '') {
                            return <br key={index} />;
                          }
                          return <p key={index} className="mb-3">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scan" className="space-y-7">
            {/* Quick Scan */}
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-3 text-2xl">
                  <Zap className="h-6 w-6" />
                  Quick Security Scan
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Fast vulnerability assessment with severity scoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Textarea
                  placeholder="Paste your smart contract code here..."
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  className="min-h-48 bg-slate-700/50 border-gray-600/30 text-gray-300 font-mono text-lg"
                />

                <Button
                  onClick={handleQuickScan}
                  disabled={isScanning || !contractCode.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-5 text-xl"
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <Clock className="h-6 w-6 mr-3 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Target className="h-6 w-6 mr-3" />
                      Quick Security Scan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Scan Results */}
            {quickScanResult && (
              <Card className="bg-slate-800/50 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-3 text-2xl">
                    <Activity className="h-6 w-6" />
                    Scan Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between p-5 bg-slate-700/30 rounded-lg border border-gray-600/30">
                    <div>
                      <h3 className="text-white font-semibold text-xl">Security Score</h3>
                      <p className="text-lg text-gray-400">Lower score = more secure</p>
                    </div>
                    <div className={`text-5xl font-bold ${getScoreColor(quickScanResult.score)}`}>
                      {quickScanResult.score}/10
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-xl">Issues Found:</h4>
                    {quickScanResult.issues.map((issue, index) => (
                      <div key={index} className="p-4 bg-slate-700/20 rounded-lg border border-gray-600/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getSeverityColor(issue.severity)} size="lg">
                                {issue.severity}
                              </Badge>
                              <h5 className="text-white font-medium text-lg">{issue.title}</h5>
                            </div>
                            <p className="text-gray-400 text-lg">{issue.description}</p>
                          </div>
                          {issue.severity === 'Critical' && <AlertTriangle className="h-6 w-6 text-red-400" />}
                          {issue.severity === 'High' && <AlertTriangle className="h-6 w-6 text-orange-400" />}
                          {issue.severity === 'Medium' && <AlertTriangle className="h-6 w-6 text-yellow-400" />}
                          {issue.severity === 'Low' && <CheckCircle className="h-6 w-6 text-blue-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-7">
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardContent className="p-7 text-center">
              <Sparkles className="h-14 w-14 text-purple-400 mx-auto mb-5" />
              <h3 className="text-white font-semibold mb-3 text-xl">AI-Powered Analysis</h3>
              <p className="text-gray-400 text-lg">Advanced machine learning models identify vulnerabilities and security patterns</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-7 text-center">
              <Shield className="h-14 w-14 text-blue-400 mx-auto mb-5" />
              <h3 className="text-white font-semibold mb-3 text-xl">Multi-Language Support</h3>
              <p className="text-gray-400 text-lg">Supports Move, Solidity, and other smart contract languages</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/30">
            <CardContent className="p-7 text-center">
              <Target className="h-14 w-14 text-green-400 mx-auto mb-5" />
              <h3 className="text-white font-semibold mb-3 text-xl">Detailed Reports</h3>
              <p className="text-gray-400 text-lg">Comprehensive audit reports with actionable recommendations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}