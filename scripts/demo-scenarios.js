
const { TicketAPI } = require('./create-ticket-api.js');

// Demo scenarios for different types of security incidents
class DemoScenarios {
  constructor() {
    this.api = new TicketAPI();
  }

  // Scenario 1: Flash Loan Attack
  async createFlashLoanScenario() {
    console.log('🔥 Creating Flash Loan Attack Scenario...');
    
    const scenarios = [
      {
        title: 'Compound V3 Flash Loan Exploit - $4.2M',
        description: 'Attacker utilized Aave flash loans to borrow 50,000 ETH, manipulated Chainlink oracle through large Uniswap trades, inflated collateral values on Compound V3, borrowed maximum USDC, then crashed ETH price causing protocol insolvency.',
        severity: 'critical',
        affected_systems: 'Compound V3, Aave, Chainlink Oracle, Uniswap V3',
        attack_vectors: 'Flash Loan + Oracle Manipulation + Price Impact',
        client_name: 'compound-security-team',
        contact_info: 'security@compound.finance',
        evidence_urls: 'flash-loan-attack-evidence.pdf'
      }
    ];

    return await this.api.createIncidentReport(scenarios[0]);
  }

  // Scenario 2: Cross-Chain Bridge Attack
  async createBridgeAttackScenario() {
    console.log('🌉 Creating Bridge Attack Scenario...');
    
    const scenario = {
      title: 'Wormhole V2 Signature Verification Bypass - $325M',
      description: 'Attackers exploited signature verification vulnerability in Wormhole guardian system. Forged guardian signatures allowed minting of 120,000 wETH on Ethereum without proper backing on Solana. Used sophisticated cryptographic attack on secp256k1 signatures.',
      severity: 'critical',
      affected_systems: 'Wormhole Bridge, Ethereum, Solana, Guardian Network',
      attack_vectors: 'Signature Forging + Cross-Chain Validation Bypass',
      client_name: 'wormhole-core-team',
      contact_info: 'security@wormhole.com',
      evidence_urls: 'wormhole-exploit-technical-analysis.pdf'
    };

    return await this.api.createIncidentReport(scenario);
  }

  // Scenario 3: DeFi Protocol Bug
  async createDeFiProtocolScenario() {
    console.log('⚡ Creating DeFi Protocol Bug Scenario...');
    
    const scenario = {
      title: 'Curve Finance Vyper Compiler Bug - $52M',
      description: 'Critical reentrancy vulnerability in Vyper compiler versions 0.2.15-0.3.0 affected multiple Curve Finance pools. Attackers exploited malfunctioning reentrancy locks to drain liquidity from affected pools through repeated add_liquidity/remove_liquidity calls.',
      severity: 'critical',
      affected_systems: 'Curve Finance, Vyper Compiler, Multiple LP Pools',
      attack_vectors: 'Reentrancy + Compiler Bug Exploitation',
      client_name: 'curve-finance-dao',
      contact_info: 'security@curve.fi',
      evidence_urls: 'vyper-reentrancy-exploit.pdf'
    };

    return await this.api.createIncidentReport(scenario);
  }

  // Scenario 4: NFT Marketplace Exploit
  async createNFTMarketplaceScenario() {
    console.log('🖼️ Creating NFT Marketplace Scenario...');
    
    const scenario = {
      title: 'OpenSea Seaport Order Validation Bug - $1.8M',
      description: 'Bug in Seaport protocol order validation allowed attackers to fulfill partially filled orders at stale prices. Exploited during high-volume trading periods when NFT prices dropped significantly from order creation time.',
      severity: 'high',
      affected_systems: 'OpenSea, Seaport Protocol, NFT Collections',
      attack_vectors: 'Order Book Manipulation + Price Staleness',
      client_name: 'opensea-security',
      contact_info: 'security@opensea.io',
      evidence_urls: 'seaport-order-validation-bug.pdf'
    };

    return await this.api.createIncidentReport(scenario);
  }

  // Scenario 5: Layer 2 Network Issue
  async createLayer2Scenario() {
    console.log('🔗 Creating Layer 2 Network Issue...');
    
    const scenario = {
      title: 'Arbitrum Sequencer Downtime - Service Disruption',
      description: 'Arbitrum One sequencer experienced 78-minute downtime due to software bug during validator set update. Users unable to submit transactions, forced to use expensive L1 fallback. Several DeFi protocols affected with liquidation delays.',
      severity: 'high',
      affected_systems: 'Arbitrum One, Sequencer Network, DeFi Protocols',
      attack_vectors: 'Infrastructure Failure + Service Disruption',
      client_name: 'offchain-labs',
      contact_info: 'support@offchainlabs.com',
      evidence_urls: 'arbitrum-sequencer-incident-report.pdf'
    };

    return await this.api.createIncidentReport(scenario);
  }

