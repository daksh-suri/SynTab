import React, { useEffect, useMemo, useState } from 'react'
import { getAllWindowsWithTabs,closeTab,closeTabs,restoreSessionInNewWindow,switchToTab } from './utils/chromeApi';
import { createSession } from './utils/session';
import { getSavedSessions, saveSessions } from './utils/storage.js';
import SearchBar from './components/SearchBar';
import TabList from './components/TabList';
import SessionList from './components/SessionList';

const App = () => {
  const [windows, setWindows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTabIds, setSelectedTabIds] = useState(new Set());
  const [sessionName, setSessionName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadTabs() {
    const browserWindows = await getAllWindowsWithTabs();
    setWindows(browserWindows);
  }

  async function loadSessions() {
    const saved = await getSavedSessions();
    setSessions(saved);
  }

  useEffect(() => {
    // loading the current tabs
    loadTabs();
    // loading the previous sessions
    loadSessions();
  }, []);

  const filteredWindows = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return windows;

    return windows
      .map(windowItem => {
        const matchingTabs = windowItem.tabs?.filter(tab => {
          const title = tab.title?.tolowerCase() || ""
          const url = tab.url?.tolowerCase() || ""
          return title.includes(normalizedSearch) || url.includes(normalizedSearch);
        })
        return {
          ...windowItem,
          tabs: matchingTabs
        }
      })
      .filter(windowItem => windowItem.tabs.lenght > 0)
  }, [windows, searchTerm]);

  function toggleTabSelection(tabId) {
    setSelectedTabIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);

      if (nextSelectedIds.has(tabId)) {
        nextSelectedIds.delete(tabId);
      } else {
        nextSelectedIds.add(tabId);
      }

      return nextSelectedIds;
    });
  }

  async function handleSwitchTab(tab) {
    await switchToTab(tab);
  }

  async function handleCloseTab(tabId) {
    await closeTab(tabId);
    setSelectedTabIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);
      nextSelectedIds.delete(tabId);
      return nextSelectedIds;
    });
    await loadTabs();
  }
  async function handleCloseSelectedTabs() {
    const tabIds = Array.from(selectedTabIds);

    if (tabIds.length === 0) {
      setStatusMessage("Select at least one tab first.");
      return;
    }

    await closeTabs(tabIds);
    setSelectedTabIds(new Set());
    setStatusMessage(`Closed ${tabIds.length} selected tab(s).`);
    await loadTabs();
  }

  async function handleSaveSession(event) {
    event.preventDefault();

    if (!sessionName.trim()) {
      setStatusMessage("Enter a session name first.");
      return;
    }

    const newSession = createSession(sessionName, windows);

    if (newSession.tabs.length === 0) {
      setStatusMessage("No restorable tabs found.");
      return;
    }

    const updatedSessions = [newSession, ...sessions];

    await saveSessions(updatedSessions);
    setSessions(updatedSessions);
    setSessionName("");
    setStatusMessage(`Saved session: ${newSession.name}`);
  }

  async function handleRestoreSession(session) {
    await restoreSessionInNewWindow(session);
    setStatusMessage(`Restored session: ${session.name}`);
  }

  async function handleDeleteSession(sessionId) {
    const updatedSessions = sessions.filter((session) => session.id !== sessionId);

    await saveSessions(updatedSessions);
    setSessions(updatedSessions);
    setStatusMessage("Session deleted.");
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>SynTab</h1>
        <button onClick={loadTabs}>Refresh</button>
      </header>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <section className="bulk-actions">
        <span>{selectedTabIds.size} selected</span>
        <button onClick={handleCloseSelectedTabs}>Close Selected</button>
      </section>

      <TabList
        windows={filteredWindows}
        selectedTabIds={selectedTabIds}
        onToggleSelection={toggleTabSelection}
        onSwitchTab={handleSwitchTab}
        onCloseTab={handleCloseTab}
      />

      <section className="sessions-section">
        <h2>Saved Sessions</h2>

        <form className="save-session-form" onSubmit={handleSaveSession}>
          <input
            type="text"
            value={sessionName}
            onChange={(event) => setSessionName(event.target.value)}
            placeholder="Session name"
          />
          <button type="submit">Save All Tabs</button>
        </form>

        <SessionList
          sessions={sessions}
          onRestoreSession={handleRestoreSession}
          onDeleteSession={handleDeleteSession}
        />
      </section>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </main>
  );
}

export default App;