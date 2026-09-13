import express from "express";
import cors from "cors";
import path from "path";
import { Telegraf } from "telegraf";
import { config } from "./config";
import { logger } from "./utils/logger";
import { initDb, chatRepository } from "./database";
import { setupCommands } from "./bot/commands";
import { setupHandlers } from "./bot/handlers";
import { aiService } from "./services/ai.service";

const startServer = async () => {
  try {
    await initDb();

    // Setup Bot
    const bot = new Telegraf(config.BOT_TOKEN);
    setupCommands(bot);
    setupHandlers(bot);

    bot.catch((err, ctx) => {
      logger.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
    });

    bot.launch().then(() => {
      // Set the Menu Button (bottom left corner) for all users
      if (config.MINI_APP_URL) {
        bot.telegram.setChatMenuButton({
          menuButton: {
            type: "web_app",
            text: "📱 Ochiq",
            web_app: { url: config.MINI_APP_URL }
          }
        }).catch((e) => logger.error("Menu button error", e));
      }
    });
    logger.info("Telegram Bot started!");

    // Setup Express (for Mini App API)
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Basic API for Mini App
    app.post("/api/chat", async (req, res) => {
      const { user_id, message } = req.body;
      
      if (!user_id || !message) {
        return res.status(400).json({ error: "Missing user_id or message" });
      }

      try {
        await chatRepository.addMessage({
          user_id,
          role: "user",
          content: message
        });

        const history = await chatRepository.getHistory(user_id, 4);
        const responseText = await aiService.generateResponse(history);

        await chatRepository.addMessage({
          user_id,
          role: "assistant",
          content: responseText
        });

        res.json({ response: responseText });
      } catch (error) {
        logger.error("API Chat Error", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/api/clear", async (req, res) => {
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
      }
      await chatRepository.clearHistory(user_id);
      res.json({ success: true });
    });

    app.get("/api/history", async (req, res) => {
      const { user_id } = req.query;
      if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
      }
      const history = await chatRepository.getHistory(Number(user_id), 50);
      res.json({ history });
    });

    // Serve miniapp
    app.use(express.static(path.join(__dirname, "../miniapp/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../miniapp/dist/index.html"));
    });

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
    });

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error) {
    logger.error("Startup error", error);
    process.exit(1);
  }
};

startServer();
