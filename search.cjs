const fs = require("fs");
const path = require("path");

const term = (process.argv[2] || "").toLowerCase();
if (!term) {
  console.log("Usage: node search.cjs <word>");
  process.exit(1);
}

const skipDirs = ["node_modules", ".git", "dist"];
const skipFiles = ["package-lock.json", "search.cjs"];
const exts = [".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".json", ".md", ".html", ".css"];

let matches = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.includes(name) || skipFiles.includes(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (exts.includes(path.extname(name))) {
      const lines = fs.readFileSync(full, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(term)) {
          matches++;
          console.log(full + ":" + (i + 1) + ": " + line.trim());
        }
      });
    }
  }
}

walk(".");
console.log("matches: " + matches);