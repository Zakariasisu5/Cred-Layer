import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CredLayer API',
      version: '0.2.0',
      description: 'Reputation API for Solana wallets.'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local server'
      }
    ],
    tags: [
      { name: 'Health', description: 'Service health and metadata' },
      { name: 'Reputation', description: 'Wallet reputation endpoints' },
      { name: 'Analytics', description: 'Wallet analytics endpoints' },
      { name: 'Leaderboard', description: 'Ranking endpoints' },
      { name: 'History', description: 'Reputation history endpoints' }
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          responses: {
            '200': {
              description: 'Service is running'
            }
          }
        }
      },
      '/api/reputation/{wallet}': {
        get: {
          tags: ['Reputation'],
          summary: 'Get wallet reputation score',
          parameters: [
            {
              name: 'wallet',
              in: 'path',
              required: true,
              schema: { type: 'string', minLength: 32, maxLength: 44 },
              description: 'Solana wallet address'
            }
          ],
          responses: {
            '200': {
              description: 'Reputation calculated successfully'
            },
            '400': {
              description: 'Invalid wallet address'
            },
            '500': {
              description: 'Failed to fetch wallet data'
            }
          }
        }
      },
      '/api/analytics/{wallet}': {
        get: {
          tags: ['Analytics'],
          summary: 'Get wallet analytics',
          parameters: [
            {
              name: 'wallet',
              in: 'path',
              required: true,
              schema: { type: 'string', minLength: 32, maxLength: 44 },
              description: 'Solana wallet address'
            }
          ],
          responses: {
            '200': {
              description: 'Analytics fetched successfully'
            },
            '500': {
              description: 'Failed to fetch analytics'
            }
          }
        }
      },
      '/api/reputation/history/{wallet}': {
        get: {
          tags: ['History'],
          summary: 'Get wallet reputation history',
          parameters: [
            {
              name: 'wallet',
              in: 'path',
              required: true,
              schema: { type: 'string', minLength: 32, maxLength: 44 },
              description: 'Solana wallet address'
            }
          ],
          responses: {
            '200': {
              description: 'History fetched successfully'
            }
          }
        }
      },
      '/api/leaderboard': {
        get: {
          tags: ['Leaderboard'],
          summary: 'Get leaderboard',
          responses: {
            '200': {
              description: 'Leaderboard fetched successfully'
            }
          }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
