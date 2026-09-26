const fs = require("fs");
const path = require("path");

function loadCommands() {
  const commands = new Map();
  const folder = path.join(__dirname, "..", "commands");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  for (const file of fs.readdirSync(folder)) {
    if (!file.endsWith(".js")) continue;

    try {
      const command = require(path.join(folder, file));

      if (!command.name || typeof command.execute !== "function") {
        continue;
      }

      commands.set(command.name.toLowerCase(), command);

      if (Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          commands.set(alias.toLowerCase(), command);
        }
      }
    } catch (error) {
      console.log(`❌ Erè nan ${file}:`, error.message);
    }
  }

  return commands;
}

module.exports = { loadCommands };