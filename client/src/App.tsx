import { useState, useEffect, useCallback } from "react";
import { socket } from "./socket";
import { Landing } from "./components/Landing";
import { Session } from "./components/Session";

export interface ParticipantState {
  id: string;
  name: string;
  voted: boolean;
  vote: number | null;
  observer: boolean;
}

export interface SessionState {
  id: string;
  participants: ParticipantState[];
  revealed: boolean;
}

export function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    socket.on("session-updated", (state: SessionState) => {
      setSessionState(state);

      const me = state.participants.find((p) => p.id === socket.id);
      if (me && !state.revealed && !me.voted) {
        setMyVote(null);
      }
    });

    // Check URL hash for session ID on mount
    const hash = window.location.hash.slice(1);
    if (hash.length > 0) {
      joinSession(hash);
    }

    return () => {
      socket.off("session-updated");
    };
  }, []);

  const createSession = useCallback(() => {
    socket.emit("create-session", (data: { sessionId: string }) => {
      joinSession(data.sessionId);
    });
  }, []);

  const joinSession = useCallback((id: string) => {
    setJoinError(null);
    socket.emit("join-session", id, (data: { ok: boolean; error?: string }) => {
      if (data.ok) {
        setSessionId(id);
        window.location.hash = id;
      } else {
        setJoinError(data.error || "Could not join session");
      }
    });
  }, []);

  const vote = useCallback((value: number) => {
    setMyVote(value);
    socket.emit("vote", value);
  }, []);

  const reset = useCallback(() => {
    setMyVote(null);
    socket.emit("reset");
  }, []);

  return (
    <>
      <h1>Pointr</h1>
      <div className="container">
        {!sessionId ? (
          <Landing onCreateSession={createSession} onJoinSession={joinSession} error={joinError} />
        ) : (
          sessionState && (
            <Session
              sessionId={sessionId}
              state={sessionState}
              myVote={myVote}
              socketId={socket.id!}
              onVote={vote}
              onReset={reset}
            />
          )
        )}
      </div>
      <footer>
        &copy; {new Date().getFullYear()} Nick Cacace &middot;{" "}
        <a href="https://github.com/BearAlliance/pointr">Source on GitHub</a>
      </footer>
    </>
  );
}
