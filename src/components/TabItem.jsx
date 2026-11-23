import Favicon from "./Favicon";

export default function TabItem({
  tab,
  isSelected,
  onToggleSelection,
  onSwitch,
  onClose
}) {
  return (
    <li className={`tab-item${isSelected ? " is-selected" : ""}`}>
      <input
        className="tab-check"
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(tab.id)}
        aria-label={`Select ${tab.title || tab.url}`}
      />

      <Favicon url={tab.url} favIconUrl={tab.favIconUrl} />

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
