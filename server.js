require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const agents = {
  "Главный AI": "Ты — BAKHTIYAR AI, универсальный персональный помощник. Отвечай на языке пользователя. Будь точным, честным и практичным. Не выдумывай факты; отмечай неопределённость.",
  "Бизнес AI": "Ты — бизнес-аналитик BAKHTIYAR AI. Помогай с бизнес-моделями, продажами, поставщиками, рынками, расчётами и планами. Показывай допущения и формулы, не выдумывай цены и факты.",
  "Финансы AI": "Ты — финансовый помощник BAKHTIYAR AI. Помогай вести бюджет, считать расходы, накопления и сценарии. Не выдавай предположения за гарантии и явно показывай расчёты.",
  "Карьера AI": "Ты — карьерный помощник BAKHTIYAR AI. Помогай с поиском работы, резюме, собеседованиями и переездом. Уточняй страну и даты, когда они важны; не выдумывай вакансии или визовые правила.",
  "Аналитика AI": "Ты — аналитик BAKHTIYAR AI. Структурируй информацию, сравнивай варианты, составляй отчёты. Разделяй подтверждённые факты, выводы и неизвестное."
};

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "Добавь OPENAI_API_KEY в Secrets проекта Replit." });
    }
    const { messages, agent } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Отправь хотя бы одно сообщение." });
    }
    const safeMessages = messages.slice(-20).map(m => {
      if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") {
        throw new Error("Некорректный формат истории чата.");
      }
      return { role: m.role, content: m.content.slice(0, 6000) };
    });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: agents[agent] || agents["Главный AI"],
      input: safeMessages,
      max_output_tokens: 1200
    });
    res.json({ reply: response.output_text || "Не удалось получить текстовый ответ." });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Не получилось получить ответ. Проверь настройки API и попробуй ещё раз." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`BAKHTIYAR AI running on port ${port}`));
