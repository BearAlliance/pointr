import { socket } from "../socket";

interface ObserverToggleProps {
  isObserver: boolean;
}

export function ObserverToggle({ isObserver }: ObserverToggleProps) {
  return (
    <div className="observer-row">
      <button
        className={isObserver ? "active" : ""}
        onClick={() => socket.emit("toggle-observer")}
      >
        {isObserver ? "Switch to Voter" : "Switch to Observer"}
      </button>
    </div>
  );
}
