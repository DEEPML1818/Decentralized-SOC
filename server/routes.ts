import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertIncidentReportSchema, insertTicketSchema } from "@shared/schema";

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

  // CLT Reward Management endpoints
  app.post("/api/rewards/mint", async (req, res) => {
    try {
      const { recipientAddress, amount, rewardType, ticketId } = req.body;
      
      if (!recipientAddress || !amount || !rewardType) {
        return res.status(400).json({ 
          error: "Missing required fields: recipientAddress, amount, and rewardType" 
        });
      }

      // In a real implementation, this would:
      // 1. Validate the request (check permissions, verify recipient)
      // 2. Call the CLT Token contract mint function
      // 3. Store the transaction in database
      // 4. Return transaction details

      console.log(`🎯 Reward mint request:`, {
        recipient: recipientAddress,
        amount: amount,
        type: rewardType,
        ticketId: ticketId || 'N/A'
      });

      // Mock response - in real app, return actual transaction hash
      const mockTransaction = {
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 11000000,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        transaction: mockTransaction,
        message: `Successfully minted ${amount} CLT tokens for ${rewardType}`
      });

    } catch (error) {
      console.error("Reward minting error:", error);
      res.status(500).json({ 
        error: "Failed to mint reward",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/rewards/history/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!address) {
        return res.status(400).json({ error: "Address parameter is required" });
      }

      // Mock reward history - in real app, fetch from blockchain events
      const mockHistory = [
        {
          id: 1,
          recipient: address,
          amount: "50",
          type: 'analyst',
          txHash: "0x123...abc",
          timestamp: new Date().toISOString(),
          status: 'completed',
          ticketId: 1
        },
        {
          id: 2,
          recipient: address,
          amount: "30",
          type: 'certifier',
          txHash: "0x456...def",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          ticketId: 2
        }
      ];

      res.json({ history: mockHistory });

    } catch (error) {
      console.error("Reward history error:", error);
      res.status(500).json({ 
        error: "Failed to fetch reward history",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/rewards/stats", async (req, res) => {
    try {
      // Mock reward statistics - in real app, calculate from blockchain data
      const mockStats = {
        totalRewardsMinted: 12500,
        analystRewards: 8000,
        certifierRewards: 3000,
        stakerRewards: 1500,
        totalRecipients: 45,
        lastMonthMinted: 2300
      };

      res.json({ stats: mockStats });

    } catch (error) {
      console.error("Reward stats error:", error);
      res.status(500).json({ 
        error: "Failed to fetch reward statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Store staking pool metadata when creating tickets
  app.post("/api/pools/metadata", async (req, res) => {
    try {
      const { poolAddress, title, description, category, riskLevel, estimatedAPY, minStake, maxStake } = req.body;
      
      if (!poolAddress || !title || !description) {
        return res.status(400).json({ 
          error: "Missing required fields: poolAddress, title, and description" 
        });
      }

      const metadata = {
        poolAddress,
        title,
        description,
        category: category || "Security Analysis",
        riskLevel: riskLevel || "Medium",
        estimatedAPY: estimatedAPY || "12-18%",
        minStake: minStake || "10",
        maxStake: maxStake || "1000",
        createdAt: new Date().toISOString(),
        version: "1.0"
      };

      // Store metadata in IPFS
      console.log(`🔗 Storing pool metadata in IPFS:`, {
        poolAddress: poolAddress,
        title: title,
        description: description.substring(0, 100) + "..."
      });

      const ipfsHash = await storage.uploadJSON(metadata, `pool-${poolAddress}-metadata`);

      res.json({
        success: true,
        ipfsHash: ipfsHash,
        metadata: metadata,
        message: `Pool metadata stored in IPFS with hash: ${ipfsHash}`
      });

    } catch (error) {
      console.error("Pool metadata storage error:", error);
      res.status(500).json({ 
        error: "Failed to store pool metadata",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/pools/metadata/:hash", async (req, res) => {
    try {
      const { hash } = req.params;
      
      if (!hash) {
        return res.status(400).json({ error: "IPFS hash parameter is required" });
      }

      const metadata = await storage.getJSON(hash);
      res.json({ metadata });

    } catch (error) {
      console.error("Pool metadata retrieval error:", error);
      res.status(500).json({ 
        error: "Failed to retrieve pool metadata",
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

  // Incident Report endpoints for real-time dashboard updates
  app.post("/api/incident-reports", async (req, res) => {
    try {
      const validatedData = insertIncidentReportSchema.parse(req.body);
      const storage = getStorage();
      const report = await storage.createIncidentReport(validatedData);

      // Create corresponding ticket/case for the incident
      const ticket = await storage.createTicket({
        title: report.title,
        description: report.description,
        severity: report.severity,
        status: "open",
        client_name: report.client_name,
        contact_info: report.contact_info,
        client_wallet: report.client_wallet,
        transaction_hash: report.transaction_hash,
        block_number: report.block_number,
        contract_address: report.contract_address,
        affected_systems: report.affected_systems,
        attack_vectors: report.attack_vectors,
        evidence_urls: report.evidence_urls
      });

      // Update the incident report with the ticket ID
      const updatedReport = await storage.updateIncidentReport(report.id, { 
        ticket_id: ticket.id 
      });

      console.log(`New incident report created: ${report.title} (ID: ${report.id}) with case ID: ${ticket.id}`);
      res.json(updatedReport);
    } catch (error) {
      console.error("Failed to create incident report:", error);
      res.status(400).json({ 
        error: "Failed to create incident report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/incident-reports", async (req, res) => {
    try {
      const storage = getStorage();
      const reports = await storage.getIncidentReports();
      res.json(reports);
    } catch (error) {
      console.error("Failed to fetch incident reports:", error);
      res.status(500).json({ 
        error: "Failed to fetch incident reports",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all tickets/cases for case management
  app.get("/api/tickets", async (req, res) => {
    try {
      const storage = getStorage();
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      res.status(500).json({ 
        error: "Failed to fetch tickets",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update ticket status
  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const storage = getStorage();
      const id = parseInt(req.params.id);
      const updates = req.body;
      const ticket = await storage.updateTicket(id, updates);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  app.get("/api/incident-reports/:id", async (req, res) => {
    try {
      const storage = getStorage();
      const id = parseInt(req.params.id);
      const report = await storage.getIncidentReportById(id);

      if (!report) {
        return res.status(404).json({ error: "Incident report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Failed to fetch incident report:", error);
      res.status(500).json({ 
        error: "Failed to fetch incident report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/incident-reports/:id", async (req, res) => {
    try {
      const storage = getStorage();
      const id = parseInt(req.params.id);
      const updates = req.body;

      const updatedReport = await storage.updateIncidentReport(id, updates);

      console.log(`Incident report updated: ${updatedReport.title} (ID: ${id})`);
      res.json(updatedReport);
    } catch (error) {
      console.error("Failed to update incident report:", error);
      res.status(500).json({ 
        error: "Failed to update incident report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Analyst Assignment endpoint
  app.patch("/api/incident-reports/:id/assign-analyst", async (req, res) => {
    try {
      const storage = getStorage();
      const id = parseInt(req.params.id);
      const { analyst_address } = req.body;

      if (!analyst_address) {
        return res.status(400).json({ error: "Analyst address is required" });
      }

      const updates = {
        assigned_analyst: analyst_address,
        status: "assigned"
      };

      const updatedReport = await storage.updateIncidentReport(id, updates);

      console.log(`Analyst ${analyst_address} assigned to incident report ID: ${id}`);
      res.json(updatedReport);
    } catch (error) {
      console.error("Failed to assign analyst:", error);
      res.status(500).json({ 
        error: "Failed to assign analyst",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Report Submission endpoint
  app.patch("/api/incident-reports/:id/submit-report", async (req, res) => {
    try {
      const storage = getStorage();
      const id = parseInt(req.params.id);
      const { analyst_address, analysis_report, status = "analyzed" } = req.body;

      if (!analyst_address || !analysis_report) {
        return res.status(400).json({ error: "Analyst address and analysis report are required" });
      }

      // Verify that the analyst is assigned to this case
      const existingReport = await storage.getIncidentReportById(id);
      if (!existingReport) {
        return res.status(404).json({ error: "Incident report not found" });
      }

      if (existingReport.assigned_analyst !== analyst_address) {
        return res.status(403).json({ error: "Only the assigned analyst can submit a report for this case" });
      }

      const updates = {
        ai_analysis: analysis_report,
        status: status,
        updated_at: new Date().toISOString()
      };

      const updatedReport = await storage.updateIncidentReport(id, updates);

      console.log(`Analysis report submitted by ${analyst_address} for incident report ID: ${id}`);
      res.json(updatedReport);
    } catch (error) {
      console.error("Failed to submit report:", error);
      res.status(500).json({ 
        error: "Failed to submit report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Incident Analysis endpoint
  app.post("/api/ai/analyze-incident", async (req, res) => {
    try {
      const { description } = req.body;

      if (!API_KEY) {
        return res.status(500).json({ 
          error: "AI service is not configured. Please add GOOGLE_API_KEY to environment variables." 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are a cybersecurity expert analyzing a security incident report. Based on this description, extract and structure the following information:

User description: "${description}"

Please provide a JSON response with the following structure:
{
  "title": "Brief descriptive title of the incident",
  "severity": "critical|high|medium|low",
  "affected_systems": "List of affected systems/platforms",
  "attack_vectors": "Identified attack methods or vectors",
  "analysis": "Detailed analysis of the incident including potential impact, root cause, and recommended immediate actions"
}

Focus on:
- Blockchain/crypto security if relevant
- Web application security
- Social engineering indicators
- Financial fraud patterns
- Technical vulnerabilities

Ensure the JSON is valid and parseable.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse as JSON, fallback to text if it fails
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          res.json(analysisData);
        } else {
          // Fallback: return structured text analysis
          res.json({
            title: "Security Incident Analysis",
            severity: "medium",
            affected_systems: "To be determined",
            attack_vectors: "Under investigation",
            analysis: text
          });
        }
      } catch (parseError) {
        // If JSON parsing fails, return the raw analysis
        res.json({
          title: "Security Incident Analysis",
          severity: "medium", 
          affected_systems: "To be determined",
          attack_vectors: "Under investigation",
          analysis: text
        });
      }
    } catch (error) {
      console.error("AI incident analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze incident",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Ticket endpoints
  app.get("/api/tickets", async (req, res) => {
    try {
      const storage = getStorage();
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      res.status(500).json({ 
        error: "Failed to fetch tickets",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const storage = getStorage();
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      res.status(500).json({ 
        error: "Failed to create ticket",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Store incident reports submitted via blockchain (handles both manual and AI-generated cases)
  app.post('/api/incident-reports', async (req, res) => {
    try {
      const incidentData = req.body;

      // Store in memory (in production, this would go to a database)
      const incidentReport = {
        id: Date.now().toString(),
        ...incidentData,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        analysisStatus: 'pending_assignment'
      };

      console.log('Unified incident report stored:', {
        id: incidentReport.id,
        title: incidentReport.title,
        network: incidentReport.network,
        txHash: incidentReport.blockchainTxHash,
        submissionType: incidentReport.submissionType || 'manual_incident_report'
      });

      // Trigger analyst notification for both types
      console.log('Notifying analysts of new case:', {
        type: incidentReport.submissionType,
        severity: incidentReport.severity,
        requiredAnalysts: incidentReport.requiredAnalysts
      });

      res.json({ 
        success: true, 
        incidentId: incidentReport.id,
        message: 'Case submitted successfully to dSOC network' 
      });

    } catch (error) {
      console.error('Error storing incident report:', error);
      res.status(500).json({ 
        error: 'Failed to store incident report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // AI-powered case analysis endpoint for blockchain submission
  app.post('/api/ai/analyze-case', async (req, res) => {
    try {
      const { userInput, caseType, requestType } = req.body;

      if (!userInput || !caseType) {
        return res.status(400).json({ error: 'User input and case type are required' });
      }

      if (!API_KEY) {
        return res.status(500).json({ 
          error: "AI service is not configured. Please add GEMINI_API_KEY to environment variables." 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are a cybersecurity expert analyzing a security incident for blockchain case submission. 

Case Type: ${caseType}
User Description: ${userInput}

Analyze this security incident and provide a structured response for security analysts. Include:
1. A clear, professional title
2. Severity level (low/medium/high/critical) 
3. Category classification
4. Detailed technical analysis
5. Security recommendations
6. Estimated CLT reward amount (50-1000 based on severity and complexity)
7. Number of analysts needed (1-5 based on complexity)

Respond in valid JSON format:
{
  "title": "Professional case title",
  "severity": "low|medium|high|critical", 
  "category": "vulnerability|breach|malware|phishing|ddos|insider_threat|compliance|other",
  "description": "Clear, concise summary for analysts",
  "technicalDetails": "Detailed technical analysis with evidence and indicators",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "estimatedReward": 100,
  "requiredAnalysts": 2
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      // Try to parse as JSON, fallback to structured parsing
      let parsedResult;
      try {
        // Extract JSON from response
        const jsonMatch = analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // Fallback structured response
        const severityMap: Record<string, string> = {
          'vulnerability': 'medium',
          'breach': 'high', 
          'malware': 'high',
          'phishing': 'medium',
          'ddos': 'high',
          'insider_threat': 'critical',
          'compliance': 'low',
          'other': 'medium'
        };

        const caseSeverity = severityMap[caseType] || 'medium';

        parsedResult = {
          title: `${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Security Case`,
          severity: caseSeverity,
          category: caseType,
          description: userInput.substring(0, 200) + (userInput.length > 200 ? '...' : ''),
          technicalDetails: analysis,
          recommendations: [
            'Immediate containment and isolation',
            'Comprehensive forensic analysis', 
            'Implementation of monitoring controls'
          ],
          estimatedReward: caseSeverity === 'critical' ? 500 : caseSeverity === 'high' ? 300 : 150,
          requiredAnalysts: caseSeverity === 'critical' ? 3 : 2
        };
      }

      res.json(parsedResult);
    } catch (error: any) {
      console.error('Case analysis error:', error.message);
      res.status(500).json({ 
        error: 'Failed to analyze security case',
        details: error.message 
      });
    }
  });

  // AI Cases storage endpoint
  app.post('/api/ai-cases', async (req, res) => {
    try {
      const caseData = {
        id: Date.now().toString(),
        ...req.body,
        status: 'pending_analysis',
        createdAt: new Date().toISOString()
      };

      // Store case in memory (in production, use database)
      if (!(global as any).aiCases) {
        (global as any).aiCases = [];
      }
      (global as any).aiCases.unshift(caseData);

      console.log(`New AI case uploaded: ${caseData.title} (Network: ${caseData.network})`);

      res.json({ success: true, caseId: caseData.id });
    } catch (error: any) {
      console.error('AI case storage error:', error.message);
      res.status(500).json({ 
        error: 'Failed to store AI case',
        details: error.message 
      });
    }
  });

  // Get AI cases endpoint
  app.get('/api/ai-cases', async (req, res) => {
    try {
      const cases = (global as any).aiCases || [];
      res.json(cases);
    } catch (error: any) {
      console.error('AI cases retrieval error:', error.message);
      res.status(500).json({ 
        error: 'Failed to retrieve AI cases',
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}