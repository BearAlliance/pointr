import type { FastifyInstance } from "fastify";
import type { Session } from "./sessions";

export function registerStats(fastify: FastifyInstance, sessions: Map<string, Session>) {
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
}
