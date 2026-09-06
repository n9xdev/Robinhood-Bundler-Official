export type Platform = "windows" | "linux" | "macos" | "other";

export type DownloadItem = {
  id: string;
  file: string;
  href: string;
  platform: Exclude<Platform, "other">;
  title: string;
  blurb: string;
  recommended?: boolean;
};

export const BRAND = "Robinhood Bundler (Official)";
export const SUPPORT_URL = "https://t.me/bosonax";
export const SUPPORT_LABEL = "Bo$onaX";

export const DOWNLOADS: DownloadItem[] = [
  {
    id: "win-setup",
    file: "RobinhoodBundler-setup.exe",
    href: "/downloads/RobinhoodBundler-setup.exe",
    platform: "windows",
    title: "Windows installer",
    blurb: "NSIS setup for Windows 10/11 (x64).",
    recommended: true,
  },
  {
    id: "linux-appimage",
    file: "RobinhoodBundler.AppImage",
    href: "/downloads/RobinhoodBundler.AppImage",
    platform: "linux",
    title: "Linux AppImage",
    blurb: "Run on most distros. chmod +x, then launch.",
    recommended: true,
  },
  {
    id: "linux-deb",
    file: "RobinhoodBundler.deb",
    href: "/downloads/RobinhoodBundler.deb",
    platform: "linux",
    title: "Debian / Ubuntu",
    blurb: "Native .deb package for amd64.",
  },
  {
    id: "mac-dmg",
    file: "RobinhoodBundler.dmg",
    href: "/downloads/RobinhoodBundler.dmg",
    platform: "macos",
    title: "macOS",
    blurb: "Disk image for Apple Silicon.",
    recommended: true,
  },
  {
    id: "mac-zip",
    file: "RobinhoodBundler-mac.zip",
    href: "/downloads/RobinhoodBundler-mac.zip",
    platform: "macos",
    title: "macOS zip",
    blurb: "App bundle fallback for Apple Silicon. Prefer the .dmg.",
  },
];

export function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/windows|win32|win64|wow64/.test(ua)) return "windows";
  if (/iphone|ipad|ipod|macintosh|mac os/.test(ua)) return "macos";
  if (/linux|x11|android/.test(ua)) return "linux";
  return "other";
}

export function heroDownload(platform: Platform): DownloadItem {
  if (platform === "windows") {
    return DOWNLOADS.find((d) => d.id === "win-setup")!;
  }
  if (platform === "macos") {
    return DOWNLOADS.find((d) => d.id === "mac-dmg")!;
  }
  return DOWNLOADS.find((d) => d.id === "linux-appimage")!;
}

export function platformLabel(platform: Platform): string {
  if (platform === "windows") return "Windows";
  if (platform === "macos") return "macOS";
  if (platform === "linux") return "Linux";
  return "your system";
}
