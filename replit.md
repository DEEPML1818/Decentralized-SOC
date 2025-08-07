# dSOC - Decentralized Security Operations Center

## Project Overview
A decentralized Security Operations Center (SOC) platform built on IOTA blockchain technology. The application provides role-based access control for security analysts, clients, and certifiers to manage security incidents and tickets through a decentralized workflow.

## Architecture
- **Frontend**: React + TypeScript + Vite + wouter for routing
- **Backend**: Express.js with TypeScript
- **Blockchain**: IOTA integration with dApp Kit
- **Storage**: Pinata IPFS for decentralized data storage with in-memory fallback
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for data fetching
- **Styling**: Dark theme with security-focused design

## Key Features
- IOTA wallet integration for authentication
- MetaMask EVM wallet integration
- Dual blockchain support (IOTA and Scroll Sepolia)
- CLT token faucet for testing
- dApp interface for smart contract interactions
- Clean, minimal interface focused on core functionality

## Recent Changes
- **2025-08-06**: Consolidated EVM functionality into dApp page as requested - removed separate EVM page
- **2025-08-06**: dApp page now contains the full dSOC dashboard with wallet connection flow
- **2025-08-06**: Updated navigation to only show Home, Faucet, and dApp buttons 
- **2025-08-06**: Changed dApp button color to orange to match EVM theme
- **2025-08-06**: Simplified to three core pages: Home, Faucet, and dApp (which includes all EVM functionality)
- **2025-08-06**: Simplified application to only include Home and Faucet pages as requested
- **2025-08-06**: Created comprehensive HomePage with platform overview and connection status
- **2025-08-06**: Removed all complex features (pools, staking, rewards, guides) to focus on core functionality
- **2025-08-07**: Successfully completed migration from Replit Agent to standard Replit environment
- **2025-08-07**: Fixed runtime error in CaseDetailModal with undefined priority property
- **2025-08-07**: Resolved LSP diagnostic for missing ethBalance property in WalletProvider
- **2025-08-07**: Installed missing tsx dependency and verified full application functionality
- **2025-08-06**: Fixed MetaMask wallet connection by adding missing connectWallet method to EVMContractService
- **2025-08-06**: Added proper TypeScript support for window.ethereum interface
- **2025-08-06**: Enhanced EVM wallet connection with automatic network switching to Scroll Sepolia
- **2025-08-06**: Resolved WalletProvider context conflicts between IOTA dApp Kit and custom provider
- **2025-08-06**: Updated to latest contract architecture - CLT Reward (0xD0fD6bD7a7b1f5d7B3fCCD99e72f1013a3ebD097) and SOCService (0x6e310Be2F4D057bAd8435E30a0d45bCD49c9018E)
- **2025-08-06**: Implemented simplified ticket creation workflow - createTicket(title) with optional analyst assignment via setAnalyst()
- **2025-08-06**: Enhanced EVMIncidentReport with automatic analyst assignment after ticket creation
- **2025-08-06**: Updated contract service to support new simplified SOCService ABI with proper event parsing
- **2025-08-06**: Added validateTicket functionality for analysts to claim rewards and complete cases
- **2025-08-06**: SOCService now automatically creates individual staking pools for each ticket with IPFS metadata storage
- **2025-08-06**: Enhanced staking pools display with pool-specific metadata, descriptions, and IPFS integration
- **2025-08-06**: Added comprehensive CLT reward management system with automatic minting for analysts (50 CLT), certifiers (30 CLT), and stakers (5% of stake)
- **2025-08-06**: Implemented comprehensive CLT reward minting system for analysts (50 CLT), certifiers (30 CLT), and stakers (5% of stake)
- **2025-08-06**: Created CLTRewardManager component with reward history, statistics, and batch minting capabilities
- **2025-08-06**: Added /rewards page with dedicated reward management interface
- **2025-08-06**: Enhanced server API with reward management endpoints (/api/rewards/mint, /history, /stats)
- **2025-08-06**: Fixed MetaMask wallet connection by adding missing connectWallet method to EVMContractService
- **2025-08-06**: Added proper TypeScript support for window.ethereum interface
- **2025-08-06**: Enhanced EVM wallet connection with automatic network switching to Scroll Sepolia
- **2025-08-05**: Successfully migrated from Supabase to lightweight Pinata Direct API implementation
- **2025-08-05**: Pinata IPFS now serves as the complete decentralized database replacement
- **2025-08-05**: Implemented direct Pinata API calls (removed heavy pinata-web3 SDK for lighter app)
- **2025-08-05**: All incident reports, cases, and responses permanently stored on IPFS with immutable hashes
- **2025-08-05**: Added comprehensive metadata tracking with detailed console logging for IPFS uploads
- **2025-08-05**: Successfully tested incident report creation with IPFS storage and case linking
- **2025-08-05**: Integrated incident reports with case management system for real-time tracking
- **2025-08-05**: Removed all fake/mock data and replaced with real blockchain data sources  
- **2025-08-05**: Consolidated staking components into UnifiedStakingDashboard with real-time updates
- **2025-08-05**: Added real-time case management with /api/tickets endpoint refreshing every 5 seconds
- **2025-08-03**: Integrated EVM contracts with deployed addresses on Scroll Sepolia testnet
- **2025-08-03**: Updated contract service with complete ABIs for CLT Reward, Staking Pool, and SOC Service
- **2025-01-20**: Successfully migrated project from Replit Agent to Replit environment
- **2025-01-20**: Fixed AI functionality by migrating from hardcoded API keys to secure backend endpoints
- **2025-01-20**: Enhanced AI chat interface with improved scrolling for long responses
- **2025-01-20**: Made AI Assistant modal draggable for better user experience
- **2025-01-20**: Created AI-powered incident reporting system integrated with dSOC workflow
- Implemented secure API routes for AI chat, contract auditing, security news, and vulnerability analysis
- Updated frontend AI services to use backend API endpoints instead of direct Google Gemini calls
- Added comprehensive incident reporting form with AI analysis capabilities
- Connected incident reports to analyst→certifier workflow as requested
- Enhanced chat container with max-h-[600px] and individual message scrolling
- Fixed duplicate function declarations in TicketForm and TicketList components
- Resolved Buffer compatibility issues for browser environment using polyfill
- Updated contract integration to match Move smart contract signatures exactly
- Fixed TypeScript compilation errors and syntax issues
- Added QueryClientProvider to App.tsx for proper TanStack Query setup
- Synchronized frontend contract calls with provided Move smart contract implementation

## User Preferences
- Focus on security and blockchain integration
- Maintain professional, technical approach
- Dark theme preferred for security application aesthetics

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── Header.tsx     # Navigation header
│   │   │   ├── TicketForm.tsx # Ticket creation
│   │   │   └── TicketList.tsx # Ticket management
│   │   ├── pages/
│   │   │   ├── Index.tsx      # Main landing page
│   │   │   └── NotFound.tsx   # 404 page
│   │   └── lib/
│   │       ├── contract.ts    # IOTA smart contract integration
│   │       └── utils.ts       # Utility functions
├── server/
│   ├── index.ts              # Express server entry
│   ├── routes.ts             # API routes
│   └── storage.ts            # Data storage interface
└── shared/
    └── schema.ts             # Shared type definitions
```

## Development Notes
- Using Replit's full-stack template architecture
- IOTA integration requires testnet configuration
- Security-focused design with pulse animations for critical elements
- Comprehensive role-based permission system