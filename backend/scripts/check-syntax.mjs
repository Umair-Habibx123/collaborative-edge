// Parses every backend .js file with `node --check`, so CI catches syntax errors
// without needing a database. Run with: npm run check
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(m?js)$/.test(name)) files.push(path);
  }
})(root);

let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    failed++;
    console.error(`Syntax error in ${file}\n${error.stderr}`);
  }
}
console.log(`Checked ${files.length} files, ${failed} with errors.`);
process.exit(failed ? 1 : 0);
