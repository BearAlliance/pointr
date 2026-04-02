import type { ParticipantState } from "../App";

interface ParticipantListProps {
  participants: ParticipantState[];
  revealed: boolean;
  socketId: string;
}

export function ParticipantList({ participants, revealed, socketId }: ParticipantListProps) {
  return (
    <div className="participants">
      <h3>Participants</h3>
      <ul className="participant-list">
        {participants.map((p) => (
          <li key={p.id}>
            <span className="participant-name">
              {p.id === socketId ? `${p.name} (you)` : p.name}
              {p.observer && <span className="observer-tag"> (observer)</span>}
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
    return <span className="vote-status pending">&mdash;</span>;
  }
  if (revealed && p.vote !== null) {
    return <span className={`vote-status revealed vote-${p.vote}`}>{p.vote}</span>;
  }
  if (p.voted) {
    return <span className="vote-status voted">&#x2713;</span>;
  }
  return <span className="vote-status pending">?</span>;
}
