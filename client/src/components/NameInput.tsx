import { useState, type KeyboardEvent } from "react";
import { socket } from "../socket";

export function NameInput() {
  const [name, setName] = useState("");

  const handleSet = () => {
    const trimmed = name.trim();
    if (trimmed) socket.emit("set-name", trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSet();
  };

  return (
    <div className="name-row">
      <input
        type="text"
        placeholder="Your name"
        maxLength={30}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSet}>Set</button>
    </div>
  );
}
