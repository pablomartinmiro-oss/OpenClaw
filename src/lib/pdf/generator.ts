/**
 * PDF Generator — HTML to PDF conversion
 *
 * Uses puppeteer-core with system Chromium for HTML → PDF.
 * Singleton browser instance with auto-reconnect.
 *
 * For environments without Chromium (local dev), falls back to
 * returning null with a warning — PDF generation is optional.
 */

import { logger } from "@/lib/logger";

const log = logger.child({ module: "pdf-generator" });

export interface PdfOptions {
  format?: "A4" | "A3" | "Letter";
  printBackground?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
}

// Check if puppeteer-core is available
let puppeteerAvailable = true;

const CHROMIUM_PATHS = [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-extensions",
  "--no-first-run",
  "--mute-audio",
];

interface BrowserLike {
  version(): Promise<string>;
  newPage(): Promise<PageLike>;
  close(): Promise<void>;
  on(event: string, cb: () => void): void;
}

interface PageLike {
  setContent(html: string, opts: { waitUntil: string }): Promise<void>;
  pdf(opts: Record<string, unknown>): Promise<Uint8Array>;
  close(): Promise<void>;
}

let _browser: BrowserLike | null = null;
let _browserPromise: Promise<BrowserLike | null> | null = null;

async function getChromiumPath(): Promise<string | null> {
  const { existsSync } = await import("fs");
  for (const p of CHROMIUM_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function getBrowser(): Promise<BrowserLike | null> {
  if (!puppeteerAvailable) return null;

  if (_browser) {
    try {
      await _browser.version();
      return _browser;
    } catch {
      _browser = null;
      _browserPromise = null;
    }
  }

  if (_browserPromise) return _browserPromise;

  const launchPromise = (async (): Promise<BrowserLike | null> => {
    try {
      // Dynamic import — puppeteer-core may not be installed
      const puppeteer = await import(/* webpackIgnore: true */ "puppeteer-core" as string);
      const executablePath = await getChromiumPath();
      if (!executablePath) {
        log.warn("No Chromium found — PDF generation disabled");
        puppeteerAvailable = false;
        return null;
      }

      const browser = await puppeteer.default.launch({
        executablePath,
        args: LAUNCH_ARGS,
        headless: true,
      });

      _browser = browser as unknown as BrowserLike;
      (browser as unknown as BrowserLike).on("disconnected", () => {
        _browser = null;
        _browserPromise = null;
      });

      return _browser;
    } catch (err) {
      log.error({ err }, "Failed to launch Chromium");
      puppeteerAvailable = false;
      return null;
    }
  })();

  _browserPromise = launchPromise;

  try {
    const browser = await launchPromise;
    _browserPromise = null;
    return browser;
  } catch {
    _browserPromise = null;
    return null;
  }
}

/**
 * Convert HTML string to PDF buffer.
 * Returns null if Chromium is not available.
 */
export async function htmlToPdf(
  html: string,
  opts: PdfOptions = {}
): Promise<Buffer | null> {
  const {
    format = "A4",
    printBackground = true,
    margin = { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
  } = opts;

  const browser = await getBrowser();
  if (!browser) {
    log.warn("PDF generation skipped — no Chromium available");
    return null;
  }

  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfUint8 = await page.pdf({ format, printBackground, margin });
    return Buffer.from(pdfUint8);
  } finally {
    await page.close();
  }
}

/**
 * Close the browser singleton. Useful for graceful shutdown.
 */
export async function closePdfBrowser(): Promise<void> {
  if (_browser) {
    try {
      await _browser.close();
    } catch { /* ignore */ }
    _browser = null;
    _browserPromise = null;
  }
}
