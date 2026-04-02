import type { Server } from "socket.io";
import type { FastifyBaseLogger } from "fastify";
import { customAlphabet } from "nanoid";
import type { Session } from "./sessions";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

function sessionState(session: Session) {
  const participants = Array.from(session.participants.values()).map((p) => ({
    id: p.id,
    name: p.name,
    voted: p.vote !== null,
    vote: session.revealed ? p.vote : null,
    observer: p.observer,
  }));

  return {
    id: session.id,
    participants,
    revealed: session.revealed,
  };
}

export function registerSessionHandler(io: Server, sessions: Map<string, Session>, log: FastifyBaseLogger) {
  function broadcastSession(session: Session) {
    io.to(session.id).emit("session-updated", sessionState(session));
  }

  io.on("connection", (socket) => {
    let currentSessionId: string | null = null;

    socket.on("create-session", (callback: (data: { sessionId: string }) => void) => {
      const sessionId = nanoid(6);
      const session: Session = {
        id: sessionId,
        participants: new Map(),
        revealed: false,
      };
      sessions.set(sessionId, session);
      log.info({ sessionId }, "session created");
      callback({ sessionId });
    });

    socket.on("join-session", (sessionId: string, callback: (data: { ok: boolean; error?: string }) => void) => {
      const session = sessions.get(sessionId.toUpperCase());
      if (!session) {
        callback({ ok: false, error: "Session not found" });
        return;
      }

      currentSessionId = sessionId;
      session.participants.set(socket.id, {
        id: socket.id,
        name: "Anonymous",
        vote: null,
        observer: false,
      });

      socket.join(sessionId);
      log.info({ sessionId, socketId: socket.id }, "participant joined");
      callback({ ok: true });
      broadcastSession(session);
    });

    socket.on("set-name", (name: string) => {
      if (!currentSessionId) return;
      const session = sessions.get(currentSessionId);
      if (!session) return;
      const participant = session.participants.get(socket.id);
      if (!participant) return;

      const oldName = participant.name;
      participant.name = name.trim().slice(0, 30) || "Anonymous";
      log.info({ sessionId: currentSessionId, socketId: socket.id, oldName, newName: participant.name }, "name changed");
      broadcastSession(session);
    });

    socket.on("toggle-observer", () => {
      if (!currentSessionId) return;
      const session = sessions.get(currentSessionId);
      if (!session) return;
      const participant = session.participants.get(socket.id);
      if (!participant) return;

      participant.observer = !participant.observer;
      if (participant.observer) {
        participant.vote = null;
      }
      log.info({ sessionId: currentSessionId, socketId: socket.id, name: participant.name, observer: participant.observer }, "observer toggled");
      broadcastSession(session);
    });

    socket.on("vote", (value: number) => {
      if (!currentSessionId) return;
      const session = sessions.get(currentSessionId);
      if (!session || session.revealed) return;
      const participant = session.participants.get(socket.id);
      if (!participant || participant.observer) return;

      const allowed = [1, 2, 3, 5, 8, 13, 21];
      if (!allowed.includes(value)) return;

      participant.vote = value;
      log.info({ sessionId: currentSessionId, socketId: socket.id, name: participant.name, vote: value }, "vote cast");
      broadcastSession(session);
    });

    socket.on("reveal", () => {
      if (!currentSessionId) return;
      const session = sessions.get(currentSessionId);
      if (!session) return;

      session.revealed = true;
      log.info({ sessionId: currentSessionId }, "votes revealed");
      broadcastSession(session);
    });

    socket.on("reset", () => {
      if (!currentSessionId) return;
      const session = sessions.get(currentSessionId);
      if (!session) return;

      session.revealed = false;
      for (const p of session.participants.values()) {
        p.vote = null;
      }
      broadcastSession(session);
    });

    socket.on("disconnect", () => {
      if (!currentSessionId) return;
      const session = sessions.get(currentSessionId);
      if (!session) return;

      const name = session.participants.get(socket.id)?.name;
      session.participants.delete(socket.id);
      log.info({ sessionId: currentSessionId, socketId: socket.id, name }, "participant left");
      if (session.participants.size === 0) {
        sessions.delete(currentSessionId);
        log.info({ sessionId: currentSessionId }, "session ended");
      } else {
        broadcastSession(session);
      }
    });
  });
}
