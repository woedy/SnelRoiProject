# Product Overview

SnelROI is a full-stack banking simulation platform that demonstrates modern fintech workflows with proper ledger-based accounting.

## Core Components

- **Customer Banking UI**: Full-featured banking interface for end users
- **Admin Dashboard**: Administrative interface for transaction approval and user management  
- **Backend API**: Django-based banking system with ledger accounting

## Key Features

- **Ledger-Based Accounting**: All balances computed from postings, not incremented fields
- **Transaction Approval Workflow**: Deposits auto-post after delay; transfers/withdrawals require admin approval
- **Multi-Currency Support**: USD-based with extensible currency system
- **KYC/Tier Management**: Customer verification and tier-based features
- **Crypto Deposit Integration**: Cryptocurrency deposit workflow with proof upload
- **Real-time Updates**: WebSocket support for live transaction updates
- **Multi-language Support**: Internationalization ready

## Business Logic

- Deposits are created as PENDING and auto-posted after configurable delay
- Transfers and withdrawals require explicit admin approval via admin UI
- All financial operations are recorded as double-entry ledger postings
- Account balances are computed from ledger postings, ensuring accuracy
- Admin actions are fully audited and recorded