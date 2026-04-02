import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { Server } from "socket.io";
import path from "path";
import { sessions } from "./sessions";
import { registerRoutes } from "./routes";
import { registerSessionHandler } from "./sessionHandler";

const fastify = Fastify({
  logger: process.env.PRETTY_LOG
    ? { transport: { target: "pino-pretty" } }
    : true,
});

const clientDist = path.join(__dirname, "..", "client", "dist");

fastify.register(fastifyStatic, {
  root: clientDist,
});

registerRoutes(fastify, clientDist, sessions);

const port = parseInt(process.env.PORT || "3000", 10);

const start = async () => {
  await fastify.listen({ port, host: "0.0.0.0" });
  console.log(`Pointr running at http://localhost:${port}`);
};

start();

const io = new Server(fastify.server, {
  cors: { origin: "*" },
});

registerSessionHandler(io, sessions, fastify.log);
