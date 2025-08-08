
import React, { useState, useEffect } from 'react';
import { WalletGate } from '../components/wallet/WalletGate';
import { AppLayout } from '../components/layout/AppLayout';
import { useWallet } from '../components/WalletProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Shield, 
  CheckCircle, 
  XCircle,
  Eye, 
  FileText,
  Coins,
  Award,
  Activity,
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';

interface PendingValidation {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  network: 'ethereum' | 'polygon' | 'iota';
  analyst_address: string;
  analyst_name?: string;
  analysis_report: string;
  evidence_urls: string;
  submitted_at: string;
  estimated_reward: number;
  client_wallet: string;
  description: string;
  contract_address?: string;
  transaction_hash?: string;
}

export default function CertifierDashboard() {
  const { address, isConnected } = useWallet();
  const [pendingValidations, setPendingValidations] = useState<PendingValidation[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedValidation, setSelectedValidation] = useState<PendingValidation | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  
  const [stats, setStats] = useState({
    pendingReviews: 0,
    completedReviews: 0,
    averageResponseTime: 0,
    approvalRate: 0,
    cltDistributed: 0
  });

  useEffect(() => {
    if (isConnected && address) {
      loadPendingValidations();
      loadCertifierStats();
    }
  }, [isConnected, address]);

  const loadPendingValidations = async () => {
    try {
      // Mock data for demonstration - in real app, fetch from API
      const mockValidations: PendingValidation[] = [
        {
          id: 1,
          title: "Critical Oracle Manipulation Attack on DeFi Protocol",
          severity: 'critical',
          network: 'ethereum',
          analyst_address: '0x30b3ac6a000931c1826b4b5e2c6afc73be46f5c1',
          analyst_name: 'CyberSecPro',
          analysis_report: `**SECURITY ANALYSIS REPORT**

**Incident Summary:**
A sophisticated oracle manipulation attack was executed against the ABC DeFi lending protocol, resulting in approximately $1.25M in losses. The attack exploited a vulnerability in the price feed mechanism where external API data could be manipulated through coordinated market activities.

**Technical Analysis:**
1. **Attack Vector:** Flash loan + DEX manipulation + Oracle exploit
2. **Root Cause:** Insufficient price validation and lack of time-weighted averaging
3. **Exploitation Method:** 
   - Attacker obtained large flash loan
   - Manipulated spot prices on multiple DEXs
   - Triggered oracle update with manipulated prices
   - Liquidated positions at favorable rates
   - Repaid flash loan with profit

**Evidence Analysis:**
- Transaction hash: 0xabcdef... shows the attack sequence
- Contract logs indicate price manipulation at block 18500000
- Multiple liquidations triggered within same block
- Oracle price deviation exceeded 15% threshold

**Risk Assessment:**
- **Severity:** CRITICAL - Direct financial loss, protocol reputation damage
- **Impact:** $1.25M loss, 430 users affected, 42% TVL drop
- **Likelihood of Recurrence:** HIGH without proper fixes

**Recommendations:**
1. Implement time-weighted average pricing (TWAP)
2. Add price deviation circuit breakers
3. Use multiple oracle sources with consensus mechanism
4. Implement emergency pause functionality
5. Add slippage protection for large transactions

**Verification Status:** Analysis verified through on-chain data and contract examination.

**Analyst Confidence:** 95%`,
          evidence_urls: 'oracle_logs.txt, exploit_report.pdf',
          submitted_at: '2025-01-07T16:30:00Z',
          estimated_reward: 400,
          client_wallet: '0xAaBbCcDdEeFf0011223344556677889900aAbbCC',
          description: 'A sophisticated attack exploited the price oracle feeding the ABC protocol, causing significant financial losses through coordinated market manipulation.',
          contract_address: '0x1234567890abcdef1234567890abcdef12345678',
          transaction_hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef'
        },
        {
          id: 2,
          title: "Phishing Campaign Targeting DeFi Yield App Users",
          severity: 'high',
          network: 'polygon',
          analyst_address: '0x30b3ac6a000931c1826b4b5e2c6afc73be46f5c1',
          analyst_name: 'SecurityExpert',
          analysis_report: `**SECURITY INCIDENT ANALYSIS**

**Incident Overview:**
Large-scale phishing campaign targeting YieldGuard DeFi users through DNS hijacking and social engineering. The attack resulted in unauthorized wallet drains affecting 287 users with estimated losses of $800,000.

**Attack Timeline:**
1. **Initial Compromise:** DNS provider account compromised via credential stuffing
2. **Domain Hijack:** YieldGuard domain redirected to malicious server
3. **Fake Interface:** Identical UI deployed to capture wallet connections
4. **User Exploitation:** Users connected wallets thinking it was legitimate site
5. **Asset Drainage:** Malicious contracts drained connected wallets

**Technical Details:**
- **Attack Method:** DNS hijacking → fake dApp → wallet drain
- **Affected Systems:** Frontend application, DNS infrastructure  
- **User Impact:** 287 users, average loss $2,787 per user
- **Detection:** Users reported unauthorized transactions

**Evidence Review:**
- DNS logs show unauthorized configuration changes
- Phishing site screenshots match original UI exactly
- Blockchain analysis confirms wallet drain patterns
- Social media reports corroborate timeline

**Vulnerability Assessment:**
- **Primary Weakness:** Single point of failure in DNS security
- **Secondary Issues:** Lack of wallet warning systems
- **Risk Level:** HIGH - targeting user funds directly

**Mitigation Implemented:**
- DNS security restored via provider coordination
- User warnings issued across all channels
- Affected wallet addresses flagged for monitoring

**Prevention Recommendations:**
1. Implement DNS security locks and monitoring
2. Add browser security headers (CSP, HSTS)  
3. Deploy wallet warning systems for suspicious sites
4. Regular security awareness training for users
5. Consider decentralized hosting solutions

**Analysis Confidence:** 98% - Multiple confirmation sources`,
          evidence_urls: 'dns_logs.txt, phishing_ui.png',
          submitted_at: '2025-01-07T14:15:00Z',
          estimated_reward: 300,
          client_wallet: '0x123abc456def789abc000000000000000000abcd',
          description: 'Multiple users reported unauthorized withdrawals after being tricked into connecting wallets to a fake YieldGuard interface following DNS hijacking.',
          contract_address: '0xE87bFbFC9fC93b94756384e07cCa4B1e857bfC94'
        }
      ];
      
      setPendingValidations(mockValidations);
      setStats(prev => ({ ...prev, pendingReviews: mockValidations.length }));
    } catch (error) {
      console.error('Failed to load pending validations:', error);
    }
  };

  const loadCertifierStats = async () => {
    // Mock stats for demonstration
    setStats({
      pendingReviews: 2,
      completedReviews: 47,
      averageResponseTime: 3.2,
      approvalRate: 94,
      cltDistributed: 12450
    });
  };

  const handleApproveAnalysis = async (validation: PendingValidation, approved: boolean) => {
    setLoading(true);
    try {
      // In real app, this would call API to approve/reject the analysis
      const action = approved ? 'approved' : 'rejected';
      
      // Trigger CLT reward distribution for approved analyses
      if (approved) {
        const rewardResponse = await fetch('/api/rewards/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientAddress: validation.analyst_address,
            amount: validation.estimated_reward,
            rewardType: 'analyst',
            ticketId: validation.id
          })
        });

        if (rewardResponse.ok) {
          console.log('CLT rewards distributed to analyst');
        }
      }

      setNotification(
        approved 
          ? `✅ Analysis approved! ${validation.estimated_reward} CLT tokens distributed to analyst.`
          : `❌ Analysis rejected. Feedback sent to analyst for revision.`
      );
      
      // Remove from pending list
      setPendingValidations(prev => prev.filter(v => v.id !== validation.id));
      setSelectedValidation(null);
      setReviewComment('');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingReviews: prev.pendingReviews - 1,
        completedReviews: prev.completedReviews + 1,
        cltDistributed: approved ? prev.cltDistributed + validation.estimated_reward : prev.cltDistributed
      }));

      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setNotification('❌ Failed to process validation. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAnalysisQualityScore = (analysis: string): number => {
    // Simple scoring based on analysis length and key sections
    const sections = [
      'technical analysis',
      'recommendations',
      'risk assessment',
      'evidence',
      'impact'
    ];
    
    const hasSection = sections.map(section => 
      analysis.toLowerCase().includes(section)
    );
    
    const sectionScore = hasSection.filter(Boolean).length / sections.length;
    const lengthScore = Math.min(analysis.length / 1000, 1); // Normalize to 1000 chars
    
    return Math.round((sectionScore * 0.7 + lengthScore * 0.3) * 100);
  };

  return (
    <AppLayout>
      <WalletGate
        requiredRole="Certifier"
        roleCopy="Connect your wallet to access the dSOC Certifier Dashboard. Please connect your wallet with certifier role to review and approve reports."
      >
        <div className="text-white p-4">
          <div className="max-w-7xl mx-auto space-y-6"></div>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-500 flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Certifier Validation Portal
            </h1>
            <p className="text-gray-400 mt-2">Review analyst reports, validate findings, and distribute rewards</p>
          </div>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Certifier</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification */}
        {notification && (
          <Alert className={`${notification.includes('✅') ? 'border-green-500' : 'border-red-500'} bg-gray-800/50`}>
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.pendingReviews}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completedReviews}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.averageResponseTime}h</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats.approvalRate}%</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                <Coins className="h-4 w-4" />
                CLT Distributed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.cltDistributed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Pending Reviews ({stats.pendingReviews})
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Pending Reviews */}
          <TabsContent value="pending">
            <div className="space-y-6">
              {pendingValidations.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Pending Reviews</h3>
                    <p className="text-gray-500">All analyst reports have been reviewed and validated.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingValidations.map((validation) => (
                  <Card key={validation.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-lg">{validation.title}</h3>
                            <Badge className={`${getSeverityColor(validation.severity)} text-white`}>
                              {validation.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {validation.network.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-400">Analyst</p>
                              <p className="text-white font-mono">{validation.analyst_address.slice(0, 8)}...</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Submitted</p>
                              <p className="text-white">{new Date(validation.submitted_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Reward</p>
                              <p className="text-yellow-500 font-semibold">{validation.estimated_reward} CLT</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Quality Score</p>
                              <p className="text-blue-500 font-semibold">
                                {getAnalysisQualityScore(validation.analysis_report)}%
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-white mb-2">Analysis Preview</h4>
                            <p className="text-gray-300 text-sm line-clamp-3">
                              {validation.analysis_report.substring(0, 300)}...
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="border-gray-600"
                              onClick={() => setSelectedValidation(validation)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Full Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-7xl max-h-[90vh] bg-gray-800 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-purple-500">
                                Certifier Review: {validation.title}
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[80vh]">
                              {/* Case Information */}
                              <div className="space-y-4">
                                <Card className="bg-gray-700/30 border-gray-600">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-white">Case Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Severity:</span>
                                      <Badge className={`${getSeverityColor(validation.severity)} text-white text-xs`}>
                                        {validation.severity.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Network:</span>
                                      <span className="text-white capitalize">{validation.network}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Client:</span>
                                      <span className="text-white font-mono text-xs">
                                        {validation.client_wallet.slice(0, 8)}...
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Analyst:</span>
                                      <span className="text-white font-mono text-xs">
                                        {validation.analyst_address.slice(0, 8)}...
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Reward:</span>
                                      <span className="text-yellow-500 font-semibold">
                                        {validation.estimated_reward} CLT
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gray-700/30 border-gray-600">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-white">Quality Assessment</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Completeness</span>
                                        <span className="text-white">95%</span>
                                      </div>
                                      <Progress value={95} className="h-1" />
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Technical Accuracy</span>
                                        <span className="text-white">92%</span>
                                      </div>
                                      <Progress value={92} className="h-1" />
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Evidence Quality</span>
                                        <span className="text-white">88%</span>
                                      </div>
                                      <Progress value={88} className="h-1" />
                                    </div>
                                    <div className="pt-2 border-t border-gray-600">
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-blue-500">
                                          {getAnalysisQualityScore(validation.analysis_report)}%
                                        </div>
                                        <div className="text-xs text-gray-400">Overall Score</div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {validation.evidence_urls && (
                                  <Card className="bg-gray-700/30 border-gray-600">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm text-white">Evidence Files</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2 text-sm">
                                        {validation.evidence_urls.split(', ').map((file, index) => (
                                          <div key={index} className="flex items-center gap-2 text-gray-300">
                                            <FileText className="h-4 w-4" />
                                            <span>{file}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>

                              {/* Analysis Report */}
                              <div className="lg:col-span-2 space-y-4">
                                <Card className="bg-gray-700/30 border-gray-600">
                                  <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                      <FileText className="h-5 w-5" />
                                      Security Analysis Report
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="bg-gray-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                      <div className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                                        {validation.analysis_report}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gray-700/30 border-gray-600">
                                  <CardHeader>
                                    <CardTitle className="text-white">Certifier Review</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <label className="text-sm text-gray-400 mb-2 block">
                                        Review Comments (Optional)
                                      </label>
                                      <Textarea
                                        placeholder="Add your review comments or feedback for the analyst..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        rows={4}
                                        className="bg-gray-700 border-gray-600 text-white"
                                      />
                                    </div>

                                    <div className="flex gap-3">
                                      <Button
                                        onClick={() => handleApproveAnalysis(validation, true)}
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        {loading ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                          <ThumbsUp className="h-4 w-4 mr-2" />
                                        )}
                                        Approve & Distribute CLT
                                      </Button>
                                      
                                      <Button
                                        onClick={() => handleApproveAnalysis(validation, false)}
                                        disabled={loading}
                                        variant="destructive"
                                        className="flex-1"
                                      >
                                        {loading ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                          <ThumbsDown className="h-4 w-4 mr-2" />
                                        )}
                                        Reject & Request Revision
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() => handleApproveAnalysis(validation, true)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Quick Approve
                        </Button>

                        <Button
                          onClick={() => handleApproveAnalysis(validation, false)}
                          disabled={loading}
                          variant="destructive"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Performance Metrics */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-500 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Validation Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Reviews This Month</span>
                      <span className="font-semibold">23</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Response Time</span>
                      <span className="font-semibold">{stats.averageResponseTime} hours</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Approval Rate</span>
                      <span className="font-semibold">{stats.approvalRate}%</span>
                    </div>
                    <Progress value={stats.approvalRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quality Consistency</span>
                      <span className="font-semibold">97%</span>
                    </div>
                    <Progress value={97} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-500 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Reward Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{stats.cltDistributed}</div>
                      <div className="text-sm text-gray-400">Total CLT Distributed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">265</div>
                      <div className="text-sm text-gray-400">Avg CLT per Review</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="text-yellow-500">6,100 CLT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Month</span>
                      <span className="text-yellow-500">5,850 CLT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Month</span>
                      <span className="text-yellow-500">7,200 CLT</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-600">
                    <div className="text-sm text-gray-400 mb-2">Category Breakdown</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Critical Incidents</span>
                        <span className="text-red-400">4,200 CLT (34%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>High Severity</span>
                        <span className="text-orange-400">3,100 CLT (25%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Severity</span>
                        <span className="text-yellow-400">2,850 CLT (23%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Severity</span>
                        <span className="text-green-400">2,300 CLT (18%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-500">Review Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-white mb-2">{stats.completedReviews}</div>
                      <div className="text-gray-400">Total Reviews Completed</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Smart Contract Vulnerabilities</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>DeFi Protocol Issues</span>
                          <span>28%</span>
                        </div>
                        <Progress value={28} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Phishing/Social Engineering</span>
                          <span>15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Infrastructure Security</span>
                          <span>12%</span>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-500">Network Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-lg font-semibold text-white">Multi-Chain Coverage</div>
                      <div className="text-sm text-gray-400">Reviews across all supported networks</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Ethereum Mainnet</span>
                          <span>28 reviews (60%)</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Polygon</span>
                          <span>12 reviews (25%)</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>IOTA</span>
                          <span>7 reviews (15%)</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                      <div className="text-sm text-gray-400 mb-2">Quality Metrics</div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-500">4.9</div>
                          <div className="text-xs text-gray-400">Avg Quality</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-500">2.8h</div>
                          <div className="text-xs text-gray-400">Avg Time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </WalletGate>
    </AppLayout>
  );
}
