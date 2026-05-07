export default function SessionItem({ session, onRestore, onDelete }) {
  const createdDate = new Date(session.createdAt).toLocaleString();

  return (
    <li className="session-item">
      <div className="session-info">
        <strong>{session.name}</strong>
        <span>
          {session.tabs.length} tabs • {createdDate}
        </span>
      </div>

      <div className="session-actions">
        <button onClick={() => onRestore(session)}>Restore</button>
        <button onClick={() => onDelete(session.id)}>Delete</button>
      </div>
    </li>
  );
}
