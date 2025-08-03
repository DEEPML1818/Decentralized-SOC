# dSOC - Decentralized Security Operations Center

## Project Overview
A decentralized Security Operations Center (SOC) platform built on IOTA blockchain technology. The application provides role-based access control for security analysts, clients, and certifiers to manage security incidents and tickets through a decentralized workflow.

## Architecture
- **Frontend**: React + TypeScript + Vite + wouter for routing
- **Backend**: Express.js with TypeScript
- **Blockchain**: IOTA integration with dApp Kit
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for data fetching
- **Styling**: Dark theme with security-focused design

## Key Features
- IOTA wallet integration for authentication
- Role-based access (client, analyst, certifier)
- Security ticket management system
- Staking and rewards mechanism
- Document notarization on IOTA
- Real-time dashboard with role-specific views

## Recent Changes
- **2025-08-03**: Successfully completed migration from Replit Agent to Replit environment
- **2025-08-03**: Integrated EVM contracts with deployed addresses on Scroll Sepolia testnet
- **2025-08-03**: Updated contract service with complete ABIs for CLT Reward, Staking Pool, and SOC Service
- **2025-08-03**: Fixed EVM staking and incident reporting functionality
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