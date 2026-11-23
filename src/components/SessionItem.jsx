import Favicon from "./Favicon";

export default function SessionItem({ session, onRestore, onDelete, onEdit }) {
  const createdDate = new Date(session.createdAt).toLocaleString();
  const tabs = session.tabs || [];

  return (
    <li className="session-item">
      <span className="favicon-stack" aria-hidden="true">
        {tabs.slice(0, 3).map((tab, index) => (
          <Favicon
            key={tab.id || `${tab.url}-${index}`}
            url={tab.url}
            favIconUrl={tab.favIconUrl}
          />
        ))}
      </span>

      <div className="session-info">
        <strong>{session.name}</strong>
        <span>
          {tabs.length} tab{tabs.length === 1 ? "" : "s"} · {createdDate}
        </span>
      </div>

      <div className="session-actions">
        <button onClick={() => onRestore(session)}>Restore</button>
        <button onClick={() => onEdit(session)}>Edit</button>
        <button onClick={() => onDelete(session.id)}>Delete</button>
      </div>
    </li>
  );
}
