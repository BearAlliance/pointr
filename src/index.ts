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
  observer: boolean;
}

interface Session {
  id: string;
  participants: Map<string, Participant>;
  revealed: boolean;
}

const sessions = new Map<string, Session>();

const fastify = Fastify({
  logger: process.env.PRETTY_LOG
    ? { transport: { target: "pino-pretty" } }
    : true,
});
const log = fastify.log;

const clientDist = path.join(__dirname, "..", "client", "dist");

fastify.register(fastifyStatic, {
  root: clientDist,
});

fastify.get("/play/*", (_req, reply) => {
  return reply.sendFile("index.html", clientDist);
});

const startedAt = Date.now();

fastify.get("/stats", (_req, reply) => {
  const uptimeMs = Date.now() - startedAt;
  const seconds = Math.floor(uptimeMs / 1000) % 60;
  const minutes = Math.floor(uptimeMs / 60000) % 60;
  const hours = Math.floor(uptimeMs / 3600000) % 24;
  const days = Math.floor(uptimeMs / 86400000);
  const uptime = [
    days > 0 ? `${days}d` : "",
    hours > 0 ? `${hours}h` : "",
    minutes > 0 ? `${minutes}m` : "",
    `${seconds}s`,
  ].filter(Boolean).join(" ");

  return reply.send({
    activeSessions: sessions.size,
    uptime,
  });
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
    observer: p.observer,
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
