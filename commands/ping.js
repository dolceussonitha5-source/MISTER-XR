module.exports = {
  name: "ping",
  aliases: ["p"],

  async execute({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🏓 MISTER XR ap mache!"
    });

    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: "🤣",
        key: msg.key
      }
    });
  }
};