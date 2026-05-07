import TabItem from "./TabItem";

export default function TabList({
  windows,
  selectedTabIds,
  onToggleSelection,
  onSwitchTab,
  onCloseTab
}) {
  if (windows.length === 0) {
    return <p className="empty-message">No tabs found.</p>;
  }

  return (
    <div className="tab-list">
      {windows.map((windowItem, index) => (
        <section className="window-section" key={windowItem.id}>
          <h2>Window {index + 1}</h2>

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
        </section>
      ))}
    </div>
  );
}
