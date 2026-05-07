export default function TabItem({
  tab,
  isSelected,
  onToggleSelection,
  onSwitch,
  onClose
}) {
  return (
    <li className="tab-item">
      <label className="tab-select">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(tab.id)}
        />
      </label>

      <button className="tab-main" onClick={() => onSwitch(tab)}>
        <span className="tab-title">{tab.title || "Untitled Tab"}</span>
        <span className="tab-url">{tab.url}</span>
      </button>

      <button className="tab-close" onClick={() => onClose(tab.id)}>
        Close
      </button>
    </li>
  );
}
