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

## Setup

1. Clone the repository:

```bash
git

# Project Documentation

## Folder Structure

This document outlines the structure of the project and provides a brief description of each directory and file

```
project-root/
├── dist/               # Compiled output of TypeScript code
├── node_modules/       # Installed npm packages
├── src/                # Source code for the application
│   ├── config/         # Configuration files for env configuration, db setup and other setups
│   ├── controllers/    # Controller files for handling requests
│   ├── interfaces/     # TypeScript interfaces and types used throughout the project.
│   ├── middlewares/    # Middleware functions
│   ├── models/         # Mongoose models (if using MongoDB)
│   ├── routes/         # Route definitions for API endpoints
│   ├── utils/          # Utility functions and helpers
│   ├── app.ts          # Express application and middleware setup
│   ├── server.ts       # Entry point of the application
│   └── env.ts          # Environment variable configurations
├── .gitignore          # Specifies intentionally untracked files to ignore
├── .env                # Environment variables for the application
├── package.json        # npm package configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Description of Key Directories and Files

- **`src/`**: This directory contains the main source code for the application.

  - **`config/`**: Holds configuration files for setting up environment variables, db setup and other settings.
  - **`controllers/`**: Contains the logic for handling incoming requests and sending responses.
  - **`interfaces/`**: Defines TypeScript interfaces and types used throughout the project.
  - **`middleware/`**: Contains custom middleware functions that can process requests before they reach the route handlers.
  - **`models/`**: Defines Mongoose models representing the data structures used in the application.
  - **`routes/`**: Contains route definitions, mapping HTTP requests to controller methods.
  - **`utils/`**: Holds utility functions that can be used across the application.
  - **`app.ts`**: Initializes the Express application and sets up middleware.
  - **`server.ts`**: The main entry point for starting the server.

- **`.env`**: A file that contains environment variables used by the application.
- **`.env.example`**: An example file showing the required environment variables.
- **`.gitignore`**: Specifies files and directories to ignore in Git.
- **`package.json`**: Project metadata and dependencies.
- **`tsconfig.json`**: TypeScript configuration.

## Conclusion

This folder structure is designed to keep the project organized and maintainable. Following these conventions will help in scaling the application and collaborating effectively with other developers.
