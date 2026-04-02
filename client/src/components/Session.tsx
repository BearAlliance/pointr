import type { SessionState } from "../App";
import { NameInput } from "./NameInput";
import { ObserverToggle } from "./ObserverToggle";
import { VoteButtons } from "./VoteButtons";
import { ParticipantList } from "./ParticipantList";
import { ReadyBanner } from "./ReadyBanner";
import { socket } from "../socket";
import { useState } from "react";

interface SessionProps {
  sessionId: string;
  state: SessionState;
  myVote: number | null;
  socketId: string;
  onVote: (value: number) => void;
  onReset: () => void;
}

export function Session({ sessionId, state, myVote, socketId, onVote, onReset }: SessionProps) {
  const [copied, setCopied] = useState(false);
  const me = state.participants.find((p) => p.id === socketId);
  const isObserver = me?.observer ?? false;

  const copySessionId = () => {
    const url = window.location.origin + "/#" + sessionId;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const voters = state.participants.filter((p) => !p.observer);
  const allVoted = !state.revealed && voters.length > 0 && voters.every((p) => p.voted);

  return (
    <div className="session">
      <div className="session-id">
        Session:{" "}
        <code onClick={copySessionId}>{sessionId}</code>
        {copied && <span className="copied">Copied!</span>}
      </div>

      <NameInput />
      <ObserverToggle isObserver={isObserver} />

      {!isObserver && <VoteButtons myVote={myVote} onVote={onVote} />}

      <ParticipantList
        participants={state.participants}
        revealed={state.revealed}
        socketId={socketId}
      />

      <ReadyBanner visible={allVoted} />

      <div className="actions">
        <button className="reveal-btn" onClick={() => socket.emit("reveal")}>
          Reveal Votes
        </button>
        <button className="reset-btn" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
