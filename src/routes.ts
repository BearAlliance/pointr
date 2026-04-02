import type { FastifyInstance } from "fastify";
import type { Session } from "./sessions";
import { registerStats } from "./stats";

export function registerRoutes(fastify: FastifyInstance, clientDist: string, sessions: Map<string, Session>) {
  fastify.get("/play/*", (_req, reply) => {
    return reply.sendFile("index.html", clientDist);
  });

  registerStats(fastify, sessions);
}
