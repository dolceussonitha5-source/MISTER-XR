const { saveConfig } = require("../lib/config");

module.exports = {
  name: "setprefix",

  async execute({ sock, msg, args, config }) {
    const chat = msg.key.remoteJid;

    if (!args[0]) {
      await sock.sendMessage(chat, {
        text: `Prefix aktyèl la se: ${config.prefix}`
      });

      await sock.sendMessage(chat, {
        react: {
          text: "🤣",
          key: msg.key
        }
      });

      return;
    }

    const newPrefix = args[0];

    if (newPrefix.length > 3) {
      await sock.sendMessage(chat, {
        text: "❌ Prefix la pa dwe gen plis pase 3 karaktè."
      });

      await sock.sendMessage(chat, {
        react: {
          text: "🤣",
          key: msg.key
        }
      });

      return;
    }

    config.prefix = newPrefix;
    saveConfig(config);

    await sock.sendMessage(chat, {
      text: `✅ Prefix chanje!\n\nNouvo prefix: ${newPrefix}`
    });

    await sock.sendMessage(chat, {
      react: {
        text: "🤣",
        key: msg.key
      }
    });
  }
};