  // Scenario 6: Phishing/Social Engineering
  async createPhishingScenario() {
    console.log('🎣 Creating Phishing Attack Scenario...');
    
    const scenario = {
      title: 'Sophisticated Wallet Drainer Campaign - $2.3M',
      description: 'Large-scale phishing campaign targeting MetaMask and hardware wallet users through fake DeFi interfaces. Malicious smart contracts used permit() signatures and gasless transactions to drain wallets. Over 1,200 victims across 30+ fake protocols.',
      severity: 'high',
      affected_systems: 'Multiple Wallets, Fake DeFi Sites, Social Media',
      attack_vectors: 'Social Engineering + Permit Signature Abuse',
      client_name: 'metamask-security',
      contact_info: 'security@metamask.io',
      evidence_urls: 'wallet-drainer-campaign-analysis.pdf'
    };

    return await this.api.createIncidentReport(scenario);
  }

  // Run all demo scenarios
  async runAllScenarios() {
    console.log('🚀 Creating Complete Demo Dataset...\n');
    
    const scenarios = [
      () => this.createFlashLoanScenario(),
      () => this.createBridgeAttackScenario(), 
      () => this.createDeFiProtocolScenario(),
      () => this.createNFTMarketplaceScenario(),
      () => this.createLayer2Scenario(),
      () => this.createPhishingScenario()
    ];

    const results = [];
    
    for (let i = 0; i < scenarios.length; i++) {
      try {
        const result = await scenarios[i]();
        results.push(result);
        console.log(`✅ Scenario ${i + 1} completed\n`);
        
        // Small delay between scenarios
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Scenario ${i + 1} failed:`, error.message);
      }
    }

    console.log(`\n🎯 Demo Complete! Created ${results.length} realistic security incidents`);
    return results;
  }

  // Create medium-priority incidents
  async createMediumPriorityBatch() {
    console.log('📊 Creating Medium Priority Incident Batch...');

    const mediumIncidents = [
      {
        title: 'Uniswap V3 MEV Sandwich Attack Wave',
        description: 'Coordinated MEV bot network extracting value through sandwich attacks on large Uniswap V3 trades. Estimated $340K extracted over 24 hours from retail traders.',
        severity: 'medium',
        affected_systems: 'Uniswap V3, MEV-Boost, Flashbots',
        attack_vectors: 'MEV Extraction + Sandwich Trading',
      },
      {
        title: 'Chainlink Oracle Deviation Alert',
        description: 'USDC/USD price feed showing 0.5% deviation from market rates for 2 hours. Multiple lending protocols experienced minor liquidation calculation errors.',
        severity: 'medium',
        affected_systems: 'Chainlink, Multiple DeFi Protocols',
        attack_vectors: 'Oracle Price Deviation',
      },
      {
        title: 'Polygon Network Congestion Event',
        description: 'High network congestion causing transaction delays up to 15 minutes. Gas prices spiked 10x during peak trading hours.',
        severity: 'medium',
        affected_systems: 'Polygon Network, DeFi dApps',
        attack_vectors: 'Network Congestion + High Gas',
      }
    ];

    const results = [];
    for (const incident of mediumIncidents) {
      const fullIncident = {
        ...incident,
        client_name: `incident-reporter-${Date.now()}`,
        contact_info: `security@protocol-${Math.floor(Math.random() * 1000)}.io`,
        evidence_urls: `incident-evidence-${Date.now()}.pdf`
      };
      
      const result = await this.api.createIncidentReport(fullIncident);
      results.push(result);
    }

    console.log(`✅ Created ${results.length} medium priority incidents`);
    return results;
  }
}

// CLI Usage
async function main() {
  const demo = new DemoScenarios();
  const args = process.argv.slice(2);
  const scenario = args[0];

  try {
    switch (scenario) {
      case 'flash-loan':
        await demo.createFlashLoanScenario();
        break;
      case 'bridge':
        await demo.createBridgeAttackScenario();
        break;
      case 'defi':
        await demo.createDeFiProtocolScenario();
        break;
      case 'nft':
        await demo.createNFTMarketplaceScenario();
        break;
      case 'layer2':
        await demo.createLayer2Scenario();
        break;
      case 'phishing':
        await demo.createPhishingScenario();
        break;
      case 'medium':
        await demo.createMediumPriorityBatch();
        break;
      case 'all':
      default:
        await demo.runAllScenarios();
        await demo.createMediumPriorityBatch();
        break;
    }
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DemoScenarios };
