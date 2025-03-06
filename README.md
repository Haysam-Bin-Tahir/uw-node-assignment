# Yapily Integration Project

This project implements a Node.js backend application that integrates with Yapily's Open Banking APIs to fetch and store bank account and transaction data.

## Features

- Connect to sandbox bank institutions via Yapily
- Fetch and store account information
- Retrieve and store transaction data
- RESTful API endpoints for data access
- MongoDB integration for data persistence
- TypeScript implementation
- Comprehensive error handling
- Unit tests

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Yapily Developer Account

## Setup & Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```
4. Set up your environment variables in `.env`

## Running the Application

Development mode:
```bash
npm run dev
```

## Testing Guide

### Unit Tests

Run unit tests:
```bash
npm test
```

With coverage:
```bash
npm run test:coverage
```

### End-to-End Testing Overview

For a comprehensive walkthrough of testing the entire application flow, watch this video guide:

[![End-to-End Testing Overview](https://i.imgur.com/STWZMH8_d.webp?maxwidth=1520&fidelity=grand)](https://www.loom.com/share/b4ef69150e4847d583fc4eda97904475?sid=78ff8ca8-1666-4cfc-b584-3724dc9fa3fa)


# Project Documentation

## Folder Structure

This document outlines the structure of the project and provides a brief description of each directory and file

## Description of Key Directories and Files

- **`src/`**: This directory contains the main source code for the application.

  - **`config/`**: Holds configuration files for setting up environment variables, db setup and other settings.
  - **`controllers/`**: Contains the logic for handling incoming requests and sending responses.
  - **`docs/`**: API documentation and additional project documentation
  - **`interfaces/`**: Defines TypeScript interfaces and types used throughout the project.
  - **`middleware/`**: Contains custom middleware functions that can process requests before they reach the route handlers.
  - **`models/`**: Defines Mongoose models representing the data structures used in the application.
  - **`routes/`**: Contains route definitions, mapping HTTP requests to controller methods.
  - **`services/`**: Contains business logic and external service integrations
  - **`tests/`**: Contains all test files mirroring the src directory structure
  - **`app.ts`**: Initializes the Express application and sets up middleware.
  - **`server.ts`**: The main entry point for starting the server.

- **`.env`**: A file that contains environment variables used by the application.
- **`.env.example`**: An example file showing the required environment variables.
- **`.gitignore`**: Specifies files and directories to ignore in Git.
- **`jest.config.json`**: Configuration for Jest testing framework
- **`package.json`**: Project metadata and dependencies.
- **`README.md`**: Project documentation and setup instructions
- **`tsconfig.json`**: TypeScript configuration.

## Conclusion

This folder structure is designed to keep the project organized and maintainable. Following these conventions will help in scaling the application and collaborating effectively with other developers.

## API Documentation

Swagger documentation is available at `/api-docs` when running the server:
```
http://localhost:8080/api-docs
```

The documentation includes:
- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests

## Project Architecture & Design Decisions

### Architecture Highlights

- **Clean Architecture**: Layered approach with clear separation of concerns:
  - Routes → Controllers → Services → Models
  - Each layer has specific responsibilities:
    - Routes: Define API endpoints and handle request routing
    - Controllers: Handle HTTP requests/responses and basic validation
    - Services: Implement business logic and orchestrate operations
    - Models: Define data structure and handle database operations
  - Dependencies flow inward, with outer layers depending on inner layers
  - Each layer is testable in isolation

**Design Patterns Implemented**:
  - **Repository Pattern**: Abstracted data access through models and services
  - **Singleton Pattern**: For database connection and service instances
  - **Factory Pattern**: For creating error instances and response objects
  - **Strategy Pattern**: In authentication middleware for different auth methods
  - **Middleware Chain**: For request processing pipeline

Each pattern serves a specific purpose:
  - Repository Pattern isolates data layer complexity
  - Singleton ensures consistent service instances
  - Factory centralizes object creation logic
  - Strategy enables flexible authentication methods
  - Middleware Chain provides modular request processing

### Design Decisions

1. **Data Management**:
   - MongoDB for flexible schema evolution
   - Efficient batch processing with progress tracking
   - Indexed collections for optimized queries
   - Structured transaction synchronization

2. **Security**:
   - JWT-based authentication with refresh tokens
   - Environment variable validation at startup
   - Request validation middleware
   - Secure cookie handling

3. **Error Handling**:
   - Centralized error handling middleware
   - Custom error classes for different scenarios
   - Structured error responses
   - Comprehensive error logging

4. **API Integration**:
   - Yapily service abstraction
   - Automatic token refresh
   - Rate limiting
   - Retry mechanisms for transient failures

5. **Testing**:
   - Jest for unit testing
   - Mocking of external dependencies
   - Integration tests for critical paths
   - >\> 80% test coverage requirement

### Best Practices

- **Code Organization**:
  - Feature-based directory structure
  - Clear naming conventions
  - Single responsibility principle

- **Performance**:
  - Pagination for large datasets
  - Efficient database indexing
  - Batch processing for bulk operations
  - Caching where appropriate

- **Maintainability**:
  - Consistent code style (ESLint/Prettier)
  - Comprehensive documentation
  - Modular and reusable components
  - Clear dependency management

- **Monitoring & Debugging**:
  - Request logging
  - Transaction tracking
  - Performance metrics
  - Error tracking

This architecture ensures scalability, maintainability, and reliability while following industry best practices and standards.
