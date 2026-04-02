# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pointr is a pointing poker tool for agile estimation. No login or registration required. Users create sessions, share a session ID, and vote using Fibonacci numbers with real-time collaboration.

## Commands

- **Install dependencies:** `npm install`
- **Build:** `npm run build` (compiles server TypeScript + builds React client via Vite)
- **Start:** `npm start`
- **Dev server:** `npm run dev` (runs tsc watch, Vite dev server with HMR, and Node server with auto-restart)

## Architecture

- **Server:** Fastify + Socket.IO, compiled output in `dist/`
  - `src/index.ts` — server bootstrap (Fastify setup, static files, start)
  - `src/routes.ts` — HTTP route registration (SPA catch-all, stats)
  - `src/sessionHandler.ts` — Socket.IO event handlers (create, join, vote, reveal, reset, etc.)
  - `src/sessions.ts` — shared types (`Session`, `Participant`) and in-memory session store
  - `src/stats.ts` — `/stats` JSON endpoint (active sessions, uptime)
- **Frontend:** React + Vite app in `client/`, built output in `client/dist/`, served statically by Fastify in production
  - Components in `client/src/components/`
  - Styles in `client/src/styles.css`
  - Socket.IO client singleton in `client/src/socket.ts`
  - Vite config in `vite.config.ts` (project root, `root: "client"`), proxies `/socket.io` to backend in dev
- **Storage:** In-memory (no database) — sessions are lost on restart
- **Logging:** Fastify's built-in pino logger (structured JSON in prod, pretty in dev)
- **Session IDs:** 6-character uppercase alphanumeric, case-insensitive lookup
- Server TypeScript targeting ES2016, compiled to CommonJS, strict mode enabled
- Client TypeScript targeting ES2020 with React JSX, bundled by Vite
- Node.js 24+ required
