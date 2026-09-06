# Robinhood Bundler — download site

Static Vite + React marketing site. Users download RobinhoodBundler for Windows, Linux, and macOS (Apple Silicon).

```bash
npm install
npm run sync-downloads   # prefer downloads.zip, else ../robin/release
npm run dev
npm run build
```

Stable download paths:

| File | Platform |
|---|---|
| `/downloads/RobinhoodBundler-setup.exe` | Windows installer |
| `/downloads/RobinhoodBundler.AppImage` | Linux AppImage |
| `/downloads/RobinhoodBundler.deb` | Debian / Ubuntu |
| `/downloads/RobinhoodBundler.dmg` | macOS (Apple Silicon) |
| `/downloads/RobinhoodBundler-mac.zip` | macOS zip fallback |

Binaries in `public/downloads/` and `downloads.zip` are gitignored. Recopy them after each desktop rebuild.
