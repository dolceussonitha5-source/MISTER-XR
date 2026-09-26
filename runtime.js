const started = Date.now();

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  name: "runtime",
  aliases: ["uptime"],

  async execute({ sock, msg }) {
    const uptime = formatTime(Date.now() - started);

    await sock.sendMessage(msg.key.remoteJid, {
      text: `🤖 MISTER XR\n\n⏱️ Runtime: ${uptime}`
    });

    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: "🤣",
        key: msg.key
      }
    });
  }
};