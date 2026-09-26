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
// SOCKET
// ===============================

let sock = null;

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

    const phoneNumber = String(number).replace(/\D/g, "");

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
// BOT
// ===============================

async function startBot() {
  try {
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

    // ===============================
    // CONNECTION
    // ===============================

    sock.ev.on("connection.update", ({
      connection,
      lastDisconnect
    }) => {

      if (connection === "open") {
        console.log("✅ MISTER XR konekte!");
      }

      if (connection === "close") {

        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        console.log("❌ Connection closed");
        console.log("📌 Status code:", statusCode);
        console.log(
          "📌 Reason:",
          lastDisconnect?.error?.message || "Unknown"
        );

        if (statusCode !== DisconnectReason.loggedOut) {
          console.log("🔄 MISTER XR ap rekonekte...");

          setTimeout(() => {
            startBot().catch(error => {
              console.error(
                "❌ Reconnect error:",
                error.message
              );
            });
          }, 500