module.exports = {
  name: "alive",
  aliases: ["online"],

  async execute({ sock, msg }) {
    const text = `
╭━━〔 🤣 MISTER XR 〕━━╮
┃
┃ 🟢 Bot la aktif!
┃
┃ 🤖 MISTER XR
┃ ⚡ Status: ONLINE
┃ 📌 Prefix: .
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`;

    await sock.sendMessage(msg.key.remoteJid, {
      text
    });

    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: "🤣",
        key: msg.key
      }
    });
  }
};