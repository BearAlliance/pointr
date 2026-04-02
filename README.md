# Pointr

[![CI](https://github.com/BearAlliance/pointr/actions/workflows/ci.yml/badge.svg)](https://github.com/BearAlliance/pointr/actions/workflows/ci.yml)

A tool for playing pointing poker.

No login, no registration.

## Features

- Simple and intuitive interface
- Real-time collaboration
- Anonymous participation

## Use

1. Create a new session with the "Create Session" button
2. Enter your name (optional)
3. Invite your friends to join the session using the unique session ID
4. Vote for the Fibonacci number of your choice
5. View the results

## Local Development

### Prerequisites

- Node.js 24+
- npm

### Setup

```bash
npm install
npm run build
npm start
```

The app will be available at `http://localhost:3000`.

### Dev Server

```bash
npm run dev
```

Automatically rebuilds TypeScript and restarts the server on file changes.

### Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm install`   | Install dependencies               |
| `npm run build` | Compile TypeScript to `dist/`      |
| `npm start`     | Start the server                   |
| `npm run dev`   | Dev server with auto-rebuild       |

## Deployment

Pointr is a single Node.js process serving both the API (via Socket.IO) and static frontend files. No external database is required — session data is stored in memory.

### Environment

| Variable | Default | Description        |
| -------- | ------- | ------------------ |
| `PORT`   | `3000`  | Server listen port |

### Steps

1. Clone the repo and install production dependencies:

   ```bash
   npm install --production
   ```

2. Build:

   ```bash
   npm run build
   ```

3. Start:

   ```bash
   npm start
   ```

### Docker

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Notes

- Session data lives in memory and is lost on restart. This is fine for typical use — sessions are short-lived.
- The server binds to `0.0.0.0` by default, so it is accessible on all network interfaces.
- For production, run behind a reverse proxy (e.g., nginx, Caddy) that handles TLS. Ensure the proxy is configured to support WebSocket connections for Socket.IO.
