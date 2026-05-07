import SessionItem from "./SessionItem";

export default function SessionList({ sessions, onRestoreSession, onDeleteSession }) {
  if (sessions.length === 0) {
    return <p className="empty-message">No saved sessions yet.</p>;
  }

  return (
    <ul className="session-list">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          onRestore={onRestoreSession}
          onDelete={onDeleteSession}
        />
      ))}
    </ul>
  );
}
