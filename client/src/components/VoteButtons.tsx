import styles from "./VoteButtons.module.css";

const FIB_VALUES = [1, 2, 3, 5, 8, 13, 21];

interface VoteButtonsProps {
  myVote: number | null;
  onVote: (value: number) => void;
}

export function VoteButtons({ myVote, onVote }: VoteButtonsProps) {
  return (
    <div className={styles.voteSection}>
      <h3>Your Vote</h3>
      <div className={styles.voteButtons}>
        {FIB_VALUES.map((v) => (
          <button
            key={v}
            className={`${styles.voteBtn}${myVote === v ? ` ${styles.selected}` : ""}`}
            onClick={() => onVote(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
