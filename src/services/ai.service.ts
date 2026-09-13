import OpenAI from "openai";
import { config } from "../config";
import { SYSTEM_PROMPT } from "../config/prompt";
import { logger } from "../utils/logger";
import { ChatMessage } from "../database";

const openai = new OpenAI({
  apiKey: config.AI_API_KEY,
  baseURL: config.AI_BASE_URL,
});

export const aiService = {
  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content
        }))
      ];

      const response = await openai.chat.completions.create({
        model: config.AI_MODEL,
        messages: apiMessages,
        max_tokens: 800,
      });

      let rawContent = response.choices[0]?.message?.content || "";
      // Remove <think>...</think> blocks using regex
      rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      return rawContent || "Uzr, javob ololmadim.";
    } catch (error: any) {
      if (error?.status === 429 || error?.response?.status === 429 || error?.code === 'rate_limit_exceeded' || error?.error?.code === 'rate_limit_exceeded') {
        logger.warn("AI Service Rate Limit Hit");
        return "⏳ Kechirasiz, hozir serverimizda foydalanuvchilar juda ko'p. 1-2 daqiqadan so'ng qayta urinib ko'ring.";
      }
      logger.error("AI Service Error", error);
      throw error;
    }
  }
};
