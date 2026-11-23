import TabItem from "./TabItem";

export default function TabList({
  windows,
  selectedTabIds,
  onToggleSelection,
  onSwitchTab,
  onCloseTab,
  collapsedWindowIds,
  onToggleWindow,
  onCollapseAll,
  onExpandAll,
  isSearching
}) {
  if (windows.length === 0) {
    return <p className="empty-message">No tabs found.</p>;
  }

  const allCollapsed =
    !isSearching && windows.every((windowItem) => collapsedWindowIds.has(windowItem.id));
  const totalTabs = windows.reduce(
    (sum, windowItem) => sum + windowItem.tabs.length,
    0
  );

  return (
    <div className="tab-list">
      <div className="window-list-controls">
        <span className="list-hint">
          {windows.length} window{windows.length === 1 ? "" : "s"} · {totalTabs} tab
          {totalTabs === 1 ? "" : "s"}
        </span>
        <button
          onClick={allCollapsed ? onExpandAll : onCollapseAll}
          disabled={isSearching}
          title={isSearching ? "Clear search to collapse windows" : undefined}
        >
          {allCollapsed ? "Expand all" : "Collapse all"}
        </button>
      </div>

      {windows.map((windowItem, index) => {
        const isCollapsed = collapsedWindowIds.has(windowItem.id);
        const showTabs = !isCollapsed || isSearching;

        return (
          <section
            className={`window-section${index === 0 ? " is-focused" : ""}`}
            key={windowItem.id}
          >
            <h2>
              <button
                className="window-toggle"
                onClick={() => onToggleWindow(windowItem.id)}
                aria-expanded={showTabs}
                disabled={isSearching}
              >
                <span className="window-toggle-caret" aria-hidden="true">
                  {showTabs ? "▾" : "▸"}
                </span>
                Window {index + 1}
                <span className="count">
                  {windowItem.tabs.length} tab
                  {windowItem.tabs.length === 1 ? "" : "s"}
                </span>
              </button>
            </h2>

            {showTabs && (
              <ul>
                {windowItem.tabs.map((tab) => (
                  <TabItem
                    key={tab.id}
                    tab={tab}
                    isSelected={selectedTabIds.has(tab.id)}
                    onToggleSelection={onToggleSelection}
                    onSwitch={onSwitchTab}
                    onClose={onCloseTab}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
