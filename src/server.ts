import app from "./app";
import env from "./config/env";
import http from "http";
import { connectDB } from "./config/db";

const startServer = async () => {
  try {
    // Connect to DB
    await connectDB();

    let server;
    // Use the provided PORT from the environment variable
    server = http.createServer(app).listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });

    server.on("error", (error: Error) => {
      console.error("Error starting server:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start server with database connection
startServer();

// Export the Express app for Vercel
export default app;
