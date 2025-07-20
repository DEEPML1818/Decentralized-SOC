import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAVgd5WU8k-AxshgKnMLU8REEhNGT2GUZc";

console.log("AI API Key status:", API_KEY ? "loaded" : "missing");

/**
 * Get AI response for security-related queries
 */
export async function getAIResponse(prompt: string): Promise<string> {
  if (!API_KEY) {
    console.warn("Gemini API key is not configured, using demo mode");
    return generateDemoResponse(prompt);
  }

  try {
    console.log("Getting AI response with Google Gemini");

    // Initialize the Google Generative AI with API key
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Get the generative model (Gemini Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create a detailed prompt for cybersecurity context
    const securityPrompt = `
      You are an expert cybersecurity analyst and consultant specializing in blockchain security, smart contract auditing, and general cybersecurity practices.

      User Query: ${prompt}

      Please provide a comprehensive, professional response that includes:
      - Clear analysis of the security topic
      - Specific recommendations and best practices
      - Risk assessment where applicable
      - Actionable steps for implementation

      Keep your response informative, practical, and focused on security implications.
      Format your response with clear sections and bullet points for readability.
    `;

    // Generate the content
    const result = await model.generateContent(securityPrompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI response generated successfully");
    return text;
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
    if (!API_KEY) {
      return `# Security Intelligence Update

## Current Security Landscape
The cybersecurity threat landscape continues to evolve rapidly with new vulnerabilities and attack vectors emerging daily.

## Key Areas of Focus
• **Smart Contract Security**: Continuous monitoring for vulnerabilities in DeFi protocols
• **Supply Chain Attacks**: Increased targeting of software dependencies
• **Zero-Day Exploits**: Advanced persistent threats utilizing unknown vulnerabilities

## dSOC Platform Benefits
Our decentralized SOC approach provides:
• **Distributed Analysis**: Multiple expert perspectives on security incidents
• **Blockchain Transparency**: Immutable records of security assessments
• **Incentivized Participation**: Stake-based rewards for quality security analysis

*Note: Connect to Gemini AI for real-time security intelligence updates.*`;
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const prompt = `Provide the latest cybersecurity news and threat intelligence. Include:

1. **Current Threats & Vulnerabilities**
   - Latest CVEs and zero-days
   - Active ransomware campaigns
   - Supply chain attacks

2. **Security Research & Trends**
   - New attack techniques
   - Defensive innovations
   - Industry best practices

3. **Blockchain & DeFi Security**
   - Smart contract vulnerabilities
   - DeFi protocol exploits
   - Web3 security trends

Format as markdown with clear sections and actionable insights.`;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
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

I'll be back online soon with fresh intelligence! 🤖✨`;
    }
  }

  async getChatResponse(question: string): Promise<string> {
    if (!API_KEY) {
      return `Hey there! 👋 I'd love to help you with that cybersecurity question, but I'm currently running in offline mode.

**What I can tell you while offline:**

🔒 **Security Fundamentals:**
• Always use multi-factor authentication
• Keep systems and software updated
• Implement the principle of least privilege
• Regular security audits and assessments

🚀 **About dSOC Platform:**
• **Decentralized**: Multiple security experts review each security case
• **Transparent**: All analyses are recorded on IOTA blockchain
• **Rewarding**: Earn tokens for quality security contributions
• **Comprehensive**: From smart contracts to web app security

💡 **Quick Tips:**
• Use tools like static analyzers for code security
• Implement defense in depth strategies
• Regular security audits are crucial
• Stay updated with latest threat intelligence

I'll be back to full power soon! In the meantime, feel free to explore the platform or ask another question. 🤖✨`;
    }

    try {
      const systemPrompt = `You are a cybersecurity expert and AI assistant for the dSOC (Decentralized Security Operations Center) platform. You specialize in:

- Blockchain and smart contract security
- Threat analysis and incident response
- Vulnerability assessment and penetration testing
- Security architecture and best practices
- Bug bounty hunting
- DeFi security and Web3 vulnerabilities
- General cybersecurity best practices
- Security operations center management

**About dSOC platform:**
- Uses IOTA blockchain for decentralized ticket management
- Move smart contracts for secure operations  
- Stake-based incentives for security analysts
- Multi-role validation (client, analyst, certifier)
- Transparent, community-driven security analysis

**Response style:**
- Be conversational and helpful
- Provide actionable, practical advice
- Include examples when possible
- Break down complex topics into digestible parts
- Show enthusiasm for helping users learn cybersecurity

User question: ${question}

Respond in a friendly, conversational way while providing expert-level cybersecurity knowledge.`;

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error getting AI response:", error);
      return `Oops! 😅 I'm having some technical difficulties right now, but don't worry!

**Here's what I can tell you while I get back online:**

🔒 **Security Fundamentals:**
• Always validate and sanitize inputs
• Use strong authentication and authorization
• Keep systems updated and patched
• Monitor for suspicious activities

🚀 **dSOC Platform Highlights:**
• **Community-Driven**: Multiple expert review each security case
• **Transparent**: All analyses are recorded on IOTA blockchain
• **Rewarding**: Earn tokens for quality security contributions
• **Comprehensive**: From smart contracts to web app security

💡 **Quick Tips:**
• Use tools like static analyzers for code security
• Implement defense in depth strategies
• Regular security audits are crucial
• Stay updated with latest threat intelligence

I'll be back to full power soon! In the meantime, feel free to explore the platform or ask another question. 🤖✨`;
    }
  }

  async analyzeVulnerability(description: string): Promise<string> {
    if (!API_KEY) {
      return "Unable to analyze vulnerability. Please ensure AI service is properly configured.";
    }

    try {
      const prompt = `Analyze this potential security vulnerability and provide a detailed assessment:

${description}

Please provide:
1. **Severity Assessment** (Critical/High/Medium/Low)
2. **Attack Vectors** - How this could be exploited
3. **Impact Analysis** - What damage could result
4. **Mitigation Strategies** - How to fix or prevent
5. **Detection Methods** - How to identify this vulnerability
6. **Similar Cases** - Examples from the wild if any

Format as structured markdown for a security analyst.`;

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error analyzing vulnerability:", error);
      return "Unable to analyze vulnerability. Please ensure AI service is properly configured.";
    }
  }

  async runAudit(contractCode: string): Promise<string> {
    return runAudit(contractCode);
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
