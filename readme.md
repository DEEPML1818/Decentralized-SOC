# dSOC - Decentralized Security Operations Center

## Overview
The dSOC project is a Decentralized Security Operations Center platform built on IOTA and EVM-compatible blockchain technologies. Its core purpose is to provide a robust, decentralized workflow for managing security incidents and tickets with role-based access for security analysts, clients, and certifiers. The platform aims to leverage blockchain for immutable data storage, transparent incident management, and automated reward distribution, addressing the need for enhanced security and trust in incident response. Key capabilities include IOTA and MetaMask wallet integration, decentralized data storage via IPFS, smart contract interactions for ticket creation and validation, and an AI-powered analysis component for incident reporting and vulnerability assessment. The vision is to offer a comprehensive, decentralized solution for enterprise security operations.

## User Preferences
- Focus on security and blockchain integration
- Maintain professional, technical approach
- Dark theme preferred for security application aesthetics

## System Architecture
The dSOC platform is built with a clear separation of concerns:
- **Frontend**: Developed with React, TypeScript, Vite, and `wouter` for routing, providing a responsive single-page application experience. The UI leverages `shadcn/ui` components styled with Tailwind CSS, primarily in a dark theme to align with security application aesthetics.
- **Backend**: An Express.js server developed with TypeScript, handling API routes and serving as an intermediary for complex operations.
- **Blockchain Integration**: Supports dual blockchain interaction, primarily IOTA with dApp Kit and EVM-compatible chains (specifically Scroll Sepolia) using MetaMask. This allows for IOTA wallet authentication, smart contract interactions, and blockchain-based workflow management.
- **Decentralized Storage**: Pinata IPFS is used for immutable, decentralized storage of all security incident reports, cases, and responses, ensuring data integrity and availability. An in-memory fallback is available.
- **State Management**: TanStack Query is utilized for efficient data fetching and caching, ensuring a performant user experience.
- **Core Functionality**:
    - **Role-Based Portals**: Dedicated portals for Clients (incident submission), Analysts (case viewing, assignment, analysis reports), and Certifiers (report review, case validation).
    - **Incident Management Workflow**: Clients create tickets via smart contracts, storing details on IPFS. Analysts join security pools, analyze cases, and submit reports. Certifiers review and validate cases, triggering blockchain transactions and reward distribution.
    - **Smart Contracts**: Custom smart contracts handle ticket creation, analyst/certifier assignments, case validation, and automated CLT token reward distribution.
    - **Token Faucet**: A CLT token faucet is integrated for testing and rewarding participants.
    - **AI Integration**: AI-powered analysis for vulnerability assessment is integrated into the Analyst Dashboard, using secure backend API endpoints.
- **Design Principles**: Emphasizes a clean, minimal interface focusing on core functionality, dark theme, and security-focused design elements including pulse animations.

## External Dependencies
- **IOTA Blockchain**: For decentralized identity, authentication, and specific blockchain interactions.
- **MetaMask**: EVM wallet integration for interacting with Ethereum-compatible smart contracts on networks like Scroll Sepolia.
- **Pinata IPFS**: Used for decentralized, immutable storage of all application data, including security incident reports and case metadata.
- **Express.js**: Backend web application framework.
- **React**: Frontend JavaScript library for building user interfaces.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Component library for React.
- **TanStack Query**: Data fetching library.
