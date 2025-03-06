import axios from 'axios';
import env from '../config/env';

class YapilyService {
  private baseUrl: string;
  private auth: string;

  constructor() {
    this.baseUrl = env.YAPILY_API_URL;
    this.auth = Buffer.from(
      `${env.YAPILY_CLIENT_ID}:${env.YAPILY_CLIENT_SECRET}`
    ).toString('base64');
  }

  private get headers() {
    return {
      Authorization: `Basic ${this.auth}`,
      'Content-Type': 'application/json',
    };
  }

  async getInstitutions() {
    try {
      const response = await axios.get(`${this.baseUrl}/institutions`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createConsent(institutionId: string, userId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/account-auth-requests`,
        {
          applicationUserId: userId,
          institutionId,
          callback: env.YAPILY_CALLBACK_URL
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAccounts(consentToken: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts`, {
        headers: {
          ...this.headers,
          'Consent': consentToken,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransactions(accountId: string, consentToken: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/accounts/${accountId}/transactions`,
        {
          headers: {
            ...this.headers,
            'Consent': consentToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return new Error(
        `Yapily API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }
    return error;
  }
}

export default new YapilyService(); 