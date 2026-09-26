module.exports = {
  name: "restart",

  async execute({ sock, msg }) {
    const chat = msg.key.remoteJid;

    await sock.sendMessage(chat, {
      text: "🔄 MISTER XR ap rekòmanse..."
    });

    await sock.sendMessage(chat, {
      react: {
        text: "🤣",
        key: msg.key
      }
    });

    setTimeout(() => {
      process.exit(0);
    }, 1500);
  }
};