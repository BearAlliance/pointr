import type { SessionState } from "../App";
import { NameInput } from "./NameInput";
import { ObserverToggle } from "./ObserverToggle";
import { VoteButtons } from "./VoteButtons";
import { ParticipantList } from "./ParticipantList";
import { ReadyBanner } from "./ReadyBanner";
import { socket } from "../socket";
import { useState } from "react";
import styles from "./Session.module.css";

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
    const url = window.location.origin + "/play/" + sessionId;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const voters = state.participants.filter((p) => !p.observer);
  const allVoted = !state.revealed && voters.length > 0 && voters.every((p) => p.voted);
  const hasVotes = voters.some((p) => p.voted);
  const votes = voters.filter((p) => p.vote !== null).map((p) => p.vote);
  const consensus = state.revealed && votes.length > 1 && votes.every((v) => v === votes[0]);

  return (
    <div className={styles.session}>
      <div className={styles.sessionId}>
        Session:{" "}
        <code onClick={copySessionId}>{sessionId}</code>
        {copied && <span className={styles.copied}>Copied!</span>}
      </div>

      <NameInput />
      <ObserverToggle isObserver={isObserver} />

      {!isObserver && <VoteButtons myVote={myVote} onVote={onVote} disabled={state.revealed} />}

      <ParticipantList
        participants={state.participants}
        revealed={state.revealed}
        socketId={socketId}
      />

      <ReadyBanner visible={allVoted} />
      {consensus && <div className={styles.consensus}>Consensus!</div>}

      <div className={styles.actions}>
        <button className={styles.revealBtn} onClick={() => socket.emit("reveal")} disabled={state.revealed}>
          Reveal
        </button>
        <button className={styles.resetBtn} onClick={onReset} disabled={!hasVotes}>
          Reset
        </button>
      </div>
    </div>
  );
}
