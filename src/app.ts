import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import mongoose from 'mongoose';
import yapilyRoutes from './routes/yapily.routes';
import env from "./config/env";
import monitorRoutes from './routes/monitor.routes';

// Extend Express Request type
interface RequestWithRetry extends Request {
  retryCount?: number;
}

const app = express();

// Modify the database connection middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Skip DB connection for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Skip DB connection for health check endpoint
  if (req.path === '/' && req.method === 'GET') {
    return next();
  }

  try {
    if (process.env.NODE_ENV === "production") {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({ 
      message: 'Database connection error, please try again',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

app.use(morgan("dev"));

// Regular body parsing for other routes
app.use(express.json());
app.use(cookieParser());

// Main CORS configuration for all routes
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: 204
  })
);

// Routes
app.use('/api', yapilyRoutes);
app.use('/api/monitor', monitorRoutes);

// Health check can stay at root
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' })
})

// Retry middleware
const retryMiddleware = async (err: Error, req: RequestWithRetry, res: Response, next: NextFunction) => {
  if (!req.retryCount) {
    req.retryCount = 0;
  }

  if (req.retryCount < 1) {
    console.log(`Retrying request to ${req.path} (attempt ${req.retryCount + 1})`);
    req.retryCount++;
    
    try {
      // Store the original request handlers
      const route = app._router.stack.find((layer: any) => 
        layer.route && layer.route.path === req.path && layer.route.methods[req.method.toLowerCase()]
      );

      if (route) {
        // Re-run the route handler
        await Promise.resolve(route.route.stack[0].handle(req, res, next));
      } else {
        next(err);
      }
    } catch (retryError) {
      next(retryError);
    }
  } else {
    next(err);
  }
};

// Error handling middleware
app.use((err: Error, req: RequestWithRetry, res: Response, next: NextFunction) => {
  // Try to retry first
  retryMiddleware(err, req, res, next);
});

// Old error handling middleware ( will be enabled after moving from Vercel)
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ message: err.message });
// });

// Connect to MongoDB
mongoose.connect(env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

export default app;
