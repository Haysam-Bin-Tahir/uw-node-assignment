import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
  PORT: port({ default: 8080 }),
  MONGODB_URI: str(),
  YAPILY_CLIENT_ID: str(),
  YAPILY_CLIENT_SECRET: str(),
  YAPILY_API_URL: str({ default: 'https://api.yapily.com' }),
  YAPILY_CALLBACK_URL: str({ default: 'http://localhost:8080/api/auth/callback' }),
  JWT_SECRET: str(),
  JWT_REFRESH_SECRET: str()
});

export default env;
