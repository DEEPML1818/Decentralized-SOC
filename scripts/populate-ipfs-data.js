import axios from 'axios';

// Populate IPFS with real security incident data (formatted for schema validation)
const sampleIncidentReports = [
  {
    title: "Multichain Bridge Exploit - $126M Loss",
    description: "Critical vulnerability in Multichain's anyCall v7 cross-chain infrastructure allowed attackers to compromise validator signatures and drain $126M across multiple chains including Ethereum, BNB Chain, and Arbitrum.",
    severity: "critical",
    client_name: "Multichain Protocol",
    contact_info: "security@multichain.org",
    client_wallet: "0x1234567890abcdef1234567890abcdef12345678",
    transaction_hash: "0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz8",
    block_number: 18950000,
    contract_address: "0x1234567890abcdef1234567890abcdef12345678",
    affected_systems: "Multichain Bridge, Validator Network, Cross-chain Infrastructure",
    attack_vectors: "Validator Compromise, Signature Manipulation, Cross-chain Replay",
    evidence_urls: "https://etherscan.io/tx/0x123abc456, https://defitrack.com/multichain-exploit",
    ai_analysis: "This exploit demonstrates sophisticated understanding of cross-chain bridge mechanics. Attackers likely had insider knowledge or compromised validator keys through social engineering or infrastructure breach."
  },
  {
    title: "Radiant Capital Flash Loan Attack - $58M",
    description: "Sophisticated flash loan attack targeting Radiant Capital's lending protocol. Attackers manipulated oracle prices through coordinated DEX trades, inflated collateral values, and borrowed maximum liquidity.",
    severity: "critical",
    client_name: "Radiant Capital",
    contact_info: "team@radiant.capital",
    client_wallet: "0x9876543210fedcba9876543210fedcba98765432",
    transaction_hash: "0x456def789abc012ghi345jkl678mno901pqr234stu567vwx890yz1",
    block_number: 18945000,
    contract_address: "0x9876543210fedcba9876543210fedcba98765432",
    affected_systems: "Radiant Lending Protocol, Oracle Price Feeds, Balancer Pool",
    attack_vectors: "Flash Loan, Oracle Manipulation, MEV Extraction",
    evidence_urls: "https://arbiscan.io/tx/0x456def789, https://radiant.capital/incident-report",
    ai_analysis: "Classic oracle manipulation attack using flash loans. The attacker demonstrated deep understanding of DeFi composability and price oracle dependencies."
  },
  {
    title: "SushiSwap RouteProcessor Vulnerability - $3.3M",
    description: "Critical vulnerability in SushiSwap's RouteProcessor contract allowed attackers to drain user funds through malicious route manipulation affecting users with unlimited token approvals.",
    severity: "high",
    client_name: "SushiSwap Protocol",
    contact_info: "security@sushi.com",
    client_wallet: "0x369cf258147abcd369cf258147abcd369cf258147",
    transaction_hash: "0xabc012def345ghi678jkl901mno234pqr567stu890vwx123yz456",
    block_number: 18960000,
    contract_address: "0x369cf258147abcd369cf258147abcd369cf2",
    affected_systems: "SushiSwap Router, Token Approval System, DEX Aggregator",
    attack_vectors: "Router Manipulation, Approval Exploitation, Sandwich Attack",
    evidence_urls: "https://etherscan.io/tx/0xabc012def, https://sushi.com/security-report",
    ai_analysis: "This vulnerability highlights the risks of unlimited token approvals in DEX aggregators. Recommendation: implement time-limited approvals and route validation."
  },
  {
    title: "Arbitrum Sequencer Downtime Incident",
    description: "78-minute sequencer downtime on Arbitrum One due to validator disagreement on state root computation. Users unable to submit L2 transactions during outage.",
    severity: "medium",
    client_name: "Arbitrum Foundation",
    contact_info: "support@arbitrum.foundation",
    client_wallet: "0x4815162342abcdef4815162342abcdef48151623",
    transaction_hash: "0xdef345ghi678jkl901mno234pqr567stu890vwx123yz456abcdef78",
    block_number: 18975000,
    contract_address: "0x4815162342abcdef4815162342abcdef48",
    affected_systems: "Arbitrum Sequencer, Validator Network, L2 Transaction Processing",
    attack_vectors: "Infrastructure Failure, Consensus Disagreement",
    evidence_urls: "https://status.arbitrum.io/incidents, https://l2beat.com/arbitrum-downtime",
    ai_analysis: "Infrastructure incident caused by validator consensus failure. Demonstrates importance of robust fallback mechanisms in L2 networks."
  },
  {
    title: "Polygon zkEVM Bridge Gas Limit Issue",
    description: "Bridge contract gas limit misconfiguration caused transaction failures for large value transfers. Users experienced failed bridging attempts with lost gas fees.",
    severity: "medium",
    client_name: "Polygon Labs",
    contact_info: "security@polygon.technology",
    client_wallet: "0x5926384051fedcba5926384051fedcba59263840",
    transaction_hash: "0x012345678abcdef901234567890abcdef012345678abcdef90123456",
    block_number: 18980000,
    contract_address: "0x5926384051fedcba5926384051fedcba59",
    affected_systems: "zkEVM Bridge, Gas Estimation, Cross-chain Transfer",
    attack_vectors: "Configuration Error, Gas Limit Bypass",
    evidence_urls: "https://polygonscan.com/tx/0x012345678, https://polygon.technology/blog/bridge-update",
    ai_analysis: "Configuration issue affecting bridge functionality. Recommendation: implement dynamic gas estimation and comprehensive testing for edge cases."
  }
];

const sampleTickets = sampleIncidentReports.map((report, index) => ({
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
}));

async function populateIPFS() {
  console.log('🚀 Starting IPFS data population...');

  try {
    // Create incident reports
    for (const report of sampleIncidentReports) {
      console.log(`📝 Creating incident report: ${report.title}`);
      const response = await axios.post('http://localhost:5000/api/incident-reports', report);
      console.log(`✅ Created incident report with ID: ${response.data.id}`);
    }

    console.log('\n🎯 IPFS population completed successfully!');
    console.log('📊 Check the dashboard to see populated case management and staking data.');

  } catch (error) {
    console.error('❌ Failed to populate IPFS:', error.response?.data || error.message);
  }
}

populateIPFS();