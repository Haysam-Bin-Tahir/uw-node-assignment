import YapilyService from '../services/yapily.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('YapilyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstitutions', () => {
    it('should successfully fetch institutions', async () => {
      const mockInstitutions = [
        { id: 'test-bank', name: 'Test Bank', fullName: 'Test Bank Ltd' }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockInstitutions });
      
      const result = await YapilyService.getInstitutions();
      expect(result).toEqual(mockInstitutions);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValueOnce({ 
        response: { 
          status: 500, 
          data: { message: errorMessage } 
        } 
      });

      await expect(YapilyService.getInstitutions()).rejects.toThrow('Yapily API error');
    });
  });

  describe('createConsent', () => {
    it('should successfully create consent', async () => {
      const mockConsent = {
        consentToken: 'test-token',
        institutionId: 'test-bank',
        status: 'AWAITING_AUTHORIZATION'
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockConsent });
      
      const result = await YapilyService.createConsent('test-bank');
      expect(result).toEqual(mockConsent);
    });
  });

  describe('getAccounts', () => {
    it('should successfully fetch accounts', async () => {
      const mockAccounts = [
        {
          id: 'acc-1',
          accountType: 'CURRENT',
          accountNumber: '12345678',
          balance: 1000,
          currency: 'GBP'
        }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockAccounts });
      
      const result = await YapilyService.getAccounts('test-token');
      expect(result).toEqual(mockAccounts);
    });
  });
}); 