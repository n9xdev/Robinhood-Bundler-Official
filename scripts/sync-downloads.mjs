/**
 * Copy desktop artifacts into public/downloads/ using the stable names
 * the marketing site links to.
 *
 * Prefers downloads.zip at the site root; falls back to ../robin/release/.
 */
import { execSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const zipPath = join(siteRoot, "downloads.zip");
const releaseDir = join(siteRoot, "..", "robin", "release");
const outDir = join(siteRoot, "public", "downloads");
const BRAND = "RobinhoodBundler";

/** @type {{ key: string; match: RegExp; out: string }[]} */
const MAP = [
  { key: "win-setup", match: /RobinhoodBundler.*setup\.exe$/i, out: `${BRAND}-setup.exe` },
  { key: "mac-dmg", match: /RobinhoodBundler.*\.dmg$/i, out: `${BRAND}.dmg` },
  { key: "mac-zip", match: /RobinhoodBundler.*macos\.zip$/i, out: `${BRAND}-mac.zip` },
  { key: "linux-appimage", match: /RobinhoodBundler.*\.AppImage$/i, out: `${BRAND}.AppImage` },
  { key: "linux-deb", match: /robinhoodbundler.*\.deb$/i, out: `${BRAND}.deb` },
];

const STALE = [`${BRAND}-portable.exe`];

function listFilesDeep(dir, depth = 0) {
  if (!existsSync(dir) || depth > 8) return [];
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) out.push(...listFilesDeep(full, depth + 1));
    else out.push(full);
  }
  return out;
}

function unzipToTemp(zip) {
  const tmp = join(tmpdir(), `robin-dl-${process.pid}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  execSync(`unzip -o -q ${JSON.stringify(zip)} -d ${JSON.stringify(tmp)}`);
  return tmp;
}

mkdirSync(outDir, { recursive: true });

let files = [];
let tmp = null;
let source = "";

if (existsSync(zipPath)) {
  tmp = unzipToTemp(zipPath);
  files = listFilesDeep(tmp);
  source = zipPath;
  console.log(`using ${basename(zipPath)}`);
} else {
  files = listFilesDeep(releaseDir);
  source = releaseDir;
  console.log(`using ${releaseDir}`);
}

if (files.length === 0) {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  console.error(`No artifacts in ${source}.`);
  process.exit(1);
}

/** @type {Record<string, { file: string; bytes: number }>} */
const published = {};

for (const rule of MAP) {
  if (published[rule.key]) continue;
  const hit = files.find((f) => rule.match.test(basename(f)));
  if (!hit) continue;
  const dest = join(outDir, rule.out);
  copyFileSync(hit, dest);
  published[rule.key] = { file: rule.out, bytes: statSync(dest).size };
  console.log(`copied ${basename(hit)} → downloads/${rule.out}`);
}

const shaSrc = files.find((f) => basename(f).toUpperCase() === "SHA256SUMS.TXT");
if (shaSrc) {
  copyFileSync(shaSrc, join(outDir, "SHA256SUMS.txt"));
  console.log("copied SHA256SUMS.txt");
}

for (const name of STALE) {
  const stale = join(outDir, name);
  if (existsSync(stale)) {
    unlinkSync(stale);
    console.log(`removed stale ${name}`);
  }
}

writeFileSync(
  join(outDir, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: basename(source),
      files: published,
    },
    null,
    2,
  ),
);

if (tmp) rmSync(tmp, { recursive: true, force: true });

const count = Object.keys(published).length;
console.log(`wrote downloads/manifest.json (${count} file(s))`);
if (count === 0) {
  console.error("No matching RobinhoodBundler artifacts found.");
  process.exit(1);
}
