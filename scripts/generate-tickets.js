
const { faker } = require('@faker-js/faker');
const fs = require('fs');

// Enhanced ticket generation script for dSOC platform
class TicketGenerator {
  constructor() {
    this.categories = [
      'Cross-Chain Bridge', 'Flash Loan Attack', 'Oracle Manipulation', 
      'DEX Router', 'Lending Protocol', 'Yield Protocol', 'NFT Marketplace',
      'Layer 2 Network', 'Smart Contract', 'Wallet Security', 'Governance Attack',
      'Validator Network', 'Stablecoin Protocol', 'Infrastructure', 'Phishing Attack'
    ];
    
    this.severities = ['Low', 'Medium', 'High', 'Critical'];
    this.statuses = [0, 1, 2, 3]; // 0: Open, 1: In Progress, 2: Under Review, 3: Completed
    this.blockchains = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base', 'BNB Chain', 'Avalanche'];
    
    this.attackVectors = [
      'Oracle Manipulation', 'Flash Loan', 'Reentrancy', 'Price Manipulation',
      'Signature Forging', 'MEV Sandwich', 'Private Key Compromise', 
      'Smart Contract Bug', 'Bridge Validation', 'Governance Attack',
      'Social Engineering', 'XSS Injection', 'DNS Poisoning'
    ];

    this.realIncidentTitles = [
      "DeFi Protocol Flash Loan Exploit",
      "Cross-Chain Bridge Signature Bypass", 
      "Oracle Price Feed Manipulation",
      "Yield Farming Strategy Bug",
      "NFT Marketplace Lazy Minting Issue",
      "Layer 2 Sequencer Downtime",
      "Multisig Wallet Signature Verification",
      "DEX Router Slippage Exploitation",
      "Staking Pool Reward Distribution Error",
      "Governance Proposal Vote Manipulation"
    ];
  }

  generateWalletAddress() {
    return '0x' + faker.string.hexadecimal({ length: 40 }).toLowerCase();
  }

  generateTxHash() {
    return '0x' + faker.string.hexadecimal({ length: 64 }).toLowerCase();
  }

  generateEvidenceHash() {
    return '0x' + faker.string.hexadecimal({ length: 64 }).toLowerCase();
  }

  generateStakeAmount(severity) {
    const baseAmounts = {
      'Low': { min: 1000, max: 3000 },
      'Medium': { min: 2500, max: 5000 },
      'High': { min: 4500, max: 8000 },
      'Critical': { min: 7500, max: 15000 }
    };
    
    const range = baseAmounts[severity];
    return faker.number.int({ min: range.min, max: range.max });
  }

  generateLossAmount(severity) {
    const baseLoss = {
      'Low': { min: 10000, max: 100000 },
      'Medium': { min: 100000, max: 1000000 },
      'High': { min: 1000000, max: 10000000 },
      'Critical': { min: 10000000, max: 100000000 }
    };
    
    const range = baseLoss[severity];
    const amount = faker.number.int({ min: range.min, max: range.max });
    
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  }

  generateDetailedDescription(category, severity, attackVector) {
    const templates = {
      'Cross-Chain Bridge': [
        `Critical vulnerability in bridge validator consensus mechanism allowing unauthorized cross-chain asset transfers. Attackers exploited signature verification bypass to drain bridge reserves across multiple networks.`,
        `Sophisticated attack on cross-chain infrastructure targeting validator key compromise. Multiple bridge operators affected with coordinated drainage of locked assets.`
      ],
      'Flash Loan Attack': [
        `Complex flash loan exploitation targeting price oracle manipulation across multiple DeFi protocols. Attackers borrowed large amounts, manipulated asset prices, and extracted value through arbitrage.`,
        `Multi-protocol flash loan attack utilizing reentrancy vulnerabilities to amplify borrowed amounts and drain protocol reserves through cascading liquidations.`
      ],
      'Oracle Manipulation': [
        `Price feed manipulation attack targeting critical DeFi infrastructure. Attackers coordinated large trades to skew oracle prices and trigger massive liquidations across lending protocols.`,
        `Sophisticated oracle attack exploiting time-based price feed delays to create arbitrage opportunities and extract value from automated market makers.`
      ],
      'DEX Router': [
        `Critical vulnerability in DEX routing algorithm allowing front-running and MEV extraction through transaction ordering manipulation. Users experiencing significant slippage losses.`,
        `Router contract bug enabling malicious actors to redirect user transactions through unfavorable trading paths, extracting value through hidden fees.`
      ]
    };

    const categoryTemplates = templates[category] || [
      `Security incident affecting ${category.toLowerCase()} infrastructure with potential for significant user impact and asset loss.`
    ];

    return faker.helpers.arrayElement(categoryTemplates);
  }

