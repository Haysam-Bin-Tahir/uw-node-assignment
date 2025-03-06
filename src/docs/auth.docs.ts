export const AuthDocs = {
  register: {
    summary: 'Register a new user',
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {
                type: 'string',
                format: 'email'
              },
              password: {
                type: 'string',
                minLength: 6
              }
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    }
  }
}; 