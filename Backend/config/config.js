import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  REFRESHTOKEN_SECRET:process.env.REFRESHTOKEN_SECRET,
  PASSWORD_RESET_SECRET:process.env.PASSWORD_RESET_SECRET,
  GOOGLE_USER:process.env.GOOGLE_USER,
  GOOGLE_APP_PASSWORD:process.env.GOOGLE_APP_PASSWORD

};
export default config;
