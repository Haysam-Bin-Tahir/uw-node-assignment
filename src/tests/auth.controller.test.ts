import { Request, Response } from 'express';
import AuthController from '../controllers/auth.controller';
import User from '../models/user.model';
import AuthService from '../services/auth.service';
import mongoose from 'mongoose';

jest.mock('../models/user.model');
jest.mock('../services/auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: any;

  beforeEach(() => {
    controller = new AuthController();
    mockRequest = {
      body: {},
      cookies: {}
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
    mockUser = {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      email: 'test@example.com',
      comparePassword: jest.fn()
    };
  });

  describe('login', () => {
    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'ValidPassword123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '123'
      };

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return tokens for valid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'ValidPassword123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);
      
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
      (AuthService.generateTokens as jest.Mock).mockReturnValue(mockTokens);

      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: mockTokens.accessToken
      }));
    });
  });

  describe('register', () => {
    it('should create new user successfully', async () => {
      mockRequest.body = {
        email: 'new@example.com',
        password: 'ValidPassword123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await controller.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Registration successful'
      }));
    });

    it('should return 409 if email exists', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'ValidPassword123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await controller.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      mockRequest.cookies = {
        refreshToken: 'valid-refresh-token'
      };
      
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      mockUser.refreshToken = 'valid-refresh-token';
      (AuthService.verifyRefreshToken as jest.Mock).mockReturnValue({ userId: mockUser._id });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (AuthService.generateTokens as jest.Mock).mockReturnValue(mockNewTokens);

      await controller.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should return 401 for missing refresh token', async () => {
      mockRequest.cookies = {};

      await controller.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockRequest.cookies = {
        refreshToken: 'valid-refresh-token'
      };

      await controller.logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Logged out successfully'
      }));
    });
  });
}); 