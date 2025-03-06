# Yapily Integration Project Requirements

> **Note**: This document is a development resource used during the implementation phase of the project. It outlines the original requirements and specifications that guided the development process.

## 1. Overview & Estimated Time
This exercise is designed to showcase familiarity with Node.js, external API integrations, and basic DevOps, without being overwhelming.

## 2. Goal of the Exercise
**Objective**: Create a small Node.js backend application that integrates with the Yapily (free developer account) sandbox to:

- Obtain valid API credentials from a self-registered Yapily developer account.
- Allow a test user to connect a sandbox bank institution.
- Fetch transaction data (and account details if needed) from that institution via Yapily's Open Banking APIs.
- Store the retrieved data in a local database (PostgreSQL, Mongo, etc.).
- Expose simple endpoints demonstrating how to:
  - List linked accounts.
  - Fetch/Return the stored transactions in your database.

Document your solution (in a short readme or similar) explaining how to run/test it locally and any design decisions you made.

## 3. Deliverables

### Node.js Project
- A minimal, functioning backend (NestJS, Express, etc.) that compiles/runs on our machines.
- We should be able to install dependencies (npm install or yarn install) and start the server (npm start).

### Environment Configuration
- An .env.example showing necessary variables (e.g. YAPILY_CLIENT_ID, YAPILY_CLIENT_SECRET, DB credentials).
- Clear instructions in your readme about how to populate these with actual values.

### Endpoints
- **Yapily Auth & Account Linking**: An API flow to initiate linking with a sandbox institution.
- **Fetch Transactions**: e.g., POST /transactions/fetch that retrieves transactions from Yapily and stores them in your local database.
- **List Accounts**: e.g., GET /accounts – shows connected accounts (or a single test account if multi-user logic is beyond scope).
- **List Transactions**: e.g., GET /accounts/:id/transactions – returns transaction data stored locally for a given account.

### Database/Storage
- You must store basic transaction fields (date, amount, description, etc.).
- The database can be whichever you prefer, as long as it's straightforward to run locally.

### Minimal Testing
- At least a couple of unit or integration tests to demonstrate success/error handling for Yapily API calls.
- More coverage is welcome if you have the time.

### Documentation
- A short readme or doc explaining:
  - Your overall solution structure.
  - How to run it locally.
  - How to test it (e.g. sample cURL commands, Postman requests, or an automated test suite).
  - List any design decisions or constraints you ran into (e.g., how you handle token refresh).

### Error & Edge Case Handling
- Basic handling for invalid tokens, invalid institution IDs, or empty transaction data.
- We don't need bulletproof production readiness, but do show you've considered common failures.

## 4. Guidance and Constraints
- **Simplicity vs. Completeness**: We're not expecting enterprise-scale architecture. But please demonstrate a solid grasp of best practices (environment variables for secrets, not hard-coding tokens, etc.).
- **Focus on Clarity**: Well-organized code with straightforward naming and a consistent structure is more important than implementing every possible Yapily feature.
- **Time & Effort**: Aim for a polished, working demonstration of the main flow (link institution → fetch data → store → retrieve). Avoid over-engineering.
- **Testing**: Show some proof of testing beyond "it runs." Even a minimal test suite is valuable.

## 5. Additional Notes

### Yapily Account Registration
- You must sign up for a free developer account on Yapily's website.
- We won't provide credentials. Part of the exercise is to see how you handle reading and following Yapily's documentation.

### Sandbox Institutions
- Once registered, you'll have access to Yapily's sandbox environment. Connect to any available sandbox bank.
- Let us know in your readme which test institution you used and how we can replicate your steps.

### Single vs. Multiple Users
- You only need a single test user for this scenario. If you'd like to show advanced user handling or authentication, feel free, but it's not mandatory.

### Frontend Integration
- Optional. You do not need to build a frontend. A Postman collection or cURL instructions suffice to demonstrate your endpoints.

### Evaluation Criteria
- **Architecture**: Code organization, layering (services, controllers), and clarity.
- **Coding Style**: Readable, maintainable, and idiomatic Node.js.
- **Correctness**: Does it properly handle the Yapily flow to get transactions and store them?
- **Error Handling**: Reasonable handling of API failures or missing data.
- **Documentation**: Ease of setup and usage for us, the reviewers.

### Time Frame
- Please don't work more than necessary—focus on delivering a concise yet functional application.