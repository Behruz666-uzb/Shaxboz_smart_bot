# Universal AI Assistant Telegram Bot

Zamonaviy va professional AI Telegram bot, shuningdek Telegram Mini App (React + Vite) bilan birga.
Asosiy texnologiyalar: Node.js, TypeScript, Telegraf.js, OpenAI SDK (Groq/OpenAI), SQLite, React, Tailwind CSS.

## 🚀 O'rnatish

Loyihani yuklab oling va dependencylarni o'rnating:

\`\`\`bash
# Backend uchun kutubxonalarni o'rnatish
npm install

# Mini App uchun kutubxonalarni o'rnatish
cd miniapp
npm install
cd ..
\`\`\`

## ⚙️ Sozlamalar (Environment)

Katalogda \`.env\` faylini yarating (yoki \`.env.example\` ni nusxalang) va quyidagilarni kiriting:

\`\`\`env
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
AI_API_KEY=YOUR_AI_API_KEY
AI_BASE_URL=https://api.groq.com/openai/v1 # Agar Groq ishlatsangiz, yoki OpenAI bo'lsa o'zgartiring
AI_MODEL=llama3-70b-8192 # yoki gpt-4, gpt-3.5-turbo va hokazo
PORT=3000
MINI_APP_URL=https://your-domain.com # Mini app ishlayotgan URL manzili (Telegram BotFather orqali ulanadi)
\`\`\`

> **BotFather orqali token olish:**
> 1. Telegramda @BotFather ga kiring.
> 2. \`/newbot\` buyrug'ini yuboring.
> 3. Botga nom va username bering.
> 4. Berilgan tokenni \`BOT_TOKEN\` ga yozing.

> **Mini App ulanishi:**
> BotFather orqali botni tahrirlash (Bot Settings) bo'limiga kirib, Web App URL ni qo'shing yoki Menyu tugmasiga ulab qo'ying.

## 💻 Ishga tushirish

### Development (Dasturlash rejimi)

Ikkita terminal oching.

**1-terminal (Backend va Bot):**
\`\`\`bash
npm run dev
\`\`\`

**2-terminal (Mini App Frontend):**
\`\`\`bash
npm run dev:miniapp
\`\`\`

### Production (Jonli server uchun)

\`\`\`bash
# Barcha backend va frontend qismlarni build qilish
npm run build

# Loyihani ishga tushirish (Bot va Express server Mini App bilan)
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
project/
├── miniapp/               # React + Vite frontend (Mini App)
│   ├── src/
│   │   ├── App.tsx        # Asosiy Mini App UI
│   │   └── index.css      # Tailwind va Theme stylari
│   └── package.json
├── src/                   # Node.js backend (Bot)
│   ├── bot/               # Bot handlerlari va commandlari
│   ├── config/            # AI Prompts va sozlamalar
│   ├── database/          # SQLite ulanishi va querylar
│   ├── services/          # AI Service
│   └── index.ts           # Asosiy entry point va Express API
├── database.sqlite        # Avtomatik yaratiladi (Chat tarixi va userlar)
├── package.json           # Backend package.json
└── README.md
\`\`\`

## 🛡️ Xavfsizlik
- Barcha maxfiy kalitlar (API Keys) \`.env\` faylida saqlanadi.
- Frontend hecham API kalitlariga to'g'ridan-to'g'ri ulanmaydi, barcha so'rovlar Backend (Express) orqali o'tadi.
- Ma'lumotlar bazasi (SQLite) xavfsiz fayl sifatida saqlanadi va Gitga yuklanmaydi.

Loyiha tayyor va to'liq foydalanishga mo'ljallangan!
