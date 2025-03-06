/**
 * Authentication Controller
 * Handles all authentication-related operations including user registration,
 * login, password reset, OAuth flows, and session management.
 * @module controllers/auth
 */

import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import AuthService from "../services/auth.service";
import { IUser } from "../models/user.model";
import ValidationService from "../services/validation.service";

const formatUserResponse = (user: IUser) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    createdAt: user.createdAt,
  };
};

export default class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      console.log("got here")

      // Validate credentials
      const validationError = ValidationService.validateCredentials(email, password);
      if (validationError) {
        return res.status(400).json(validationError);
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Create user - password will be hashed by the pre-save middleware
      const user = await User.create({
        email,
        password  // Remove manual hashing
      });

      res.status(201).json({
        message: "Registration successful",
        user: formatUserResponse(user)
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        message: "Failed to create user",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate credentials
      const validationError = ValidationService.validateCredentials(email, password);
      if (validationError) {
        return res.status(400).json(validationError);
      }

      // Find user
      console.log("Finding user");
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Check password
      console.log("Password from request:", password);
      console.log("Stored hashed password:", user.password);
      const isValidPassword = await user.comparePassword(password);
      console.log("Password comparison result:", isValidPassword);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokens(user._id.toString());

      // Update refresh token and last login
      await User.findByIdAndUpdate(user._id, { 
        refreshToken,
        lastLogin: new Date()
      });

      // Set cookies
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      // Send both tokens in response
      res.json({
        accessToken,
        refreshToken,
        user: formatUserResponse(user)
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Login failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          message: "No refresh token provided" 
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = await AuthService.verifyRefreshToken(refreshToken);
      } catch (error) {
        return res.status(401).json({ 
          message: "Invalid or expired refresh token" 
        });
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          message: "User not found" 
        });
      }

      // Verify token matches stored token
      if (user.refreshToken !== refreshToken) {
        return res.status(401).json({ 
          message: "Invalid refresh token" 
        });
      }

      // Generate new tokens
      const tokens = AuthService.generateTokens(user._id.toString());

      // Update user's refresh token
      await User.findByIdAndUpdate(user._id, { 
        refreshToken: tokens.refreshToken 
      });

      // Set cookies
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      res.cookie("accessToken", tokens.accessToken, {
        ...cookieOptions,
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      
      return res.json({
        success: true,
        user: formatUserResponse(user)
      });
    } catch (error) {
      console.error("Refresh error:", error);
      return res.status(500).json({ 
        message: "Token refresh failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        // Find user and remove refresh token
        await User.findOneAndUpdate(
          { refresh_token: refreshToken },
          { refresh_token: undefined }
        );
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        message: "Logout failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}