  generateSingleTicket(id, ticketId) {
    const severity = faker.helpers.arrayElement(this.severities);
    const category = faker.helpers.arrayElement(this.categories);
    const attackVector = faker.helpers.arrayElement(this.attackVectors);
    const blockchain = faker.helpers.arrayElement(this.blockchains);
    const status = faker.helpers.weightedArrayElement([
      { weight: 30, value: 0 }, // Open
      { weight: 25, value: 1 }, // In Progress  
      { weight: 20, value: 2 }, // Under Review
      { weight: 25, value: 3 }  // Completed
    ]);

    const clientAddress = this.generateWalletAddress();
    const analystAddress = status > 0 ? this.generateWalletAddress() : undefined;

    const baseTitle = faker.helpers.arrayElement(this.realIncidentTitles);
    const title = `${baseTitle} - ${this.generateLossAmount(severity)}`;

    return {
      id,
      ticket_id: ticketId,
      client_address: clientAddress,
      analyst_address: analystAddress,
      title,
      description: this.generateDetailedDescription(category, severity, attackVector),
      category,
      evidence_hash: this.generateEvidenceHash(),
      report_hash: status >= 2 ? this.generateEvidenceHash() : undefined,
      status,
      stake_amount: this.generateStakeAmount(severity),
      transaction_hash: this.generateTxHash(),
      created_at: faker.date.recent({ days: 90 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
      severity,
      loss_amount: this.generateLossAmount(severity),
      affected_protocols: [faker.company.name() + " Protocol", category],
      attack_vector: attackVector,
      blockchain
    };
  }

  generateTickets(count = 100) {
    const tickets = [];
    
    for (let i = 1; i <= count; i++) {
      tickets.push(this.generateSingleTicket(i, 1000 + i));
    }

    return tickets;
  }

  saveToFile(tickets, filename = 'generated-tickets.json') {
    const output = {
      generated_at: new Date().toISOString(),
      total_tickets: tickets.length,
      tickets: tickets
    };

    fs.writeFileSync(filename, JSON.stringify(output, null, 2));
    console.log(`✅ Generated ${tickets.length} tickets and saved to ${filename}`);
  }

  generateCSV(tickets, filename = 'tickets.csv') {
    const headers = [
      'id', 'ticket_id', 'title', 'category', 'severity', 'status', 
      'blockchain', 'loss_amount', 'stake_amount', 'attack_vector', 'created_at'
    ];

    const csvContent = [
      headers.join(','),
      ...tickets.map(ticket => [
        ticket.id,
        ticket.ticket_id,
        `"${ticket.title}"`,
        ticket.category,
        ticket.severity,
        ticket.status,
        ticket.blockchain,
        ticket.loss_amount,
        ticket.stake_amount,
        ticket.attack_vector,
        ticket.created_at
      ].join(','))
    ].join('\n');

    fs.writeFileSync(filename, csvContent);
    console.log(`📊 Generated CSV export: ${filename}`);
  }
}

// CLI Usage
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 100;
const format = args[1] || 'json';

console.log(`🎯 Generating ${count} security incident tickets...`);

const generator = new TicketGenerator();
const tickets = generator.generateTickets(count);

// Generate summary statistics
const stats = {
  by_severity: tickets.reduce((acc, t) => {
    acc[t.severity] = (acc[t.severity] || 0) + 1;
    return acc;
  }, {}),
  by_category: tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {}),
  by_status: tickets.reduce((acc, t) => {
    const statusNames = ['Open', 'In Progress', 'Under Review', 'Completed'];
    const statusName = statusNames[t.status];
    acc[statusName] = (acc[statusName] || 0) + 1;
    return acc;
  }, {}),
  total_stake_amount: tickets.reduce((sum, t) => sum + t.stake_amount, 0)
};

console.log('\n📈 Generation Summary:');
console.log('Severity Distribution:', stats.by_severity);
console.log('Status Distribution:', stats.by_status);
console.log('Total Stake Amount:', stats.total_stake_amount.toLocaleString(), 'CLT');

// Save files
generator.saveToFile(tickets, `tickets-${Date.now()}.json`);

if (format === 'csv' || format === 'both') {
  generator.generateCSV(tickets, `tickets-${Date.now()}.csv`);
}

console.log('\n🚀 Ticket generation completed successfully!');

module.exports = { TicketGenerator };
