import { Markup } from "telegraf";

export const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🤖 AI Chat", "mode_ai"), Markup.button.callback("💻 Kod Yozish", "mode_code")],
  [Markup.button.callback("🌐 Tarjima", "mode_translate"), Markup.button.callback("📝 Matn Yozish", "mode_write")],
  [Markup.button.callback("🧠 Yordam", "mode_help"), Markup.button.webApp("📱 Mini App", process.env.MINI_APP_URL || "https://example.com")]
]);
