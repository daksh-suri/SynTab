import React, { useEffect, useMemo, useState } from 'react'
import { getAllWindowsWithTabs,closeTab,closeTabs,openTab,restoreSessionInNewWindow,switchToTab } from './utils/chromeApi';
import { createId, createSession, resolveUniqueSessionName } from './utils/session';
import { getSavedSessions, saveSessions } from './utils/storage.js';
import SearchBar from './components/SearchBar';
import TabList from './components/TabList';
import SessionList from './components/SessionList';
import SessionEditor from './components/SessionEditor';

const App = () => {
  const [windows, setWindows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTabIds, setSelectedTabIds] = useState(new Set());
  const [sessionName, setSessionName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [collapsedWindowIds, setCollapsedWindowIds] = useState(new Set());

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
          const title = tab.title?.toLowerCase() || ""
          const url = tab.url?.toLowerCase() || ""
          return title.includes(normalizedSearch) || url.includes(normalizedSearch);
        })
        return {
          ...windowItem,
          tabs: matchingTabs
        }
      })
      .filter(windowItem => windowItem.tabs.length > 0)
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

  function handleClearSelection() {
    setSelectedTabIds(new Set());
  }

  function toggleWindowCollapsed(windowId) {
    setCollapsedWindowIds((currentCollapsedIds) => {
      const nextCollapsedIds = new Set(currentCollapsedIds);

      if (nextCollapsedIds.has(windowId)) {
        nextCollapsedIds.delete(windowId);
      } else {
        nextCollapsedIds.add(windowId);
      }

      return nextCollapsedIds;
    });
  }

  function collapseAllWindows() {
    setCollapsedWindowIds(new Set(windows.map((windowItem) => windowItem.id)));
  }

  function expandAllWindows() {
    setCollapsedWindowIds(new Set());
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

  async function saveSession(saveScope) {
    if (!sessionName.trim()) {
      setStatusMessage("Enter a session name first.");
      return;
    }

    const newSession = createSession(
      resolveUniqueSessionName(sessionName, sessions),
      windows,
      saveScope === "selected" ? selectedTabIds : null
    );

    if (newSession.tabs.length === 0) {
      setStatusMessage(saveScope === "selected" ? "No restorable tabs selected." : "No restorable tabs found.");
      return;
    }

    const updatedSessions = [newSession, ...sessions];

    await saveSessions(updatedSessions);
    setSessions(updatedSessions);
    setSessionName("");
    if (saveScope === "selected") {
      setSelectedTabIds(new Set());
    }
    setStatusMessage(`Saved session: ${newSession.name} (${newSession.tabs.length} tab(s)).`);
  }

  function handleSaveSession(event) {
    event.preventDefault();

    const saveScope = event.nativeEvent?.submitter?.dataset?.scope || "all";
    saveSession(saveScope);
  }

  function handleSessionNameKeyDown(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (selectedTabIds.size === 0) {
      setStatusMessage("Select at least one tab first.");
      return;
    }

    saveSession("selected");
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

  function handleStartEdit(session) {
    setEditingSessionId(session.id);
    setDraft({
      name: session.name,
      tabs: session.tabs.map((tab) => ({ ...tab }))
    });
    setStatusMessage("");
  }

  function handleCancelEdit() {
    setEditingSessionId(null);
    setDraft(null);
  }

  function handleChangeDraftName(name) {
    setDraft((currentDraft) => ({ ...currentDraft, name }));
  }

  function handleAddTabsToDraft(tabs) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      tabs: [
        ...currentDraft.tabs,
        ...tabs.map((tab) => ({
          id: createId(),
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl
        }))
      ]
    }));
  }

  function handleRemoveDraftTab(tabId) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      tabs: currentDraft.tabs.filter((tab) => tab.id !== tabId)
    }));
  }

  function handleMoveDraftTab(index, offset) {
    setDraft((currentDraft) => {
      const targetIndex = index + offset;

      if (targetIndex < 0 || targetIndex >= currentDraft.tabs.length) {
        return currentDraft;
      }

      const tabs = [...currentDraft.tabs];
      [tabs[index], tabs[targetIndex]] = [tabs[targetIndex], tabs[index]];
      return { ...currentDraft, tabs };
    });
  }

  async function handleOpenSessionTab(tab) {
    await openTab(tab.url);
  }

  async function handleCommitEdit() {
    if (!draft) return;

    if (!draft.name.trim()) {
      setStatusMessage("Enter a session name first.");
      return;
    }

    if (draft.tabs.length === 0) {
      setStatusMessage("Session needs at least one tab.");
      return;
    }

    const otherSessions = sessions.filter((session) => session.id !== editingSessionId);
    const name = resolveUniqueSessionName(draft.name, otherSessions);

    const updatedSessions = sessions.map((session) =>
      session.id === editingSessionId
        ? {
            ...session,
            name,
            updatedAt: new Date().toISOString(),
            tabs: draft.tabs
          }
        : session
    );

    await saveSessions(updatedSessions);
    setSessions(updatedSessions);
    setEditingSessionId(null);
    setDraft(null);
    setStatusMessage(`Updated session: ${name}`);
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>SynTab</h1>
        <button onClick={loadTabs}>Refresh</button>
      </header>

      {editingSessionId ? (
        <section className="sessions-section">
          <h2>Editing Session</h2>

          <SessionEditor
            draft={draft}
            sessions={sessions.filter((session) => session.id !== editingSessionId)}
            windows={windows}
            onChangeName={handleChangeDraftName}
            onAddTabs={handleAddTabsToDraft}
            onRemoveTab={handleRemoveDraftTab}
            onMoveTab={handleMoveDraftTab}
            onOpenTab={handleOpenSessionTab}
            onCancel={handleCancelEdit}
            onDone={handleCommitEdit}
          />
        </section>
      ) : (
        <>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          {selectedTabIds.size > 0 && (
            <section className="bulk-actions">
              <span>{selectedTabIds.size} selected</span>
              <button onClick={handleClearSelection}>Clear</button>
              <button className="primary" onClick={handleCloseSelectedTabs}>Close Selected</button>
            </section>
          )}

          <TabList
            windows={filteredWindows}
            selectedTabIds={selectedTabIds}
            onToggleSelection={toggleTabSelection}
            onSwitchTab={handleSwitchTab}
            onCloseTab={handleCloseTab}
            collapsedWindowIds={collapsedWindowIds}
            onToggleWindow={toggleWindowCollapsed}
            onCollapseAll={collapseAllWindows}
            onExpandAll={expandAllWindows}
            isSearching={searchTerm.trim().length > 0}
          />

          <section className="sessions-section">
            <h2>Saved Sessions</h2>

            <form className="save-session-form" onSubmit={handleSaveSession}>
              <input
                type="text"
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                onKeyDown={handleSessionNameKeyDown}
                placeholder="Session name"
              />
              <button type="submit">Save All Tabs</button>
              {selectedTabIds.size > 0 && (
                <button className="primary" type="submit" data-scope="selected">Save Selected Tabs</button>
              )}
            </form>

            <SessionList
              sessions={sessions}
              onRestoreSession={handleRestoreSession}
              onDeleteSession={handleDeleteSession}
              onEditSession={handleStartEdit}
            />
          </section>
        </>
      )}

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </main>
  );
}

export default App;