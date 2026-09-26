module.exports = {
  name: "menu",
  aliases: ["help", "commands"],

  async execute({ sock, msg, config }) {
    const menu = `
╭━━━〔 🤣 MISTER XR 🤣 〕━━━╮
┃
┃ 👑 OWNER
┃ • .owner
┃ • .setprefix
┃ • .restart
┃
┃ ⚙️ GENERAL
┃ • .menu
┃ • .ping
┃ • .alive
┃ • .runtime
┃
┃ 👥 GROUP
┃ • .add
┃ • .kick
┃ • .promote
┃ • .demote
┃ • .tagall
┃
┃ 🛡️ SECURITY
┃ • .antilink
┃ • .antispam
┃
┃ 🎨 STICKER
┃ • .sticker
┃ • .toimg
┃
┃ 🎵 MEDIA
┃ • .play
┃ • .song
┃ • .video
┃
┃ 🤖 AI
┃ • .ai
┃ • .ask
┃
┃ 🛠️ TOOLS
┃ • .translate
┃ • .calc
┃ • .qr
┃
┃ 📱 STATUS
┃ • .vv
┃ • .autoviestatus
┃
╰━━━━━━━━━━━━━━━━━━━━╯

🤖 MISTER XR
Prefix: ${config.prefix}
Reaction: 🤣
`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: menu
    });

    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: "🤣",
        key: msg.key
      }
    });
  }
};