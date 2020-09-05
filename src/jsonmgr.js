const { existsSync, readFileSync, writeFileSync } = require("fs");

module.exports = (root) => {
  return {
    readJSON (path) {
      path = root + path
      if (existsSync(path))
        return JSON.parse(readFileSync(path).toString())
      return [];
    },
    writeJSON (path, json) {
      path = root + path
      writeFileSync(path, JSON.stringify(json));
    }
  }
}