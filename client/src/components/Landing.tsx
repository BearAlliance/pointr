import { useState, type KeyboardEvent } from "react";

interface LandingProps {
  onCreateSession: () => void;
  onJoinSession: (id: string) => void;
  error: string | null;
}

export function Landing({ onCreateSession, onJoinSession, error }: LandingProps) {
  const [joinId, setJoinId] = useState("");

  const handleJoin = () => {
    const id = joinId.trim();
    if (id) onJoinSession(id);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="landing">
      <button onClick={onCreateSession}>Create Session</button>
      <div className="join-row">
        <input
          type="text"
          placeholder="ABC123"
          maxLength={6}
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleJoin}>Join</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
