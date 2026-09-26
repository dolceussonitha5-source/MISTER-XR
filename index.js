const express = require("express");
const path = require("path");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const { loadCommands } = require("./lib/loader");
const { loadConfig } = require("./lib/config");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// PAIR PAGE
// ===============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pair.html"));
});

// ===============================
// BOT
// ===============================

let sock;

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const config = loadConfig();
  const commands = loadCommands();

  console.log(`✅ ${commands.size} command(s) loaded`);
  console.log(`⚙️ Prefix: ${config.prefix}`);

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({
    connection,
    lastDisconnect
  }) => {

    if (connection === "open") {
      console.log("✅ MISTER XR konekte!");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("🔄 MISTER XR ap rekonekte...");

        setTimeout(() => {
          startBot();
        }, 3000);
      } else {
        console.log("❌ Sesyon an dekonekte.");
      }
    }
  });
  
// ===============================
// PAIRING CODE API
// ===============================

app.post("/pair", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "Tanpri mete nimewo WhatsApp la."
      });
    }

    if (!sock) {
      return res.status(503).json({
        success: false,
        message: "Bot la poko pare. Eseye ankò."
      });
    }

    const phoneNumber = String(number)
      .replace(/\D/g, "");

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Nimewo a pa valab."
      });
    }

    const code = await sock.requestPairingCode(phoneNumber);

    console.log(`🔑 Pairing code generated for ${phoneNumber}`);

    return res.json({
      success: true,
      code
    });

  } catch (error) {
    console.error("❌ Pairing error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

  // ===============================
  // MESSAGES
  // ===============================

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg?.message) return;
      if (msg.key.fromMe) return;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      if (!text.startsWith(config.prefix)) return;

      const parts = text
        .slice(config.prefix.length)
        .trim()
        .split(/\s+/);

      const commandName = parts.shift()?.toLowerCase();

      if (!commandName) return;

      const command = commands.get(commandName);

      if (!command) return;

      await command.execute({
        sock,
        msg,
        args: parts,
        text,
        config
      });

    } catch (error) {
      console.log("❌ Command error:", error.message);
    }
  });
}

// ===============================
// RENDER SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`🌐 MISTER XR server running on port ${PORT}`);
});

// ===============================
// START BOT
// ===============================

startBot().catch(error => {
  console.error("❌ Bot start error:", error);
});