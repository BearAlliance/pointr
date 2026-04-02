import { socket } from "../socket";
import styles from "./ObserverToggle.module.css";

interface ObserverToggleProps {
  isObserver: boolean;
}

export function ObserverToggle({ isObserver }: ObserverToggleProps) {
  return (
    <div className={styles.observerRow}>
      <button
        className={isObserver ? styles.active : ""}
        onClick={() => socket.emit("toggle-observer")}
      >
        {isObserver ? "Switch to Voter" : "Switch to Observer"}
      </button>
    </div>
  );
}
