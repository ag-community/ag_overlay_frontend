# AG Overlay Frontend

`ag-overlay` is the frontend for an Adrenaline Gamer broadcast overlay setup. It provides two main pages:

- a stream overlay page for on-screen presentation
- a dashboard page for operators/streamers to control teams, scores, scenes, logos, and backgrounds

The app can also connect to a compatible AG live-data WebSocket source to display match and player information in real time.

## Getting Started

### Requirements

- [Bun](https://bun.sh/)

### Install

```bash
bun install
```

### Start in Development

```bash
bun run dev
```

By default, the app runs at:

- Overlay: `http://localhost:7270/`
- Dashboard: `http://localhost:7270/dashboard`

## Start in Production

```bash
bun run start
```

In production mode, the dashboard may open automatically in your browser. To disable that behavior:

```bash
OPEN_DASHBOARD_URL=false bun run start
```

## Available Scripts

- `bun run dev` starts the app with hot reload.
- `bun run start` starts the app in production mode.
- `bun run build` runs the project build step.

## How To Use

### For Developers

1. Install dependencies with `bun install`.
2. Start the app with `bun run dev`.
3. Open the dashboard at `http://localhost:7270/dashboard`.
4. Open the overlay at `http://localhost:7270/`.
