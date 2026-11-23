import { useState } from "react";
import { isRestorableUrl, resolveUniqueSessionName } from "../utils/session";
import Favicon from "./Favicon";

export default function SessionEditor({
  draft,
  sessions,
  windows,
  onChangeName,
  onAddTabs,
  onRemoveTab,
  onMoveTab,
  onOpenTab,
  onCancel,
  onDone
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [addSelection, setAddSelection] = useState(new Set());
  const [filterTerm, setFilterTerm] = useState("");

  const normalizedFilter = filterTerm.toLowerCase().trim();
  const isFiltering = normalizedFilter.length > 0;
  const visibleTabs = draft.tabs
    .map((tab, index) => ({ tab, index }))
    .filter(({ tab }) => {
      if (!isFiltering) return true;

      const title = tab.title?.toLowerCase() || "";
      const url = tab.url?.toLowerCase() || "";
      return title.includes(normalizedFilter) || url.includes(normalizedFilter);
    });

  const seenUrls = new Set(draft.tabs.map((tab) => tab.url));
  const pickerTabs = windows
    .flatMap((windowItem) => windowItem.tabs || [])
    .filter((tab) => {
      if (!isRestorableUrl(tab.url) || seenUrls.has(tab.url)) return false;
      seenUrls.add(tab.url);
      return true;
    });

  const trimmedName = draft.name.trim();
  const resolvedName = trimmedName ? resolveUniqueSessionName(draft.name, sessions) : "";

  function toggleAddSelection(url) {
    setAddSelection((currentSelection) => {
      const nextSelection = new Set(currentSelection);

      if (nextSelection.has(url)) {
        nextSelection.delete(url);
      } else {
        nextSelection.add(url);
      }

      return nextSelection;
    });
  }

  function handleAddSelected() {
    const selectedTabs = pickerTabs.filter((tab) => addSelection.has(tab.url));
    onAddTabs(selectedTabs);
    setAddSelection(new Set());
    setShowPicker(false);
  }

  return (
    <div className="session-editor">
      <label className="session-editor-name">
        <span>Name</span>
        <input
          type="text"
          value={draft.name}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Session name"
          autoFocus
        />
      </label>

      {resolvedName && resolvedName !== trimmedName && (
        <p className="name-hint">Will save as: {resolvedName}</p>
      )}

      <h3 className="editor-heading">Tabs ({draft.tabs.length})</h3>

      <input
        className="editor-filter"
        type="search"
        value={filterTerm}
        onChange={(event) => setFilterTerm(event.target.value)}
        placeholder="Filter this session's tabs"
      />

      {isFiltering && <p className="editor-filter-hint">Clear filter to reorder.</p>}

      {draft.tabs.length === 0 ? (
        <p className="empty-message">No tabs in this session.</p>
      ) : visibleTabs.length === 0 ? (
        <p className="empty-message">No tabs match.</p>
      ) : (
        <ul className="editor-tabs">
          {visibleTabs.map(({ tab, index }) => (
            <li className="editor-tab-row" key={tab.id}>
              <Favicon url={tab.url} favIconUrl={tab.favIconUrl} />
              <div className="editor-tab-info">
                <span className="tab-title">{tab.title || "Untitled Tab"}</span>
                <span className="tab-url">{tab.url}</span>
              </div>

              <div className="editor-tab-actions">
                <button
                  onClick={() => onMoveTab(index, -1)}
                  disabled={isFiltering || index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMoveTab(index, 1)}
                  disabled={isFiltering || index === draft.tabs.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button onClick={() => onOpenTab(tab)}>Open</button>
                <button onClick={() => onRemoveTab(tab.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        className="picker-toggle"
        onClick={() => setShowPicker((current) => !current)}
        aria-expanded={showPicker}
      >
        {showPicker ? "Hide picker" : "Select open tabs…"}
      </button>

      {showPicker && (
        <div className="tab-picker">
          {pickerTabs.length === 0 ? (
            <p className="empty-message">No other open tabs to add.</p>
          ) : (
            <>
              <ul>
                {pickerTabs.map((tab) => (
                  <li key={tab.url}>
                    <label>
                      <input
                        type="checkbox"
                        checked={addSelection.has(tab.url)}
                        onChange={() => toggleAddSelection(tab.url)}
                      />
                      <span>{tab.title || tab.url}</span>
                    </label>
                  </li>
                ))}
              </ul>

              <button onClick={handleAddSelected} disabled={addSelection.size === 0}>
                Add {addSelection.size} tab{addSelection.size === 1 ? "" : "s"}
              </button>
            </>
          )}
        </div>
      )}

      <div className="editor-actions">
        <button onClick={onCancel}>Cancel</button>
        <button className="primary" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}
