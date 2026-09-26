module.exports = {
  name: "vv",
  aliases: ["viewonce"],
  category: "media",
  description: "Voye yon medya kòm View Once",

  async execute({ sock, msg }) {
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "📌 Reponn sou yon imaj oswa videyo epi ekri .vv"
        },
        { quoted: msg }
      );
    }

    if (quoted.imageMessage) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          image: { url: quoted.imageMessage.url },
          caption: quoted.imageMessage.caption || "",
          viewOnce: true
        },
        { quoted: msg }
      );
    }

    if (quoted.videoMessage) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          video: { url: quoted.videoMessage.url },
          caption: quoted.videoMessage.caption || "",
          viewOnce: true
        },
        { quoted: msg }
      );
    }

    return sock.sendMessage(
      msg.key.remoteJid,
      {
        text: "❌ .vv mache sèlman sou imaj oswa videyo."
      },
      { quoted: msg }
    );
  }
};