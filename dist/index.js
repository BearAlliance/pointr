"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const static_1 = __importDefault(require("@fastify/static"));
const socket_io_1 = require("socket.io");
const nanoid_1 = require("nanoid");
const nanoid = (0, nanoid_1.customAlphabet)("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
const path_1 = __importDefault(require("path"));
const sessions = new Map();
const fastify = (0, fastify_1.default)();
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, "..", "public"),
});
const port = parseInt(process.env.PORT || "3000", 10);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Pointr running at http://localhost:${port}`);
});
start();
const io = new socket_io_1.Server(fastify.server, {
    cors: { origin: "*" },
});
function sessionState(session) {
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
function broadcastSession(session) {
    io.to(session.id).emit("session-updated", sessionState(session));
}
io.on("connection", (socket) => {
    let currentSessionId = null;
    socket.on("create-session", (callback) => {
        const sessionId = nanoid(6);
        const session = {
            id: sessionId,
            participants: new Map(),
            revealed: false,
        };
        sessions.set(sessionId, session);
        callback({ sessionId });
    });
    socket.on("join-session", (sessionId, callback) => {
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
    socket.on("set-name", (name) => {
        if (!currentSessionId)
            return;
        const session = sessions.get(currentSessionId);
        if (!session)
            return;
        const participant = session.participants.get(socket.id);
        if (!participant)
            return;
        participant.name = name.trim().slice(0, 30) || "Anonymous";
        broadcastSession(session);
    });
    socket.on("vote", (value) => {
        if (!currentSessionId)
            return;
        const session = sessions.get(currentSessionId);
        if (!session || session.revealed)
            return;
        const participant = session.participants.get(socket.id);
        if (!participant)
            return;
        const allowed = [1, 2, 3, 5, 8, 13, 21];
        if (!allowed.includes(value))
            return;
        participant.vote = value;
        broadcastSession(session);
    });
    socket.on("reveal", () => {
        if (!currentSessionId)
            return;
        const session = sessions.get(currentSessionId);
        if (!session)
            return;
        session.revealed = true;
        broadcastSession(session);
    });
    socket.on("reset", () => {
        if (!currentSessionId)
            return;
        const session = sessions.get(currentSessionId);
        if (!session)
            return;
        session.revealed = false;
        for (const p of session.participants.values()) {
            p.vote = null;
        }
        broadcastSession(session);
    });
    socket.on("disconnect", () => {
        if (!currentSessionId)
            return;
        const session = sessions.get(currentSessionId);
        if (!session)
            return;
        session.participants.delete(socket.id);
        if (session.participants.size === 0) {
            sessions.delete(currentSessionId);
        }
        else {
            broadcastSession(session);
        }
    });
});
