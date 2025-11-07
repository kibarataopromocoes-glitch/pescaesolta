import express from "express";
import axios from "axios";
import 'dotenv/config';

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = "8371637757:AAHK6XH3XhmR6Nk0ZDAUSOIBaQGCTZXcEmE";
const TELEGRAM_CHAT_ID = "-1001826813517";

// Número autorizado (sem o +, com sufixo @c.us)
const ALLOWED_NUMBER = "5511975071048@c.us";

app.post("/webhook", async (req, res) => {
  const msg = req.body;

  // Filtra só mensagens da pessoa autorizada
  if (msg.from !== ALLOWED_NUMBER) {
    console.log(`Mensagem ignorada de: ${msg.from}`);
    return res.sendStatus(200); // OK, mas não processa
  }

  try {
    let telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
    let text = "";

    switch (msg.type) {
      case "chat":
        text = `📩 *Mensagem do WhatsApp*\n👤 ${msg.senderName || "Contato"}\n💬 ${msg.body}`;
        await axios.post(`${telegramUrl}/sendMessage`, {
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        });
        break;

      case "image":
        await axios.post(`${telegramUrl}/sendPhoto`, {
          chat_id: TELEGRAM_CHAT_ID,
          photo: msg.media,
          caption: `📎 *Mídia recebida de ${msg.senderName || "Contato"}*`,
          parse_mode: "Markdown",
        });
        break;

      case "audio":
        await axios.post(`${telegramUrl}/sendAudio`, {
          chat_id: TELEGRAM_CHAT_ID,
          audio: msg.media,
          caption: `🎵 *Áudio recebido de ${msg.senderName || "Contato"}*`,
          parse_mode: "Markdown",
        });
        break;

      case "video":
        await axios.post(`${telegramUrl}/sendVideo`, {
          chat_id: TELEGRAM_CHAT_ID,
          video: msg.media,
          caption: `🎥 *Vídeo recebido de ${msg.senderName || "Contato"}*`,
          parse_mode: "Markdown",
        });
        break;

      case "document":
        await axios.post(`${telegramUrl}/sendDocument`, {
          chat_id: TELEGRAM_CHAT_ID,
          document: msg.media,
          caption: `📄 *Documento recebido de ${msg.senderName || "Contato"}*`,
          parse_mode: "Markdown",
        });
        break;

      default:
        console.log("Tipo de mensagem não suportado:", msg.type);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Telegram:", error.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("✅ Servidor Zap → Telegram está online!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

