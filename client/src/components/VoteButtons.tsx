const FIB_VALUES = [1, 2, 3, 5, 8, 13, 21];

interface VoteButtonsProps {
  myVote: number | null;
  onVote: (value: number) => void;
}

export function VoteButtons({ myVote, onVote }: VoteButtonsProps) {
  return (
    <div className="vote-section">
      <h3>Your Vote</h3>
      <div className="vote-buttons">
        {FIB_VALUES.map((v) => (
          <button
            key={v}
            className={`vote-btn${myVote === v ? " selected" : ""}`}
            onClick={() => onVote(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
