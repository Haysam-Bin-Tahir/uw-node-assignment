import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yapily Integration API',
      version: '1.0.0',
      description: 'API documentation for Yapily Integration service'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            accountType: { type: 'string' },
            accountNumber: { type: 'string' },
            balance: { type: 'number' },
            currency: { type: 'string' },
            institutionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            accountId: { type: 'string' },
            userId: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            type: { type: 'string' },
            category: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        SyncStatus: {
          type: 'object',
          properties: {
            accountId: { type: 'string' },
            userId: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed']
            },
            progress: { type: 'number' },
            total: { type: 'number' },
            error: { type: 'string' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // files containing annotations
};

export const swaggerSpec = swaggerJsdoc(options); 