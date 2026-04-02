import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { Server } from "socket.io";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
import path from "path";

interface Participant {
  id: string;
  name: string;
  vote: number | null;
}

interface Session {
  id: string;
  participants: Map<string, Participant>;
  revealed: boolean;
}

const sessions = new Map<string, Session>();

const fastify = Fastify();

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
});

const port = parseInt(process.env.PORT || "3000", 10);

const start = async () => {
  await fastify.listen({ port, host: "0.0.0.0" });
  console.log(`Pointr running at http://localhost:${port}`);
};

start();

const io = new Server(fastify.server, {
  cors: { origin: "*" },
});

function sessionState(session: Session) {
  const participants = Array.from(session.participants.values()).map((p) => ({
    id: p.id,
    name: p.name,
    voted: p.vote !== null,
    vote: session.revealed ? p.vote : null,
  }));

  return {
    id: session.id,
    participants,
    revealed: session.revealed,
  };
}

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
    });

    socket.join(sessionId);
    callback({ ok: true });
    broadcastSession(session);
  });

  socket.on("set-name", (name: string) => {
    if (!currentSessionId) return;
    const session = sessions.get(currentSessionId);
    if (!session) return;
    const participant = session.participants.get(socket.id);
    if (!participant) return;

    participant.name = name.trim().slice(0, 30) || "Anonymous";
    broadcastSession(session);
  });

  socket.on("vote", (value: number) => {
    if (!currentSessionId) return;
    const session = sessions.get(currentSessionId);
    if (!session || session.revealed) return;
    const participant = session.participants.get(socket.id);
    if (!participant) return;

    const allowed = [1, 2, 3, 5, 8, 13, 21];
    if (!allowed.includes(value)) return;

    participant.vote = value;
    broadcastSession(session);
  });

  socket.on("reveal", () => {
    if (!currentSessionId) return;
    const session = sessions.get(currentSessionId);
    if (!session) return;

    session.revealed = true;
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

    session.participants.delete(socket.id);
    if (session.participants.size === 0) {
      sessions.delete(currentSessionId);
    } else {
      broadcastSession(session);
    }
  });
});
