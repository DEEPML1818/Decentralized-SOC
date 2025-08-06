
const axios = require('axios');
const { faker } = require('@faker-js/faker');

class TicketAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Create a new incident report
  async createIncidentReport(ticketData) {
    try {
      const response = await this.client.post('/api/incident-reports', ticketData);
      console.log('✅ Incident report created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating incident report:', error.message);
      throw error;
    }
  }

  // Create a new ticket/case
  async createTicket(ticketData) {
    try {
      const response = await this.client.post('/api/tickets', ticketData);
      console.log('✅ Ticket created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating ticket:', error.message);
      throw error;
    }
  }

  // Get all tickets
  async getTickets() {
    try {
      const response = await this.client.get('/api/tickets');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching tickets:', error.message);
      throw error;
    }
  }

  // Update ticket status
  async updateTicket(ticketId, updates) {
    try {
      const response = await this.client.patch(`/api/tickets/${ticketId}`, updates);
      console.log('✅ Ticket updated:', ticketId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating ticket:', error.message);
      throw error;
    }
  }

  // Generate realistic ticket data
  generateTicketData(options = {}) {
    const categories = [
      'Smart Contract Vulnerability', 'Cross-Chain Bridge Attack', 'Flash Loan Exploit',
      'Oracle Manipulation', 'DEX Router Bug', 'Governance Attack', 'Validator Issues'
    ];

    const severities = ['low', 'medium', 'high', 'critical'];
    const blockchains = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'];
    
    const severity = options.severity || faker.helpers.arrayElement(severities);
    const category = options.category || faker.helpers.arrayElement(categories);
    const blockchain = options.blockchain || faker.helpers.arrayElement(blockchains);

    return {
      title: options.title || `${category} on ${blockchain} - Security Alert`,
      description: options.description || this.generateRealisticDescription(category, severity),
      severity: severity,
      status: options.status || 'open',
      client_name: options.client_name || faker.internet.userName(),
      contact_info: options.contact_info || faker.internet.email(),
      client_wallet: options.client_wallet || '0x' + faker.string.hexadecimal({ length: 40 }).toLowerCase(),
      affected_systems: options.affected_systems || `${category} on ${blockchain}`,
      attack_vectors: options.attack_vectors || this.getAttackVectorForCategory(category),
      evidence_urls: options.evidence_urls || `evidence-${Date.now()}.pdf`,
      transaction_hash: options.transaction_hash || '0x' + faker.string.hexadecimal({ length: 64 }).toLowerCase(),
      block_number: options.block_number || faker.number.int({ min: 18000000, max: 19000000 }),
      contract_address: options.contract_address || '0x' + faker.string.hexadecimal({ length: 40 }).toLowerCase()
    };
  }

  generateRealisticDescription(category, severity) {
    const descriptions = {
      'Smart Contract Vulnerability': [
        'Discovered reentrancy vulnerability in token transfer function allowing unauthorized fund withdrawal',
        'Critical integer overflow bug in reward calculation mechanism enables infinite token minting',
        'Access control bypass in admin functions allows unauthorized protocol parameter changes'
      ],
      'Cross-Chain Bridge Attack': [
        'Validator signature verification bypass enables unauthorized cross-chain asset transfers',
        'Bridge contract logic error allows double-spending of locked assets across chains',
        'Merkle tree manipulation in bridge proof system enables fraudulent withdrawals'
      ],
      'Flash Loan Exploit': [
        'Complex multi-protocol flash loan attack manipulating oracle prices for arbitrage profit',
        'Reentrancy attack using flash loans to amplify borrowed amounts and drain protocol',
        'Price manipulation through coordinated flash loan and DEX trades affecting lending protocols'
      ],
      'Oracle Manipulation': [
        'Price feed manipulation through large volume trades causing liquidation cascade',
        'Oracle delay exploitation using time-weighted average price vulnerabilities',
        'Coordinated attack on multiple price feeds causing system-wide pricing errors'
      ]
    };

    const categoryDescriptions = descriptions[category] || [
      `Security incident in ${category.toLowerCase()} requiring immediate investigation and response`
    ];

    return faker.helpers.arrayElement(categoryDescriptions);
  }

  getAttackVectorForCategory(category) {
    const attackVectors = {
      'Smart Contract Vulnerability': 'Reentrancy, Integer Overflow, Access Control',
      'Cross-Chain Bridge Attack': 'Signature Forging, Validator Compromise',
      'Flash Loan Exploit': 'Price Manipulation, MEV, Arbitrage',
      'Oracle Manipulation': 'Price Feed Attack, Time Delay Exploitation',
      'DEX Router Bug': 'Slippage Manipulation, Front-running',
      'Governance Attack': 'Vote Manipulation, Proposal Spam',
      'Validator Issues': 'Slashing, Double Signing, Network Partition'
    };

    return attackVectors[category] || 'Under Investigation';
  }

  // Batch create multiple tickets
  async batchCreateTickets(count = 10, options = {}) {
    console.log(`🚀 Creating ${count} tickets...`);
    const results = [];

    for (let i = 0; i < count; i++) {
      try {
        const ticketData = this.generateTicketData(options);
        const result = await this.createIncidentReport(ticketData);
        results.push(result);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to create ticket ${i + 1}:`, error.message);
      }
    }

    console.log(`✅ Successfully created ${results.length}/${count} tickets`);
    return results;
  }

  // AI-powered ticket analysis
  async analyzeIncident(description) {
    try {
      const response = await this.client.post('/api/ai/analyze-incident', {
        description: description
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error analyzing incident:', error.message);
      throw error;
    }
  }

  // Create ticket with AI analysis
  async createAnalyzedTicket(userDescription, clientInfo = {}) {
    try {
      console.log('🤖 Analyzing incident with AI...');
      const analysis = await this.analyzeIncident(userDescription);
      
      const ticketData = {
        title: analysis.title,
        description: userDescription,
        severity: analysis.severity,
        status: 'open',
        client_name: clientInfo.name || faker.internet.userName(),
        contact_info: clientInfo.email || faker.internet.email(),
        client_wallet: clientInfo.wallet || '0x' + faker.string.hexadecimal({ length: 40 }).toLowerCase(),
        affected_systems: analysis.affected_systems,
        attack_vectors: analysis.attack_vectors,
        evidence_urls: clientInfo.evidence || 'user-submitted-evidence.pdf',
        ai_analysis: analysis.analysis,
        transaction_hash: '0x' + faker.string.hexadecimal({ length: 64 }).toLowerCase(),
        block_number: faker.number.int({ min: 18000000, max: 19000000 }),
        contract_address: '0x' + faker.string.hexadecimal({ length: 40 }).toLowerCase()
      };

      console.log('📝 Creating ticket with AI analysis...');
      const result = await this.createIncidentReport(ticketData);
      
      console.log('✅ AI-analyzed ticket created successfully!');
      console.log('Analysis Summary:', {
        severity: analysis.severity,
        affected_systems: analysis.affected_systems,
        attack_vectors: analysis.attack_vectors
      });

      return result;
    } catch (error) {
      console.error('❌ Error creating AI-analyzed ticket:', error.message);
      throw error;
    }
  }
}

// CLI Usage Examples
async function main() {
  const api = new TicketAPI();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'create':
        const count = parseInt(args[1]) || 1;
        await api.batchCreateTickets(count);
        break;

      case 'analyze':
        const description = args[1] || 'Suspicious flash loan transaction draining DEX liquidity pool';
        const analyzed = await api.createAnalyzedTicket(description);
        console.log('Created analyzed ticket:', analyzed.id);
        break;

      case 'list':
        const tickets = await api.getTickets();
        console.log(`📋 Found ${tickets.length} tickets`);
        tickets.slice(0, 5).forEach(ticket => {
          console.log(`- ${ticket.id}: ${ticket.title} (${ticket.severity})`);
        });
        break;

      case 'update':
        const ticketId = args[1];
        const status = args[2] || 'in_progress';
        if (!ticketId) {
          console.log('Usage: node create-ticket-api.js update <ticket_id> <status>');
          return;
        }
        await api.updateTicket(ticketId, { status });
        break;

      default:
        console.log(`
🎯 dSOC Ticket API Tool

Usage:
  node create-ticket-api.js create [count]     - Create tickets (default: 1)
  node create-ticket-api.js analyze [desc]     - Create AI-analyzed ticket  
  node create-ticket-api.js list               - List existing tickets
  node create-ticket-api.js update <id> <status> - Update ticket status

Examples:
  node create-ticket-api.js create 5
  node create-ticket-api.js analyze "Flash loan attack on Uniswap V3"
  node create-ticket-api.js update 1 completed
        `);
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (require.main === module) {
  main();
}

module.exports = { TicketAPI };
