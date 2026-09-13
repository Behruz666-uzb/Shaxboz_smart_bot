import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { logger } from "../utils/logger";

const dbPath = path.resolve(__dirname, "../../database.sqlite");

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const initDb = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id INTEGER PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      role TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (telegram_id)
    );
  `);
  
  logger.info("Database initialized");
};

export interface User {
  telegram_id: number;
  username: string | null;
  first_name: string;
  created_at?: string;
}

export interface ChatMessage {
  id?: number;
  user_id: number;
  role: "system" | "user" | "assistant";
  content: string;
  created_at?: string;
}

export const userRepository = {
  async upsertUser(user: Omit<User, "created_at">) {
    try {
      await db.run(
        `INSERT INTO users (telegram_id, username, first_name)
         VALUES (?, ?, ?)
         ON CONFLICT(telegram_id) DO UPDATE SET
         username = excluded.username,
         first_name = excluded.first_name`,
        [user.telegram_id, user.username, user.first_name]
      );
    } catch (error) {
      logger.error("Error upserting user", error);
    }
  },
  
  async getUser(telegram_id: number): Promise<User | undefined> {
    try {
      return await db.get<User>("SELECT * FROM users WHERE telegram_id = ?", [telegram_id]);
    } catch (error) {
      logger.error("Error getting user", error);
      return undefined;
    }
  }
};

export const chatRepository = {
  async addMessage(message: Omit<ChatMessage, "id" | "created_at">) {
    try {
      await db.run(
        `INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)`,
        [message.user_id, message.role, message.content]
      );
    } catch (error) {
      logger.error("Error adding message", error);
    }
  },

  async getHistory(user_id: number, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const results = await db.all<ChatMessage[]>(
        `SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [user_id, limit]
      );
      return results.reverse();
    } catch (error) {
      logger.error("Error getting history", error);
      return [];
    }
  },

  async clearHistory(user_id: number) {
    try {
      await db.run("DELETE FROM chat_history WHERE user_id = ?", [user_id]);
    } catch (error) {
      logger.error("Error clearing history", error);
    }
  }
};
