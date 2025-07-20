import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiAssistant } from "@/lib/ai-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertTriangle,
  Shield,
  Brain,
  FileText,
  Send,
  Clock,
  User,
  MapPin,
  DollarSign,
  Hash
} from "lucide-react";
// import { useContract } from "@/lib/contract";

interface IncidentData {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedSystems: string;
  estimatedLoss: string;
  attackVector: string;
  evidenceUrls: string;
  contactInfo: string;
}

export default function IncidentReport({ onClose }: { onClose: () => void }) {
  const [reportMode, setReportMode] = useState<"manual" | "ai-assisted">("manual");
  const [userDescription, setUserDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [incidentData, setIncidentData] = useState<IncidentData>({
    title: "",
    description: "",
    severity: "medium",
    affectedSystems: "",
    estimatedLoss: "",
    attackVector: "",
    evidenceUrls: "",
    contactInfo: ""
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for creating incident reports in the database
  const createIncidentMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return await apiRequest("/api/incident-reports", {
        method: "POST",
        body: JSON.stringify(reportData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incident-reports"] });
    }
  });

  const handleAIGeneration = async () => {
    if (!userDescription.trim()) {
      toast({
        title: "Error",
        description: "Please describe your security situation first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generationPrompt = `
Based on the following user description of a security incident, please generate a structured incident report with the following fields:

User Description: "${userDescription}"

Please analyze this and provide a JSON response with these fields:
- title: A clear, concise title for the incident
- description: A detailed technical description of what happened
- severity: Choose from "low", "medium", "high", or "critical" based on the impact
- affectedSystems: What systems, contracts, or platforms were affected
- attackVector: The method or vulnerability used in the attack
- estimatedLoss: If any financial loss is mentioned, estimate it
- evidenceUrls: Any URLs, transaction hashes, or addresses mentioned

Respond ONLY with valid JSON, no other text.
      `;

      const response = await aiAssistant.getChatResponse(generationPrompt);
      
      try {
        // Try to parse the JSON response
        const parsedData = JSON.parse(response);
        
        setIncidentData({
          title: parsedData.title || "",
          description: parsedData.description || "",
          severity: parsedData.severity || "medium",
          affectedSystems: parsedData.affectedSystems || "",
          estimatedLoss: parsedData.estimatedLoss || "",
          attackVector: parsedData.attackVector || "",
          evidenceUrls: parsedData.evidenceUrls || "",
          contactInfo: incidentData.contactInfo // Keep existing contact info
        });
        
        toast({
          title: "Report Generated",
          description: "AI has generated your incident report. Please review and submit.",
        });
      } catch (parseError) {
        // If JSON parsing fails, use the response as description
        setIncidentData(prev => ({
          ...prev,
          title: "AI-Generated Incident Report",
          description: response
        }));
        
        toast({
          title: "Report Generated",
          description: "AI has analyzed your situation. Please review the details.",
        });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation Failed",
        description: `Failed to generate report: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!incidentData.description.trim()) {
      toast({
        title: "Error",
        description: "Please provide incident description for AI analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisPrompt = `
Security Incident Analysis Request:

Title: ${incidentData.title}
Description: ${incidentData.description}
Severity: ${incidentData.severity}
Affected Systems: ${incidentData.affectedSystems}
Attack Vector: ${incidentData.attackVector}
Estimated Loss: ${incidentData.estimatedLoss}

Please provide a comprehensive security incident analysis including:
1. Incident classification and severity assessment
2. Potential attack vectors and methods used
3. Immediate containment recommendations
4. Evidence collection guidance
5. Recovery and mitigation steps
6. Lessons learned and prevention measures

Provide detailed technical analysis suitable for security analysts and certifiers.
      `;

      const analysis = await aiAssistant.analyzeVulnerability(analysisPrompt);
      setAiAnalysis(analysis);
      
      toast({
        title: "AI Analysis Complete",
        description: "Security incident has been analyzed by AI",
      });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: `Failed to analyze incident: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!incidentData.title || !incidentData.description || !incidentData.contactInfo) {
      toast({
        title: "Error",
        description: "Please fill in title, description, and contact information",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create incident report data for the database
      const reportData = {
        title: incidentData.title,
        description: incidentData.description,
        affected_systems: incidentData.affectedSystems,
        attack_vectors: incidentData.attackVector,
        severity: incidentData.severity,
        client_name: "Security Client", // In a real app, this would come from user auth
        contact_info: incidentData.contactInfo,
        evidence_urls: incidentData.evidenceUrls,
        ai_analysis: aiAnalysis,
        status: "pending",
        client_wallet: "", // Would come from wallet connection
      };

      // Submit to database - this will now appear on analyst and certifier dashboards
      await createIncidentMutation.mutateAsync(reportData);

      toast({
        title: "Incident Reported Successfully",
        description: "Your security incident has been submitted and is now visible to analysts and certifiers for review",
      });

      onClose();
    } catch (error: any) {
      console.error("Incident submission error:", error);
      toast({
        title: "Submission Failed",
        description: `Failed to submit incident: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Security Incident Report
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          AI-powered incident reporting for the dSOC network
        </p>
      </div>

      {/* Report Mode Selection */}
      <Card className="bg-slate-800/50 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <User className="h-5 w-5" />
            Report Mode
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose how you want to create your incident report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant={reportMode === "manual" ? "default" : "outline"}
              onClick={() => setReportMode("manual")}
              className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                reportMode === "manual" 
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-500" 
                  : "border-gray-600 hover:border-blue-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Manual Input</span>
              </div>
              <p className="text-sm text-left opacity-80">
                Fill out the incident details manually using structured forms
              </p>
            </Button>
            
            <Button
              variant={reportMode === "ai-assisted" ? "default" : "outline"}
              onClick={() => setReportMode("ai-assisted")}
              className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                reportMode === "ai-assisted" 
                  ? "bg-purple-600 hover:bg-purple-700 border-purple-500" 
                  : "border-gray-600 hover:border-purple-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span className="font-medium">AI-Assisted</span>
              </div>
              <p className="text-sm text-left opacity-80">
                Describe your situation and let AI generate the structured report
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI-Assisted Mode */}
      {reportMode === "ai-assisted" && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Describe Your Situation
            </CardTitle>
            <CardDescription className="text-gray-400">
              Tell us what happened in your own words - AI will structure the report for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="Describe what happened... For example: 'My wallet was drained after clicking a suspicious link. I lost about $5000 worth of tokens. The transaction happened on Ethereum mainnet around 2 hours ago. I have the transaction hash and can provide screenshots...'"
              className="bg-slate-700/50 border-gray-600 text-white min-h-[150px]"
            />
            
            <Button
              onClick={handleAIGeneration}
              disabled={isGenerating || !userDescription.trim()}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Incident Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Incident Form - Show when manual mode OR when AI has generated data */}
      {(reportMode === "manual" || (reportMode === "ai-assisted" && incidentData.title)) && (
      <Card className="bg-slate-800/50 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Incident Details
          </CardTitle>
          <CardDescription className="text-gray-400">
            Provide detailed information about the security incident
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title & Severity */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Incident Title *</label>
              <Input
                value={incidentData.title}
                onChange={(e) => setIncidentData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the incident"
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Severity Level *</label>
              <select
                value={incidentData.severity}
                onChange={(e) => setIncidentData(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full p-2 bg-slate-700/50 border border-gray-600 rounded-md text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Incident Description *</label>
            <Textarea
              value={incidentData.description}
              onChange={(e) => setIncidentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of what happened, when it occurred, and how it was discovered..."
              className="bg-slate-700/50 border-gray-600 text-white min-h-[120px]"
            />
          </div>

          {/* Affected Systems & Attack Vector */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Affected Systems</label>
              <Input
                value={incidentData.affectedSystems}
                onChange={(e) => setIncidentData(prev => ({ ...prev, affectedSystems: e.target.value }))}
                placeholder="Smart contracts, wallets, exchanges..."
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Attack Vector</label>
              <Input
                value={incidentData.attackVector}
                onChange={(e) => setIncidentData(prev => ({ ...prev, attackVector: e.target.value }))}
                placeholder="Flash loan, bridge exploit, phishing..."
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Loss & Contact */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Estimated Loss</label>
              <Input
                value={incidentData.estimatedLoss}
                onChange={(e) => setIncidentData(prev => ({ ...prev, estimatedLoss: e.target.value }))}
                placeholder="$50,000 USD or 100 ETH"
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Contact Information</label>
              <Input
                value={incidentData.contactInfo}
                onChange={(e) => setIncidentData(prev => ({ ...prev, contactInfo: e.target.value }))}
                placeholder="Email or Telegram handle"
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Evidence URLs */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Evidence URLs</label>
            <Textarea
              value={incidentData.evidenceUrls}
              onChange={(e) => setIncidentData(prev => ({ ...prev, evidenceUrls: e.target.value }))}
              placeholder="Transaction hashes, block explorer links, screenshots (one per line)..."
              className="bg-slate-700/50 border-gray-600 text-white"
            />
          </div>

          {/* Current Severity Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Current Severity:</span>
            <Badge className={getSeverityColor(incidentData.severity)}>
              {incidentData.severity.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
      )}

      {/* AI Analysis Section */}
      {(reportMode === "manual" || (reportMode === "ai-assisted" && incidentData.title)) && (
        <>
        <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Security Analysis
          </CardTitle>
          <CardDescription className="text-gray-400">
            Get AI-powered analysis before submitting to analysts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || !incidentData.description.trim()}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Analyzing Incident...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>

          {aiAnalysis && (
            <div className="bg-slate-900/70 border border-gray-600/30 rounded-lg p-4 max-h-60 overflow-y-auto">
              <h4 className="text-purple-300 font-medium mb-2">AI Analysis Results:</h4>
              <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card className="bg-slate-800/50 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Submit to dSOC Network
          </CardTitle>
          <CardDescription className="text-gray-400">
            Submit incident to security analysts for investigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">What happens next:</h4>
            <div className="space-y-1 text-sm text-blue-200">
              <p>• <strong>Analyst Review:</strong> Security experts will analyze your incident</p>
              <p>• <strong>Investigation:</strong> Detailed forensic analysis and evidence collection</p>
              <p>• <strong>Certification:</strong> Final report certified by independent validators</p>
              <p>• <strong>Resolution:</strong> Recommendations and recovery assistance</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitTicket}
              disabled={isSubmitting || !incidentData.title || !incidentData.description}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Incident Report
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
    </div>
  );
}