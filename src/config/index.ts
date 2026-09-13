import dotenv from "dotenv";

dotenv.config();

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_BASE_URL: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1",
  AI_MODEL: process.env.AI_MODEL || "llama3-70b-8192",
  PORT: process.env.PORT || 3000,
  MINI_APP_URL: process.env.MINI_APP_URL || "",
};

if (!config.BOT_TOKEN) {
  console.error("Missing BOT_TOKEN in .env");
}

if (!config.AI_API_KEY) {
  console.error("Missing AI_API_KEY in .env");
}
