import { Telegraf } from "telegraf";
import { chatRepository, userRepository } from "../../database";
import { aiService } from "../../services/ai.service";
import { logger } from "../../utils/logger";

const splitMessage = (text: string, maxLength: number = 4000): string[] => {
  const chunks: string[] = [];
  if (!text || text.trim() === "") return ["Uzr, javob ololmadim."];

  let current = "";
  for (const char of text) {
    if (current.length >= maxLength) {
      chunks.push(current);
      current = "";
    }
    current += char;
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks;
};

export const setupHandlers = (bot: Telegraf) => {
  bot.on("text", async (ctx) => {
    const user = ctx.from;
    const userMessage = ctx.message.text;

    if (!user) return;

    // Ensure user exists
    await userRepository.upsertUser({
      telegram_id: user.id,
      username: user.username || null,
      first_name: user.first_name,
    });

    await ctx.sendChatAction("typing");

    // Send a single emoji which Telegram renders as an animated sticker
    const loadingMsg = await ctx.reply("🧠").catch(async () => {
      return await ctx.reply("⏳...");
    });

    const typingInterval = setInterval(() => {
      ctx.sendChatAction("typing").catch(() => {});
    }, 4000);

    try {
      // Add user message to DB
      await chatRepository.addMessage({
        user_id: user.id,
        role: "user",
        content: userMessage,
      });

      // Get history (reduced to 4 to prevent Groq API rate limits)
      const history = await chatRepository.getHistory(user.id, 4);

      // Generate AI response
      const aiResponseText = await aiService.generateResponse(history);

      // Add AI response to DB
      await chatRepository.addMessage({
        user_id: user.id,
        role: "assistant",
        content: aiResponseText,
      });

      clearInterval(typingInterval);
      
      // Delete loading message
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});

      // Send response
      const chunks = splitMessage(aiResponseText);
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: "Markdown" }).catch(async (e) => {
          logger.warn("Markdown error, falling back to text", e.message);
          await ctx.reply(chunk); // fallback if markdown fails
        });
      }

    } catch (error) {
      clearInterval(typingInterval);
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
      logger.error("Error handling text message", error);
      await ctx.reply("❌ AI xizmatida vaqtinchalik xatolik yuz berdi. Keyinroq qayta urinib ko'ring.");
    }
  });

  bot.on("callback_query", async (ctx) => {
    // @ts-ignore
    const data = ctx.callbackQuery.data;
    
    let replyText = "";
    if (data === "mode_ai") {
      replyText = "🤖 Oddiy AI Chat rejimi. Menga istalgan savolingizni yozing.";
    } else if (data === "mode_code") {
      replyText = "💻 Kod Yozish rejimi. Qanday dasturlash tili yoki muammo bo'yicha yordam kerak?";
    } else if (data === "mode_translate") {
      replyText = "🌐 Tarjima rejimi. Tarjima qilmoqchi bo'lgan matnni yuboring (tillarni avtomatik aniqlayman).";
    } else if (data === "mode_write") {
      replyText = "📝 Matn Yozish rejimi. Qanday matn yozib berishim kerak? (Masalan: Email, Post, Essay)";
    } else if (data === "mode_help") {
      replyText = "🧠 Yordam bo'limi. Bot bo'yicha ma'lumot olish uchun /help buyrug'ini yozing.";
    }

    if (replyText) {
      await ctx.reply(replyText);
    }
    
    await ctx.answerCbQuery();
  });
};
