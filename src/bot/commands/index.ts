import { Telegraf } from "telegraf";
import { mainKeyboard } from "../keyboards";
import { userRepository, chatRepository } from "../../database";

export const setupCommands = (bot: Telegraf) => {
  bot.start(async (ctx) => {
    const user = ctx.from;
    if (user) {
      await userRepository.upsertUser({
        telegram_id: user.id,
        username: user.username || null,
        first_name: user.first_name,
      });
    }

    const welcomeMessage = `Assalomu alaykum, ${user?.first_name || 'Foydalanuvchi'}! 👋\n\nMen universal AI yordamchiman. Istalgan savolingizni yozishingiz yoki quyidagi bo'limlardan birini tanlashingiz mumkin.`;
    
    await ctx.reply(welcomeMessage, mainKeyboard);
  });

  bot.command("clear", async (ctx) => {
    const user = ctx.from;
    if (user) {
      await chatRepository.clearHistory(user.id);
      await ctx.reply("🗑 Chat tarixi tozalandi.");
    }
  });

  bot.command("help", async (ctx) => {
    const helpMessage = `
🤖 *Bot imkoniyatlari:*

- Istalgan savolingizga javob beraman (O'zbek, Rus, Ingliz tillarida)
- Dasturlash va xatolarni topishda yordam beraman
- Matnlarni turli tillarga tarjima qilaman
- Postlar, maqolalar va xatlar yozishda yordam beraman

Shunchaki o'z savolingizni yozing yoki /start orqali menudan foydalaning!
    `.trim();
    await ctx.replyWithMarkdownV2(helpMessage.replace(/-/g, '\\-').replace(/\./g, '\\.'));
  });
};
