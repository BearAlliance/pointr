# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pointr is a pointing poker tool for agile estimation. No login or registration required. Users create sessions, share a session ID, and vote using Fibonacci numbers with real-time collaboration.

## Commands

- **Install dependencies:** `npm install`
- **Build:** `npm run build`
- **Start:** `npm start`
- **Dev server (auto-rebuild):** `npm run dev`

## Architecture

- **Server:** Fastify + Socket.IO, entry point at `src/index.ts`, compiled output in `dist/`
- **Frontend:** Single-page vanilla HTML/JS/CSS in `public/index.html`, served statically by Fastify
- **Real-time:** Socket.IO handles all session events (create, join, vote, reveal, reset)
- **Storage:** In-memory (no database) — sessions are lost on restart
- **Logging:** Fastify's built-in pino logger (structured JSON)
- **Session IDs:** 6-character uppercase alphanumeric, case-insensitive lookup
- TypeScript targeting ES2016, compiled to CommonJS, strict mode enabled
- Node.js 24+ required
