import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useCurrentAccount } from "@iota/dapp-kit";
import { mockTickets, mockAnalytics, mockUsers, mockRecentActivity } from "../../../shared/mockData";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Award,
  DollarSign,
  Activity,
  BarChart3,
  FileText,
  Users,
  Target,
  Zap,
  Eye,
  Brain
} from "lucide-react";

interface DashboardProps {
  userRole: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const account = useCurrentAccount();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (account && userRole) {
      generateRoleSpecificData();
    }
  }, [account, userRole]);

  const generateRoleSpecificData = () => {
    const userTickets = mockTickets.filter(ticket => 
      userRole === "client" ? ticket.client_address === account?.address :
      userRole === "analyst" ? (ticket.status === 0 || ticket.analyst_address === account?.address) :
      userRole === "certifier" ? ticket.status >= 2 : true
    );

    const userData = mockUsers.find(user => user.wallet_address === account?.address) || mockUsers[0];

    switch (userRole) {
      case "client":
        setDashboardData({
          stats: {
            totalSubmitted: userData.total_submitted || 23,
            resolvedTickets: userData.resolved_tickets || 18,
            pendingTickets: 5,
            totalRewards: userData.total_rewards_earned || 186000,
            avgResolutionTime: userData.avg_resolution_time || "14h",
            successRate: Math.round((userData.resolved_tickets / userData.total_submitted) * 100) || 78
          },
          recentSubmissions: userTickets.slice(0, 5),
          categories: userData.preferred_categories || ["Cross-Chain Bridge", "Flash Loan Attack"],
          monthlyActivity: [
            { month: "Oct", submitted: 3, resolved: 2 },
            { month: "Nov", submitted: 4, resolved: 4 },
            { month: "Dec", submitted: 6, resolved: 5 },
            { month: "Jan", submitted: 8, resolved: 6 }
          ]
        });
        break;

      case "analyst":
        setDashboardData({
          stats: {
            totalAnalyzed: userData.total_analyzed || 45,
            approvedReports: userData.approved_reports || 41,
            pendingAnalysis: 7,
            totalRewards: userData.total_rewards_earned || 485000,
            avgAnalysisTime: userData.avg_analysis_time || "12h",
            successRate: userData.success_rate || 91
          },
          availableTickets: userTickets.filter(t => t.status === 0).slice(0, 8),
          specializations: userData.specializations || ["DeFi Protocol Security"],
          performanceMetrics: [
            { metric: "Flash Loan Attacks", analyzed: 15, accuracy: 94 },
            { metric: "Bridge Exploits", analyzed: 12, accuracy: 89 },
            { metric: "Oracle Manipulation", analyzed: 8, accuracy: 96 },
            { metric: "Smart Contract Bugs", analyzed: 6, accuracy: 92 }
          ]
        });
        break;

      case "certifier":
        setDashboardData({
          stats: {
            totalCertified: userData.total_certified || 67,
            approvedCertifications: userData.approved_certifications || 64,
            pendingCertification: 12,
            totalRewards: userData.total_rewards_earned || 890000,
            avgCertificationTime: userData.avg_certification_time || "3h",
            accuracy: userData.certification_accuracy || 97
          },
          pendingCertifications: userTickets.filter(t => t.status === 2).slice(0, 6),
          expertiseAreas: userData.expertise_areas || ["Critical Incident Assessment"],
          riskAssessments: [
            { protocol: "Cross-Chain Bridges", riskLevel: "Critical", lastAssessed: "2024-01-20" },
            { protocol: "Lending Protocols", riskLevel: "High", lastAssessed: "2024-01-19" },
            { protocol: "DEX/AMM", riskLevel: "Medium", lastAssessed: "2024-01-18" }
          ]
        });
        break;

      default:
        setDashboardData({
          stats: mockAnalytics,
          globalActivity: mockRecentActivity
        });
    }
  };

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderClientDashboard = () => (
    <div className="space-y-6">
      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30 cursor-pointer hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-300">Total Submitted</CardTitle>
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.totalSubmitted}</div>
            <p className="text-xs text-blue-300 mt-1">+3 this month</p>
            <Button size="sm" variant="ghost" className="mt-2 text-blue-400 hover:text-blue-300">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-300">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.resolvedTickets}</div>
            <p className="text-xs text-green-300 mt-1">{dashboardData.stats.successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-300">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.pendingTickets}</div>
            <p className="text-xs text-yellow-300 mt-1">Avg: {dashboardData.stats.avgResolutionTime}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-300">Total Rewards</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.totalRewards.toLocaleString()} CLT</div>
            <p className="text-xs text-purple-300 mt-1">+15,600 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions with Full Details */}
      <Card className="bg-slate-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Incident Reports - Full Case Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentSubmissions.map((ticket: any) => (
              <Card key={ticket.id} className="bg-slate-700/30 border border-gray-600/20 hover:border-purple-500/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white">{ticket.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{ticket.blockchain}</span>
                        <span>•</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={`${
                      ticket.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      ticket.severity === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    }`}>
                      {ticket.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300 line-clamp-2">{ticket.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loss Amount:</span>
                        <span className="text-red-400 font-semibold ml-2">{ticket.loss_amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Protocols:</span>
                        <span className="text-blue-400 ml-2">{ticket.affected_protocols?.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Attack Vector:</span>
                        <span className="text-orange-400 ml-2">{ticket.attack_vector}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <Badge className="ml-2 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {ticket.status === 3 ? 'Resolved' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Eye className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <FileText className="h-4 w-4 mr-1" />
                        Evidence
                      </Button>
                      {ticket.report_hash && (
                        <Button size="sm" variant="outline" className="border-green-600 text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Analysis
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferred Categories */}
      <Card className="bg-slate-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Expertise Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dashboardData.categories.map((category: string) => (
              <Badge key={category} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Security Assistant */}
      <Card className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Security Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Google AI Integration</p>
                <p className="text-sm text-gray-400">
                  Active - AI analysis available
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Connected
              </Badge>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Quick AI Insights</h4>
              <div className="space-y-2 text-sm">
                <p className="text-blue-200">• Ask about threat analysis patterns</p>
                <p className="text-blue-200">• Get incident classification guidance</p>
                <p className="text-blue-200">• Security best practices recommendations</p>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.dispatchEvent(new CustomEvent('openAIAssistant'))}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  AI Chat
                </Button>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => window.dispatchEvent(new CustomEvent('openAuditTool'))}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Contract Audit
                </Button>
                <Button 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => window.dispatchEvent(new CustomEvent('openIncidentReport'))}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Report Incident
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalystDashboard = () => (
    <div className="space-y-6">
      {/* Analyst Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-300">Total Analyzed</CardTitle>
              <Brain className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.totalAnalyzed}</div>
            <p className="text-xs text-cyan-300 mt-1">+7 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-300">Approved Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.approvedReports}</div>
            <p className="text-xs text-green-300 mt-1">{dashboardData.stats.successRate}% approval rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-300">Pending Analysis</CardTitle>
              <Eye className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.pendingAnalysis}</div>
            <p className="text-xs text-orange-300 mt-1">Avg: {dashboardData.stats.avgAnalysisTime}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-300">Total Rewards</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.totalRewards.toLocaleString()} CLT</div>
            <p className="text-xs text-purple-300 mt-1">+28,500 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Pending Work Alert */}
      {dashboardData.stats.pendingAnalysis > 0 && (
        <Card className="bg-gradient-to-r from-red-800/30 to-orange-800/30 border-red-500/50 animate-pulse">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgent: Pending Analysis Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">{dashboardData.stats.pendingAnalysis} Critical Tickets</p>
                <p className="text-red-300 text-sm">
                  Waiting for security analysis - Average response time: {dashboardData.stats.avgAnalysisTime}
                </p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 pulse-glow">
                <Zap className="h-4 w-4 mr-1" />
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tickets */}
      <Card className="bg-slate-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            High Priority Tickets ({dashboardData.availableTickets.length} Available)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.availableTickets.map((ticket: any) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-gray-600/20 hover:border-cyan-500/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{ticket.title}</p>
                    {ticket.severity === 'Critical' && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse text-xs">
                        URGENT
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{ticket.category} • {ticket.blockchain}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>Submitted: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60))}h ago
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${
                    ticket.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    ticket.severity === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {ticket.severity}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">{ticket.stake_amount.toLocaleString()} CLT</p>
                  <Button size="sm" className="mt-1 bg-cyan-600 hover:bg-cyan-700">
                    <Eye className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analysis Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.performanceMetrics.map((metric: any) => (
              <div key={metric.metric} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{metric.metric}</p>
                  <p className="text-sm text-gray-400">{metric.analyzed} analyzed</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-green-400">{metric.accuracy}%</div>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-green-400 rounded-full" 
                        style={{ width: `${metric.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCertifierDashboard = () => (
    <div className="space-y-6">
      {/* Certifier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-300">Total Certified</CardTitle>
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.totalCertified}</div>
            <p className="text-xs text-emerald-300 mt-1">+12 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-300">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.approvedCertifications}</div>
            <p className="text-xs text-green-300 mt-1">{dashboardData.stats.accuracy}% accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-300">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.pendingCertification}</div>
            <p className="text-xs text-amber-300 mt-1">Avg: {dashboardData.stats.avgCertificationTime}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-300">Total Rewards</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.stats.totalRewards.toLocaleString()} CLT</div>
            <p className="text-xs text-purple-300 mt-1">+45,200 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Certification Alert */}
      {dashboardData.stats.pendingCertification > 0 && (
        <Card className="bg-gradient-to-r from-red-800/30 to-orange-800/30 border-red-500/50 animate-pulse">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              URGENT: Certifications Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">{dashboardData.stats.pendingCertification} Reports Pending</p>
                <p className="text-red-300 text-sm">
                  Critical incidents awaiting final certification - Target time: {dashboardData.stats.avgCertificationTime}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                    {Math.floor(dashboardData.stats.pendingCertification * 0.6)} Critical
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                    {Math.floor(dashboardData.stats.pendingCertification * 0.4)} High Priority
                  </Badge>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 pulse-glow">
                <Shield className="h-4 w-4 mr-1" />
                Certify Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Certifications */}
      <Card className="bg-slate-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-emerald-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Certifications Needed ({dashboardData.pendingCertifications.length} Active)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.pendingCertifications.map((ticket: any) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-gray-600/20 hover:border-emerald-500/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{ticket.title}</p>
                    {ticket.severity === 'Critical' && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse text-xs">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{ticket.category} • {ticket.blockchain}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>Submitted: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <Clock className="h-3 w-3" />
                      Pending {Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60))}h
                    </span>
                  </div>
                  {ticket.analyst_address && (
                    <p className="text-xs text-blue-400 mt-1">
                      Analyzed by: {ticket.analyst_address.slice(0, 8)}...{ticket.analyst_address.slice(-6)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={`${
                    ticket.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    ticket.severity === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {ticket.severity}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">{ticket.loss_amount}</p>
                  <Button size="sm" className="mt-1 bg-emerald-600 hover:bg-emerald-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Certify
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessments */}
      <Card className="bg-slate-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-emerald-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Protocol Risk Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.riskAssessments.map((assessment: any) => (
              <div key={assessment.protocol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">{assessment.protocol}</p>
                  <p className="text-sm text-gray-400">Last assessed: {assessment.lastAssessed}</p>
                </div>
                <Badge className={`${
                  assessment.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  assessment.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  {assessment.riskLevel} Risk
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {userRole === "client" ? "Client Dashboard" :
             userRole === "analyst" ? "Security Analyst Dashboard" :
             userRole === "certifier" ? "Incident Certifier Dashboard" : "Dashboard"}
          </h1>
          <p className="text-gray-400 text-lg">
            {userRole === "client" ? "Track your security incident reports and rewards" :
             userRole === "analyst" ? "Analyze incidents and provide security insights" :
             userRole === "certifier" ? "Validate and certify security incident reports" : "Welcome back"}
          </p>
        </div>

        {/* Role-specific dashboard content */}
        {userRole === "client" && renderClientDashboard()}
        {userRole === "analyst" && renderAnalystDashboard()}
        {userRole === "certifier" && renderCertifierDashboard()}
      </div>
    </div>
  );
}