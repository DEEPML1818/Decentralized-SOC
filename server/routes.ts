import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Assistant endpoints
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!API_KEY) {
        return res.status(500).json({ 
          error: "AI service is not configured. Please add GOOGLE_API_KEY to environment variables." 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      res.json({ response: text });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/ai/audit", async (req, res) => {
    try {
      const { contractCode } = req.body;
      
      if (!API_KEY) {
        return res.status(500).json({ 
          error: "AI service is not configured. Please add GOOGLE_API_KEY to environment variables." 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        
      Include the statement "Certified by AuditWarp" as a certification stamp in your report.
      Format using markdown with headers, bullet points, and code blocks for examples.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const auditResult = response.text();

      res.json({ response: auditResult });
    } catch (error) {
      console.error("AI audit error:", error);
      res.status(500).json({ 
        error: "Failed to complete audit",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/ai/security-news", async (req, res) => {
    try {
      if (!API_KEY) {
        return res.status(500).json({ 
          error: "AI service is not configured. Please add GOOGLE_API_KEY to environment variables." 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ response: text });
    } catch (error) {
      console.error("Security news error:", error);
      res.status(500).json({ 
        error: "Failed to get security news",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/ai/analyze-vulnerability", async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!API_KEY) {
        return res.status(500).json({ 
          error: "AI service is not configured. Please add GOOGLE_API_KEY to environment variables." 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ response: text });
    } catch (error) {
      console.error("Vulnerability analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze vulnerability",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
