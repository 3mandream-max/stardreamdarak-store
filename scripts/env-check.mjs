import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envLocalPath = path.join(rootDir, ".env.local");

function parseEnvFile(content) {
  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

let token = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? "";

if (!token && fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf8");
  const parsed = parseEnvFile(content);
  token = (parsed.BLOB_READ_WRITE_TOKEN ?? "").trim();
}

if (!token) {
  console.error("[env:check] BLOB_READ_WRITE_TOKEN이 비어 있습니다.");
  console.error("[env:check] .env.local에 토큰을 설정하세요. (Vercel Project Settings -> Environment Variables)");
  process.exit(1);
}

console.log("[env:check] OK: BLOB_READ_WRITE_TOKEN이 설정되어 있습니다.");

