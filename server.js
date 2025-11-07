// server.js
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// 🔧 CONFIGURAÇÕES — personalize com seus dados
const TELEGRAM_TOKEN = "SEU_TOKEN_DO_TELEGRAM_AQUI";
const TELEGRAM_CHAT_ID = "SEU_CHAT_ID_AQUI"; // pode ser ID de grupo ou canal

// Função auxiliar para enviar texto ao Telegram
async function sendTextToTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown"
    });
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem de texto:", error.message);
  }
}

// Função auxiliar para enviar mídia ao Telegram
async function sendMediaToTelegram(type, mediaUrl, caption = "") {
  try {
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

    switch (type) {
      case "image":
        await axios.post(`${apiUrl}/sendPhoto`, {
          chat_id: TELEGRAM_CHAT_ID,
          photo: mediaUrl,
          caption,
          parse_mode: "Markdown"
        });
        break;

      case "audio":
        await axios.post(`${apiUrl}/sendAudio`, {
          chat_id: TELEGRAM_CHAT_ID,
          audio: mediaUrl,
          caption
        });
        break;

      case "video":
        await axios.post(`${apiUrl}/sendVideo`, {
          chat_id: TELEGRAM_CHAT_ID,
          video: mediaUrl,
          caption
        });
        break;

      case "document":
      default:
        await axios.post(`${apiUrl}/sendDocument`, {
          chat_id: TELEGRAM_CHAT_ID,
          document: mediaUrl,
          caption
        });
        break;
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar mídia (${type}):`, error.message);
  }
}

// 🪝 Rota Webhook — chamada automaticamente pelo UltraMsg
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body;

    // Estrutura comum do UltraMsg:
    // {
    //   "id": "ABGGFlA5FpafAgo",
    //   "type": "chat",
    //   "body": "Olá!",
    //   "from": "5511999999999@c.us",
    //   "senderName": "João",
    //   "media": "https://..."
    // }

    const type = msg.type || "chat";
    const sender = msg.senderName || msg.from;
    const body = msg.body || "";
    const mediaUrl = msg.media || null;

    console.log("📩 Nova mensagem recebida:", msg);

    if (type === "chat") {
      const text = `📩 *Mensagem do WhatsApp*\n👤 ${sender}\n💬 ${body}`;
      await sendTextToTelegram(text);
    } else if (["image", "audio", "video", "document"].includes(type)) {
      const caption = `📎 *Mídia recebida de ${sender}*`;
      await sendMediaToTelegram(type, mediaUrl, caption);
    } else {
      await sendTextToTelegram(`📩 Nova mensagem de ${sender}\n(Tipo: ${type})`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro no webhook:", err.message);
    res.sendStatus(500);
  }
});

// 🧠 Health Check (opcional)
app.get("/", (req, res) => {
  res.send("✅ Servidor Zap → Telegram está online!");
});

// 🚀 Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
