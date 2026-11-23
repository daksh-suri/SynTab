import { isChromeExtension } from "./chromeApi";
import { normalizeSession } from "./session";

const SESSIONS_KEY = "savedSessions";

const DEV_SEED_SESSIONS = [
  {
    id: "dev-session-work",
    name: "Work",
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
    tabs: [
      { id: "dev-tab-work-1", title: "React Documentation", url: "https://react.dev", favIconUrl: "https://react.dev/favicon.ico" },
      { id: "dev-tab-work-2", title: "GitHub", url: "https://github.com", favIconUrl: "https://github.com/favicon.ico" },
      { id: "dev-tab-work-3", title: "Figma", url: "https://figma.com", favIconUrl: "https://www.figma.com/favicon.ico" }
    ]
  },
  {
    id: "dev-session-reading",
    name: "Reading",
    createdAt: "2026-02-03T18:00:00.000Z",
    updatedAt: "2026-02-03T18:00:00.000Z",
    tabs: [
      { id: "dev-tab-reading-1", title: "MDN Web Docs", url: "https://developer.mozilla.org", favIconUrl: "https://developer.mozilla.org/favicon.ico" },
      { id: "dev-tab-reading-2", title: "MDN Web Docs (again)", url: "https://developer.mozilla.org", favIconUrl: "https://developer.mozilla.org/favicon.ico" }
    ]
  }
];

function migrateSessions(sessions) {
  const normalized = sessions.map(normalizeSession);
  const changed = JSON.stringify(sessions) !== JSON.stringify(normalized);
  return { normalized, changed };
}

function backfillSeedIcons(sessions) {
  const iconsByUrl = new Map();

  DEV_SEED_SESSIONS.forEach((session) => {
    session.tabs.forEach((tab) => {
      if (tab.favIconUrl) iconsByUrl.set(tab.url, tab.favIconUrl);
    });
  });

  let changed = false;
  const next = sessions.map((session) => ({
    ...session,
    tabs: (session.tabs || []).map((tab) => {
      if (tab.favIconUrl || !iconsByUrl.has(tab.url)) return tab;
      changed = true;
      return { ...tab, favIconUrl: iconsByUrl.get(tab.url) };
    })
  }));

  return { next, changed };
}

export async function getSavedSessions() {
  if (!isChromeExtension()) {
    const saved = localStorage.getItem(SESSIONS_KEY);

    if (saved === null) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(DEV_SEED_SESSIONS));
      return DEV_SEED_SESSIONS;
    }

    const sessions = JSON.parse(saved);
    const { normalized, changed } = migrateSessions(sessions);
    const backfilled = backfillSeedIcons(normalized);

    if (changed || backfilled.changed) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(backfilled.next));
    }

    return backfilled.next;
  }

  const result = await chrome.storage.local.get(SESSIONS_KEY);
  const sessions = result[SESSIONS_KEY] || [];
  const { normalized, changed } = migrateSessions(sessions);

  if (changed) {
    await chrome.storage.local.set({
      [SESSIONS_KEY]: normalized
    });
  }

  return normalized;
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
