import { useEffect, useMemo, useState } from "react";
import {
  BRAND,
  DOWNLOADS,
  SUPPORT_LABEL,
  SUPPORT_URL,
  detectPlatform,
  heroDownload,
  platformLabel,
  type DownloadItem,
} from "./downloads";

const FEATURES = [
  {
    title: "Launch",
    body: "Configure token metadata, logo, wallets, and the buy plan in one guided flow — then fire the bundle.",
  },
  {
    title: "Wallets",
    body: "Generate, fund, and manage bundler and volume wallets on your machine. The deployer key lives here, not on Launch.",
  },
  {
    title: "Volume",
    body: "Optional activity bots with per-bot controls. You choose the strategy and when to trigger it.",
  },
  {
    title: "Gather",
    body: "Claim creator fees, sell, unwrap, and sweep funds back to the deployer when the run is done.",
  },
  {
    title: "Dry / Live",
    body: "Rehearse every step in dry-run before spending ETH. Switch to Live only when you are ready.",
  },
];

async function fileExists(href: string): Promise<boolean> {
  try {
    const res = await fetch(href, { method: "HEAD" });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    // SPA hosts rewrite missing files to index.html — treat that as absent.
    if (type.includes("text/html")) return false;
    return true;
  } catch {
    return false;
  }
}

function DownloadCard({
  item,
  available,
}: {
  item: DownloadItem;
  available: boolean | null;
}) {
  const comingSoon = available === false;
  return (
    <article className="dl-card">
      <div className="dl-card-top">
        <span className="os-pill">{item.platform}</span>
        {item.recommended && !comingSoon ? (
          <span className="rec-pill">Recommended</span>
        ) : null}
        {comingSoon ? <span className="soon-pill">Coming soon</span> : null}
      </div>
      <h3>{item.title}</h3>
      <p>{item.blurb}</p>
      <code className="filename">{item.file}</code>
      {comingSoon ? (
        <span className="btn btn-ghost" aria-disabled="true">
          Coming soon
        </span>
      ) : (
        <a className="btn btn-primary" href={item.href} download={item.file}>
          Download
        </a>
      )}
    </article>
  );
}

export default function App() {
  const platform = useMemo(() => detectPlatform(), []);
  const hero = heroDownload(platform);
  const [available, setAvailable] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      DOWNLOADS.map(async (item) => [item.id, await fileExists(item.href)] as const),
    ).then((entries) => {
      if (cancelled) return;
      setAvailable(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const heroReady = available[hero.id] !== false;
  const heroHref = heroReady ? hero.href : "#download";

  return (
    <>
      <header className="nav">
        <a className="brand" href="#top">
          <img src="/feather.svg" alt="" width={22} height={22} />
          <span>Robinhood Bundler</span>
        </a>
        <nav>
          <a href="#download">Download</a>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
            Support
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">Official desktop app</p>
          <h1>{BRAND}</h1>
          <p className="lede">
            Professional toolkit for launching and managing tokens on Pons ·
            Robinhood Chain. One polished app for launch, wallets, volume, and
            recovery — without juggling scripts or scattered configs.
          </p>
          <div className="hero-actions">
            {heroReady ? (
              <a className="btn btn-primary btn-lg" href={heroHref} download={hero.file}>
                Download for {platformLabel(platform)}
              </a>
            ) : (
              <a className="btn btn-primary btn-lg" href="#download">
                {platform === "macos" ? "macOS coming soon" : "See downloads"}
              </a>
            )}
            <a className="btn btn-ghost btn-lg" href="#download">
              All platforms
            </a>
          </div>
          <p className="hero-note">
            {heroReady
              ? `Primary build: ${hero.file}`
              : "macOS disk image is not published yet. Windows and Linux are available below."}
          </p>
        </section>

        <section id="download" className="section">
          <h2>Download</h2>
          <p className="section-lead">
            Windows, Linux, and macOS (Apple Silicon) builds are ready. Prefer
            the installer, AppImage, or <code>.dmg</code> for your platform.
          </p>
          <div className="dl-grid">
            {DOWNLOADS.map((item) => (
              <DownloadCard
                key={item.id}
                item={item}
                available={
                  item.id in available ? available[item.id] : null
                }
              />
            ))}
          </div>
        </section>

        <section className="section" id="features">
          <h2>What you get</h2>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feat-card">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section disclaimer" id="disclaimer">
          <h2>Disclaimer</h2>
          <p>
            Robinhood Bundler is independent software. It is not affiliated
            with, endorsed by, or sponsored by Pons or Robinhood. Private keys
            and wallet files stay on your machine. Token launches are high risk
            — never spend more than you can afford to lose.
          </p>
          <p>
            Support: Telegram{" "}
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
              {SUPPORT_LABEL}
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>© RobinBundler</span>
        <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
          Support · {SUPPORT_LABEL}
        </a>
      </footer>
    </>
  );
}
