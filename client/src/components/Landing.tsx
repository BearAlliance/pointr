import { useState, type KeyboardEvent, type ClipboardEvent } from "react";
import styles from "./Landing.module.css";

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

  const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    const match = text.match(/\/play\/([A-Za-z0-9]+)/);
    if (match) {
      e.preventDefault();
      setJoinId(match[1]);
    }
  };

  return (
    <div className={styles.landing}>
      <button className={styles.createBtn} onClick={onCreateSession}>Create Session</button>
      <div className={styles.divider}>or</div>
      <div className={styles.joinRow}>
        <input
          className={styles.joinInput}
          type="text"
          placeholder="ABC123"
          maxLength={6}
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        <button className={styles.joinBtn} onClick={handleJoin}>Join</button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
