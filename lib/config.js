const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "config.json");

function loadConfig() {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });

    fs.writeFileSync(
      file,
      JSON.stringify({ prefix: "." }, null, 2)
    );
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveConfig(config) {
  fs.writeFileSync(
    file,
    JSON.stringify(config, null, 2)
  );
}

module.exports = {
  loadConfig,
  saveConfig
};