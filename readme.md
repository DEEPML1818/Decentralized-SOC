# dSOC - Decentralized Security Operations Center

https://vimeo.com/1102865182?share=copy  #video demo link 

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Features](#4-features)
5. [Technology Stack](#5-technology-stack)
6. [Architecture](#6-architecture)
7. [Smart Contracts (Move)](#7-smart-contracts-move)
8. [Database (Supabase)](#8-database-supabase)
9. [Installation & Setup](#9-installation--setup)
10. [Usage & Demo](#10-usage--demo)
11. [Challenges Faced](#11-challenges-faced)
12. [Lessons Learned](#12-lessons-learned)
13. [Future Enhancements](#13-future-enhancements)
14. [Contributing](#14-contributing)
15. [License](#15-license)

---

## 1. Project Overview

**dSOC** (Decentralized Security Operations Center) is a platform built on the IOTA blockchain to revolutionize cybersecurity incident management. It fosters a transparent, incentivized, and community-driven environment where clients report security incidents, and analysts and certifiers resolve them.

---

## 2. Problem Statement

Traditional SOCs have key drawbacks:

* **High Costs**
* **Lack of Transparency**
* **Single Point of Failure**
* **Inefficient Incentives**

dSOC solves these using decentralized tech and token economics.

---

## 3. Solution Overview

* **Roles**: Clients, Analysts, Certifiers, Observers
* **Incentives**: IOTA staking + CLT rewards
* **Transparency**: On-chain tracking via IOTA Tangle
* **Gasless UX**: Uses IOTA Gas Station

---

## 4. Features

* IOTA wallet integration (`@iota/dapp-kit`)
* Role-based dashboards
* Incident submission & evidence notarization
* Report submission and validation
* CLT staking & reward system
* Real-time dashboards
* AI-assisted analysis (Google Gemini API)
* Supabase integration for fast, enriched querying

---

## 5. Technology Stack

**Frontend**: React, Tailwind CSS, Wouter, Shadcn/ui, TanStack Query
**Backend**: Express.js (TypeScript)
**Blockchain**: IOTA L1 Testnet, Move, CLT, IOTA Identity & Notarization
**Database**: Supabase (PostgreSQL)

---

## 6. Architecture

### Layers:

* **Frontend**: Role dashboards, wallet integration, ticket management, staking, AI assistant
* **Smart Contracts**: Ticket and reward logic in Move
* **Supabase**: User metadata, ticket details, transaction logs

### Flow:

1. Connect wallet via `@iota/dapp-kit`
2. Choose a role
3. Interact with contracts (`contract.ts`)
4. Sync updates with Supabase (`supabase.ts`)

---

## 7. Smart Contracts (Move)

**Modules**:

* `dsoc::SOCService`: Manages tickets
* `dsoc::CLTReward`: Handles CLT minting, merging, splitting

### Key Functions:

* `create_ticket`
* `assign_analyst`
* `submit_report`
* `validate_ticket`
* `mint_clt`, `merge`, `split`

**Contract ID**: `0xbec69147e6d51ff32994389b52eb3ee10a7414d07801bb9d5aaa1ba1c6e6b345`

---

## 8. Database (Supabase)

**Tables**:

* `users`: Profile, wallet, role, balances
* `tickets`: Incident details, status, hashes, stake
* `transactions`: On-chain/off-chain logs
* `stake_tokens`, `clt_tokens`: Track economic participation

---

## 9. Installation & Setup

### Prerequisites:

* Node.js v18+
* npm/yarn
* IOTA wallet (e.g. Metamask with IOTA EVM Testnet)

### Setup:

```bash
git clone <repository-url>
cd dsoc-project
npm install # or yarn install
```

### .env Configuration:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Run App:

```bash
npm run dev # or yarn dev
```

---

## 10. Usage & Demo

* **Connect Wallet**
* **Select Role**: Modal to choose Client, Analyst, Certifier, Observer
* **Submit Ticket** (Client): Provide title, category, evidence hash, stake
* **Claim & Report** (Analyst): Assign, analyze, submit findings
* **Approve/Reject** (Certifier): Validate reports and trigger reward/stake flows
* **Rewards Dashboard**: View earned CLTs, staked IOTA, history

> Includes over 100 mock incidents for realistic testing.

---

## 11. Challenges Faced

* Move contract integration & object handling
* Learning curve for `@iota/dapp-kit`
* Syncing on-chain and off-chain data
* WebContainer/browser compatibility issues (e.g., Buffer polyfills)
* TypeScript module sharing across layers
* Debugging React component duplication

---

## 12. Lessons Learned

* Deep dive into IOTA & Move
* Importance of contract design for frontend compatibility
* Hybrid architecture benefits: Chain + DB
* Decentralization = transparency & resiliency
* Vite + React = ideal rapid dApp prototyping

---

## 13. Future Enhancements

* Mainnet deployment
* Enhanced AI threat intel & automation
* Mobile apps (iOS/Android)
* SIEM integrations
* Auto-response via smart contracts
* On-chain reputation system
* DAO-based governance
* Cross-chain support
* IPFS-based evidence storage

---

## 14. Contributing

Contributions welcome. Open issues or PRs to collaborate!

---

## 15. License

MIT License
