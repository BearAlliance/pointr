import type { ParticipantState } from "../App";
import styles from "./ParticipantList.module.css";

interface ParticipantListProps {
  participants: ParticipantState[];
  revealed: boolean;
  socketId: string;
}

const voteColorMap: Record<number, string> = {
  1: styles.vote1,
  2: styles.vote2,
  3: styles.vote3,
  5: styles.vote5,
  8: styles.vote8,
  13: styles.vote13,
  21: styles.vote21,
};

export function ParticipantList({ participants, revealed, socketId }: ParticipantListProps) {
  return (
    <div className={styles.participants}>
      <h3>Participants</h3>
      <ul className={styles.list}>
        {[...participants].sort((a, b) => Number(b.observer) - Number(a.observer)).map((p) => (
          <li key={p.id} className={p.observer ? styles.observerRow : ""}>
            <span className={styles.name}>
              {p.id === socketId ? `${p.name} (you)` : p.name}
              {p.observer && <span className={styles.observerTag}> observer</span>}
            </span>
            <VoteStatus participant={p} revealed={revealed} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function VoteStatus({ participant: p, revealed }: { participant: ParticipantState; revealed: boolean }) {
  if (p.observer) {
    return <span className={`${styles.voteStatus} ${styles.pending}`}>&mdash;</span>;
  }
  if (revealed && p.vote !== null) {
    return (
      <span className={`${styles.voteStatus} ${styles.revealed} ${voteColorMap[p.vote] ?? ""}`}>
        {p.vote}
      </span>
    );
  }
  if (p.voted) {
    return <span className={`${styles.voteStatus} ${styles.voted}`}>&#x2713;</span>;
  }
  return <span className={`${styles.voteStatus} ${styles.pending}`}>?</span>;
}
