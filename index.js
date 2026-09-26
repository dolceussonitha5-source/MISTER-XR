const express = require("express");
const path = require("path");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
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
// SOCKET
// ===============================

let sock = null;
let starting = false;

// ===============================
// PAIRING CODE
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
        message: "Bot la poko pare."
      });
    }

    const phoneNumber = String(number).replace(/\D/g, "");

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Nimewo a pa valab."
      });
    }

    console.log(`🔐 M ap mande pairing code pou ${phoneNumber}`);

    const code = await sock.requestPairingCode(phoneNumber);

    console.log(`✅ Pairing code: ${code}`);

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
// START BOT
// ===============================

async function startBot() {

  if (starting) {
    return;
  }

  starting = true;

  try {

    const { state, saveCreds } =
      await useMultiFileAuthState("./session");

    const config = loadConfig();
    const commands = loadCommands();

    console.log(`✅ ${commands.size} command(s) loaded`);
    console.log(`⚙️ Prefix: ${config.prefix}`);

    sock = makeWASocket({
      auth: state,

      logger: pino({
        level: "silent"
      }),

      printQRInTerminal: false,

      browser: Browsers.ubuntu("Chrome"),

      connectTimeoutMs: 60000,

      defaultQueryTimeoutMs: 60000,

      keepAliveIntervalMs: 30000,

      markOnlineOnConnect: false
    });

    sock.ev.on("creds.update", saveCreds);

    // ===============================
    // CONNECTION
    // ===============================

    sock.ev.on(
      "connection.update",
      ({ connection, lastDisconnect }) => {

        if (connection === "connecting") {
          console.log("🔄 MISTER XR ap konekte...");
        }

        if (connection === "open") {

          starting = false;

          console.log(
            "✅ MISTER XR konekte sou WhatsApp!"
          );
        }

        if (connection === "close") {

          starting = false;

          const statusCode =
            lastDisconnect?.error?.output?.statusCode;

          const reason =
            lastDisconnect?.error?.message ||
            "Unknown";

          console.log(
            "❌ WhatsApp connection closed"
          );

          console.log(
            "📌 Status:",
            statusCode
          );

          console.log(
            "📌 Reason:",
            reason
          );

          // Logged out = pa rekonekte
          if (
            statusCode ===
            DisconnectReason.loggedOut
          ) {

            sock = null;

            console.log(
              "❌ Sesyon WhatsApp la soti."
            );

            return;
          }

          // Pa kreye plizyè socket an menm tan
          sock = null;

          console.log(
            "⏳ M ap eseye rekonekte apre 10 segonn..."
          );

          setTimeout(() => {

            startBot().catch(error => {

              starting = false;

              console.error(
                "❌ Reconnect error:",
                error.message
              );

            });

          }, 10000);
        }
      }
    );

    // ===============================
    // MESSAGES
    // ===============================

    sock.ev.on(
      "messages.upsert",
      async ({ messages }) => {

        try {

          const msg = messages[0];

          if (!msg?.message) return;

          if (msg.key.fromMe) return;

          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

          if (!text.startsWith(config.prefix)) {
            return;
          }

          const parts = text
            .slice(config.prefix.length)
            .trim()
            .split(/\s+/);

          const commandName =
            parts.shift()?.toLowerCase();

          if (!commandName) return;

          const command =
            commands.get(commandName);

          if (!command) return;

          await command.execute({
            sock,
            msg,
            args: parts,
            text,
            config
          });

        } catch (error) {

          console.log(
            "❌ Command error:",
            error.message
          );

        }

      }
    );

  } catch (error) {

    starting = false;

    console.error(
      "❌ Bot start error:",
      error.message
    );

  }
}

// ===============================
// SERVER
// ===============================

app.listen(PORT, () => {

  console.log(
    `🌐 MISTER XR server running on port ${PORT}`
  );

});

// ===============================
// START
// ===============================

startBot();