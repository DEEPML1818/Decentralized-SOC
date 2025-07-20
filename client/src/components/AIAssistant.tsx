import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiAssistant } from "@/lib/ai-service";
import {
  Brain,
  Search,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  FileText,
  MessageCircle,
  Sparkles,
  Bot,
  User,
  ChevronRight,
  Activity,
  Target,
  Eye,
  Code
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [securityNews, setSecurityNews] = useState("");
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{id: number, question: string, response: string, timestamp: Date}>>([]);
  const [auditCode, setAuditCode] = useState("");
  const [auditReport, setAuditReport] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);

  const { toast } = useToast();

  // Threat Intelligence Data
  const threatIntelligence = [
    {
      id: "flash-loan",
      title: "Flash Loan Attacks Surge",
      severity: "Critical",
      description: "200% increase in flash loan exploits targeting AMM protocols",
      impact: "$127M lost in Q4 2023",
      mitigation: "Implement proper slippage protection and oracle validation",
      examples: ["Radiant Capital - $58M", "KyberSwap - $46M"],
      color: "border-red-500/30 bg-red-500/10"
    },
    {
      id: "bridge-exploits", 
      title: "Cross-Chain Bridge Vulnerabilities",
      severity: "Critical",
      description: "Signature verification bypasses in multi-chain bridges",
      impact: "$600M+ lost in 2023",
      mitigation: "Multi-signature validation and timelocks required",
      examples: ["Multichain - $126M", "Orbit Chain - $82M"],
      color: "border-orange-500/30 bg-orange-500/10"
    },
    {
      id: "oracle-manipulation",
      title: "Oracle Price Manipulation",
      severity: "High", 
      description: "DEX-based oracles vulnerable to flash loan price manipulation",
      impact: "$45M lost in H2 2023",
      mitigation: "Use time-weighted average prices (TWAP) and multiple oracle sources",
      examples: ["BonqDAO - $120M", "Various DeFi protocols"],
      color: "border-yellow-500/30 bg-yellow-500/10"
    },
    {
      id: "private-keys",
      title: "Private Key Compromises",
      severity: "Critical",
      description: "Social engineering attacks targeting key personnel",
      impact: "$200M+ lost in custody breaches",
      mitigation: "Hardware security modules and multi-party computation",
      examples: ["Mixin Network - $200M", "HTX Exchange - $30M"],
      color: "border-red-500/30 bg-red-500/10"
    }
  ];

  const analysisTemplates = [
    {
      title: "Smart Contract Audit",
      description: "Comprehensive security analysis of smart contract code",
      prompt: "Analyze this smart contract for security vulnerabilities including reentrancy, overflow, access control issues:"
    },
    {
      title: "Incident Response",
      description: "Step-by-step incident response and containment strategy",
      prompt: "Provide incident response steps for this security breach:"
    },
    {
      title: "Threat Assessment",
      description: "Risk evaluation and threat modeling analysis",
      prompt: "Assess the threat level and potential impact of this security issue:"
    },
    {
      title: "Vulnerability Research",
      description: "Deep dive into specific vulnerability classes",
      prompt: "Explain this vulnerability type, attack vectors, and prevention methods:"
    }
  ];

  useEffect(() => {
    loadSecurityNews();
  }, []);

  const loadSecurityNews = async () => {
    try {
      const news = await aiAssistant.getSecurityNews();
      setSecurityNews(news);
    } catch (error) {
      console.error('Error loading security news:', error);
      toast({
        title: "Error",
        description: "Failed to load security news. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const aiResponse = await aiAssistant.askQuestion(question);
      if (!aiResponse) {
        throw new Error("No response from AI assistant.");
      }
      setResponse(aiResponse);

      // Add to conversation history
      const newEntry = {
        id: Date.now(),
        question: question.trim(),
        response: aiResponse,
        timestamp: new Date()
      };
      setConversationHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 conversations

      toast({
        title: "Analysis Complete",
        description: "AI security analysis generated successfully",
      });
    } catch (error: any) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error.message || "Unknown error"}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (template: any) => {
    setQuestion(template.prompt + " ");
  };

  const analyzeVulnerability = async (description: string) => {
    setIsLoading(true);
    try {
      const analysis = await aiAssistant.analyzeVulnerability(description);
      setResponse(analysis);
      setQuestion(description);
    } catch (error: any) {
      console.error("Failed to analyze vulnerability:", error);
      toast({
        title: "Error",
        description: `Failed to analyze vulnerability: ${error.message || "Unknown error"}.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditContract = async () => {
    if (!auditCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter smart contract code to audit",
        variant: "destructive",
      });
      return;
    }

    setIsAuditing(true);
    try {
      const report = await aiAssistant.runAudit(auditCode);
      setAuditReport(report);
      toast({
        title: "Audit Complete",
        description: "Smart contract audit has been completed successfully",
      });
    } catch (error: any) {
      console.error("Audit error:", error);
      toast({
        title: "Audit Failed",
        description: `Failed to complete the audit: ${error.message || "Unknown error"}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Security Assistant
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Advanced AI-powered cybersecurity analysis and threat intelligence powered by Google Gemini
          </p>
        </div>

        <Tabs defaultValue="assistant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-purple-500/30">
            <TabsTrigger value="assistant" className="data-[state=active]:bg-purple-600">
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="threats" className="data-[state=active]:bg-purple-600">
              <Shield className="h-4 w-4 mr-2" />
              Threat Intel
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-purple-600">
              <Activity className="h-4 w-4 mr-2" />
              Security News
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600">
              <Code className="h-4 w-4 mr-2" />
              Contract Audit
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <FileText className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="space-y-6">
            {/* Live Chat Interface */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with AI Security Expert
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Ask me anything about cybersecurity, vulnerabilities, or security analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat History Display */}
                <div className="max-h-[600px] overflow-y-auto space-y-4 border border-gray-600/30 rounded-lg p-4 bg-slate-700/20">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">Hi! I'm your AI Security Expert 👋</p>
                      <p className="text-sm text-gray-500">Ask me anything about cybersecurity, and I'll provide detailed analysis!</p>
                    </div>
                  ) : (
                    [...conversationHistory].reverse().map((entry) => (
                      <div key={entry.id} className="space-y-3">
                        {/* User Message */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-600 rounded-full">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                            <p className="text-white">{entry.question}</p>
                            <p className="text-xs text-blue-300 mt-1">{entry.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-600 rounded-full">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 bg-purple-600/20 rounded-lg p-3 border border-purple-500/30">
                            <div className="prose prose-invert prose-sm max-w-none max-h-80 overflow-y-auto">
                              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                                {entry.response}
                              </div>
                            </div>
                            <p className="text-xs text-purple-300 mt-2">{entry.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Current Response (if loading) */}
                  {isLoading && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-600 rounded-full">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                          <p className="text-white">{question}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-600 rounded-full">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 bg-purple-600/20 rounded-lg p-3 border border-purple-500/30">
                          <div className="flex items-center gap-2 text-purple-300">
                            <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                            Thinking...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <div className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me anything about cybersecurity..."
                    className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shrink-0"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Ask
                      </div>
                    )}
                  </Button>

                </div>

                {/* Quick Questions */}
                <div className="flex flex-wrap gap-2">
                  <p className="text-sm text-gray-400 w-full mb-2">Quick questions:</p>
                  {[
                    "What is a SQL injection attack?",
                    "How do I secure my smart contract?",
                    "What are common web vulnerabilities?",
                    "Explain blockchain security best practices",
                    "What is a zero-day exploit?",
                    "How to prevent DDoS attacks?"
                  ].map((quickQuestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestion(quickQuestion)}
                      className="text-xs border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white"
                    >
                      {quickQuestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Templates */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Security Analysis Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisTemplates.map((template, index) => (
                    <Card 
                      key={index} 
                      className="bg-slate-700/30 border-gray-600/30 cursor-pointer hover:border-purple-500/50 transition-colors"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-white mb-2">{template.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Use Template
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <div className="grid gap-6">
              {threatIntelligence.map((threat) => (
                <Card 
                  key={threat.id} 
                  className={`${threat.color} border cursor-pointer transition-all hover:scale-[1.02]`}
                  onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          {threat.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 mt-1">
                          {threat.description}
                        </CardDescription>
                      </div>
                      <Badge className={`${
                        threat.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {threat.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  {selectedThreat === threat.id && (
                    <CardContent className="border-t border-gray-600/30 pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Financial Impact</h4>
                          <p className="text-red-400 font-semibold">{threat.impact}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Recent Examples</h4>
                          <ul className="space-y-1">
                            {threat.examples.map((example, index) => (
                              <li key={index} className="text-gray-300 text-sm">• {example}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Mitigation Strategy</h4>
                          <p className="text-green-400 text-sm">{threat.mitigation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => analyzeVulnerability(`Analyze ${threat.title}: ${threat.description}. Provide detailed technical analysis including attack vectors, code examples, and comprehensive mitigation strategies.`)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            AI Analysis
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            <Eye className="h-4 w-4 mr-1" />
                            View Cases
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Real-Time Security Intelligence
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Latest cybersecurity threats and industry developments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityNews ? (
                  <div className="prose prose-invert max-w-none max-h-96 overflow-y-auto border border-gray-600/30 rounded-lg p-4 bg-slate-700/20">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                      {securityNews}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading latest security intelligence...</p>
                  </div>
                )}
                <div className="mt-6">
                  <Button 
                    onClick={loadSecurityNews} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh Intelligence
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {conversationHistory.map((entry) => (
                      <Card key={entry.id} className="bg-slate-700/30 border-gray-600/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <User className="h-5 w-5 text-blue-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-white font-medium">{entry.question}</p>
                                <p className="text-xs text-gray-500">{entry.timestamp.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Bot className="h-5 w-5 text-purple-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm line-clamp-3">{entry.response}</p>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="mt-2 text-purple-400 hover:text-purple-300"
                                  onClick={() => setResponse(entry.response)}
                                >
                                  View Full Analysis
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No analysis history yet</p>
                    <p className="text-sm text-gray-500">Start asking questions to build your analysis history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-slate-800/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Smart Contract Security Audit
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered security analysis for Move smart contracts using Google Gemini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Example Templates */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">Quick Start Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
                      onClick={() => setAuditCode(`module dsoc::SOCService {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext, sender};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    struct SOCService has key, store {
        id: UID,
        name: vector<u8>,
        reputation: u64,
        stake_amount: u64,
    }

    public fun create_service(name: vector<u8>, ctx: &mut TxContext): SOCService {
        SOCService {
            id: object::new(ctx),
            name,
            reputation: 0,
            stake_amount: 0,
        }
    }

    public entry fun stake_tokens(service: &mut SOCService, payment: Coin<SUI>, ctx: &mut TxContext) {
        let amount = coin::value(&payment);
        service.stake_amount = service.stake_amount + amount;
        transfer::public_transfer(payment, sender(ctx));
    }
}`)}
                    >
                      dSOC Service
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
                      onClick={() => setAuditCode(`module token::SimpleToken {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct SimpleToken has drop {}

    fun init(witness: SimpleToken, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6,
            b"SIMPLE",
            b"Simple Token",
            b"A simple token example",
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }

    public entry fun mint(
        treasury: &mut TreasuryCap<SimpleToken>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury, amount, recipient, ctx);
    }
}`)}
                    >
                      Simple Token
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
                      onClick={() => setAuditCode("")}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Code Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Smart Contract Code (Move Language)</label>
                  <Textarea
                    value={auditCode}
                    onChange={(e) => setAuditCode(e.target.value)}
                    placeholder={`Enter your Move smart contract code here...

Example:
module dsoc::YourContract {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    struct YourStruct has key {
        id: UID,
        // your fields here
    }

    // your functions here
}`}
                    className="bg-slate-900/70 border-gray-600 text-green-400 focus:border-red-400 min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{auditCode.length} characters</span>
                    <span>Supported: Move language for Sui blockchain</span>
                  </div>
                </div>

                {/* Audit Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleAuditContract}
                    disabled={isAuditing || !auditCode.trim()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex-1"
                  >
                    {isAuditing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Analyzing Contract...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Run Security Audit
                      </>
                    )}
                  </Button>
                  {auditReport && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(auditReport);
                        toast({ title: "Copied!", description: "Audit report copied to clipboard" });
                      }}
                      className="border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Copy Report
                    </Button>
                  )}
                </div>

                {/* Audit Report Display */}
                {auditReport && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                      <h4 className="text-white font-semibold">Security Audit Report</h4>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                        AI-Powered Analysis
                      </Badge>
                    </div>
                    <div className="bg-slate-900/70 border border-gray-600/30 rounded-lg overflow-hidden">
                      <div className="bg-slate-800/50 px-4 py-2 border-b border-gray-600/30">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-400">audit_report.md</span>
                        </div>
                      </div>
                      <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
                            {auditReport}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Section */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    About Smart Contract Auditing
                  </h4>
                  <div className="space-y-1 text-sm text-blue-200">
                    <p>• <strong>Move Language:</strong> Specialized for Sui blockchain with resource-based programming</p>
                    <p>• <strong>Security Focus:</strong> Resource handling, capability patterns, and type safety</p>
                    <p>• <strong>AI Analysis:</strong> Powered by Google Gemini for comprehensive vulnerability detection</p>
                    <p>• <strong>Report Includes:</strong> Vulnerability scoring, detailed findings, and remediation steps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}