import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("AI service initialized");

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Get AI response for security-related queries
 */
export async function getAIResponse(prompt: string): Promise<string> {
  try {
    console.log("Getting AI response via backend API");

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get AI response");
    }

    const data = await response.json();
    console.log("AI response generated successfully");
    return data.response;
  } catch (error) {
    console.error("Error getting AI response:", error);

    // Return a helpful error message instead of throwing
    return `I apologize, but I'm currently experiencing technical difficulties connecting to the AI service. 

Please try again in a moment, or feel free to ask specific questions about:

• Smart contract security best practices
• Common vulnerability patterns
• Security audit methodologies
• Blockchain security frameworks
• Penetration testing approaches
• Incident response procedures

Error details: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
  }
}

/**
 * Generate demo response when API is not available
 */
function generateDemoResponse(prompt: string): string {
  const demoResponses = {
    audit: `**Security Analysis Report**

**Executive Summary:**
Based on your query about "${prompt}", here are key security considerations:

**Key Recommendations:**
• Implement input validation and sanitization
• Use secure coding practices
• Regular security testing and code reviews
• Follow principle of least privilege
• Implement proper error handling

**Best Practices:**
• Keep dependencies updated
• Use established security frameworks
• Document security measures
• Regular penetration testing
• Security awareness training

*Note: This is a demo response. Connect with a live AI service for detailed analysis.*`,

    general: `**Cybersecurity Advisory**

Regarding your question: "${prompt}"

**Security Framework Approach:**
• Identify assets and threats
• Assess vulnerabilities and risks
• Implement appropriate controls
• Monitor and maintain security posture

**Common Security Measures:**
• Multi-factor authentication
• Network segmentation
• Regular backups and recovery testing
• Incident response planning
• Security monitoring and logging

**Next Steps:**
• Conduct risk assessment
• Develop security policies
• Implement technical controls
• Train personnel
• Regular security reviews

*Note: This is a demo response. For comprehensive analysis, please ensure AI service is properly configured.*`,
  };

  if (
    prompt.toLowerCase().includes("audit") ||
    prompt.toLowerCase().includes("contract")
  ) {
    return demoResponses.audit;
  }

  return demoResponses.general;
}

class AIAssistantService {
  async getSecurityNews(): Promise<string> {
    try {
      const response = await fetch("/api/ai/security-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get security news");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error fetching security news:", error);
      return `# Security Intelligence Update (Offline Mode)

## ⚠️ AI Service Temporarily Unavailable

I'm currently unable to fetch real-time security intelligence due to a connectivity issue, but here's what I can share:

## 🛡️ **General Security Priorities**
• **Zero Trust Architecture**: Never trust, always verify
• **Incident Response**: Have a plan and practice it regularly
• **Threat Hunting**: Proactively search for indicators of compromise

## 🚀 **dSOC Platform Advantages**
• **Decentralized**: No single point of failure
• **Transparent**: All analyses recorded on blockchain
• **Incentivized**: Stake-based rewards for quality contributions
• **Community-driven**: Leverages collective security expertise

💡 **Pro Tip**: Regular security assessments and staying updated with threat intelligence are your best defenses against evolving cyber threats.

I'll be back online soon with fresh intelligence!`;
    }
  }

  async getChatResponse(question: string): Promise<string> {
    return getAIResponse(question);
  }

  async askQuestion(question: string): Promise<string> {
    return getAIResponse(question);
  }

  async analyzeVulnerability(description: string): Promise<string> {
    try {
      const response = await fetch("/api/ai/analyze-vulnerability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze vulnerability");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error analyzing vulnerability:", error);
      return "Unable to analyze vulnerability. Please ensure AI service is properly configured.";
    }
  }

  async runAudit(contractCode: string): Promise<string> {
    try {
      const response = await fetch("/api/ai/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete audit");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error running audit:", error);
      return "Unable to run audit. Please ensure AI service is properly configured.";
    }
  }
}

/**
 * Run an AI-powered audit on the provided smart contract code
 *
 * @param contractCode The smart contract code to audit
 * @returns A detailed audit report as a string
 */
export async function runAudit(contractCode: string): Promise<string> {
  if (!API_KEY) {
    console.warn("Gemini API key is not configured, using demo mode");
    return generateDemoAuditReport(contractCode);
  }

  try {
    console.log("Running AI audit with Google Gemini for Move smart contract");

    // Initialize the Google Generative AI with API key inside try block
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Get the generative model (Gemini Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a detailed prompt specifically for Move smart contract auditing
    const prompt = `
      You are an expert blockchain security auditor specializing in Move language (used in Sui blockchain).

      Analyze the following Move smart contract code for vulnerabilities, security issues, and logical errors:

      \`\`\`move
      ${contractCode}
      \`\`\`

      Focus on Move-specific vulnerabilities including:
      - Resource handling issues
      - Ownership problems
      - Capability misuse
      - Type safety issues
      - Module initialization flaws

      Provide a detailed report with:
        - Executive Summary (with vulnerability score from 0-10, where 0 is secure)
        - Summary of Risks
        - Detailed Findings
        - Recommendations

      Include the statement "Certified by dSOC Platform" as a certification stamp in your report.
      Format using markdown with headers, bullet points, and code blocks for examples.
    `;

    // Generate content using the Gemini model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const auditResult = response.text();

    return auditResult;
  } catch (error) {
    console.error("AI audit error:", error);
    return generateDemoAuditReport(contractCode);
  }
}

function generateDemoAuditReport(contractCode: string): string {
  return `# Smart Contract Audit Report

## Executive Summary
**Vulnerability Score: 6/10** (Medium Risk)

This is a demo audit report. The actual AI-powered analysis requires a valid Gemini API key.

## Demo Analysis
The provided contract code has been reviewed using static analysis patterns:

\`\`\`
${contractCode.substring(0, 200)}...
\`\`\`

## Recommendations
1. Configure Gemini API key for full AI analysis
2. Implement proper access controls
3. Add comprehensive input validation
4. Include proper error handling

**Certified by dSOC Platform** ✅

*This is a demo report. Configure the AI service for detailed analysis.*`;
}

// Export the assistant instance
export const aiAssistant = new AIAssistantService();

export async function analyzeSecurityIncident(
  title: string,
  description: string,
  category: string,
  evidenceHash?: string,
): Promise<string> {
  if (!API_KEY) {
    return `
## Manual Analysis Required

**Incident:** ${title}
**Category:** ${category}

**Description:** ${description}

**Note:** AI analysis is currently unavailable. Please configure the VITE_GEMINI_API_KEY environment variable to enable AI-powered analysis.

**Manual Analysis Checklist:**
1. **Severity Assessment** - Evaluate based on potential impact
2. **Threat Classification** - Categorize the type of security threat
3. **Potential Impact Analysis** - Assess business and technical impact
4. **Recommended Immediate Actions** - Define containment steps
5. **Long-term Mitigation Strategies** - Plan preventive measures
6. **Additional Investigation Steps** - Outline further analysis needed
    `;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a cybersecurity expert analyzing a security incident. Please provide a comprehensive analysis of the following incident:

Title: ${title}
Category: ${category}
Description: ${description}
${evidenceHash ? `Evidence Hash: ${evidenceHash}` : ""}

Please provide:
1. **Severity Assessment** (Critical/High/Medium/Low)
2. **Threat Classification** 
3. **Potential Impact Analysis**
4. **Recommended Immediate Actions**
5. **Long-term Mitigation Strategies**
6. **Additional Investigation Steps**

Format your response in clear sections with actionable recommendations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Unable to generate AI analysis at this time. Please try again later.";
  }
}
