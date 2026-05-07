import { isChromeExtension } from "./chromeApi";

const SESSIONS_KEY = "savedSessions";

export async function getSavedSessions() {
  if (!isChromeExtension()) {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  const result = await chrome.storage.local.get(SESSIONS_KEY);
  return result[SESSIONS_KEY] || [];
}

export async function saveSessions(sessions) {
  if (!isChromeExtension()) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return;
  }

  await chrome.storage.local.set({
    [SESSIONS_KEY]: sessions
  });
}
