import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';

interface TokenPayload {
  userId: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export default class AuthService {
  private static ACCESS_TOKEN_EXPIRY = 30 * 60; // 30 minutes in seconds
  private static REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

  static generateTokens(userId: string): Tokens {
    console.log("Generating tokens for userId:", userId);
    const options: SignOptions = { expiresIn: this.ACCESS_TOKEN_EXPIRY };
    const refreshOptions: SignOptions = { expiresIn: this.REFRESH_TOKEN_EXPIRY };

    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      options
    );
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      refreshOptions
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET!) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  }
} 