import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service';
import env from '../config/env';

describe('AuthService', () => {
  const mockUserId = '507f1f77bcf86cd799439011';

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = AuthService.generateTokens(mockUserId);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should include userId in token payload', () => {
      const { accessToken } = AuthService.generateTokens(mockUserId);
      const decoded = jwt.verify(accessToken, env.JWT_SECRET) as { userId: string };
      
      expect(decoded.userId).toBe(mockUserId);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const { accessToken } = AuthService.generateTokens(mockUserId);
      const decoded = AuthService.verifyAccessToken(accessToken);
      
      expect(decoded.userId).toBe(mockUserId);
    });

    it('should throw on invalid token', () => {
      expect(() => {
        AuthService.verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });
}); 