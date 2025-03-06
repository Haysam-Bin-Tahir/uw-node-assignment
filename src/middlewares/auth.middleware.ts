import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { IUser } from "../models/user.model";
import AuthService from "../services/auth.service";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: "Access token not found" });
      return;
    }

    const decoded = AuthService.verifyAccessToken(token);
    const user = await User.findById(Number(decoded.userId));
    
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    res.status(401).json({ message: "Invalid token" });
  }
};
