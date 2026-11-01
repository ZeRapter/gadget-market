const BOTGATE_URL = "https://bot-gate.ru/api/v1/bots";

export async function sendTelegramNotification(text: string) {
  const botId = process.env.BOTGATE_BOT_ID;
  const apiKey = process.env.BOTGATE_API_KEY;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botId || !apiKey || !chatId) {
    console.warn("BotGate уведомления не настроены (проверь .env)");
    return;
  }

  try {
    const res = await fetch(`${BOTGATE_URL}/${botId}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Ошибка от BotGate:", data);
    }
  } catch (error) {
    console.error("Ошибка сети при отправке через BotGate:", error);
  }
}