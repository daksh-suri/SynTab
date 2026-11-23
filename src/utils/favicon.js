import { isChromeExtension } from "./chromeApi";
import { isRestorableUrl } from "./session";

const TONES = ["blue", "violet", "green", "slate", "amber", "rose"];

function isUsableIconSource(value) {
  return (
    typeof value === "string" &&
    (value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:"))
  );
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function hashText(text) {
  let hash = 0;

  for (let index = 0; index < text.length; index++) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getFaviconMeta(url) {
  const hostname = getHostname(url);
  const letter = hostname.charAt(0).toUpperCase() || "?";

  return {
    letter,
    tone: TONES[hashText(hostname) % TONES.length]
  };
}

export function getFaviconSources(url, favIconUrl) {
  const sources = [];

  if (isUsableIconSource(favIconUrl)) {
    sources.push(favIconUrl);
  }

  if (isChromeExtension() && isRestorableUrl(url)) {
    sources.push(
      chrome.runtime.getURL(
        `/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`
      )
    );
  }

  return sources;
}
