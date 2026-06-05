# YT2MP3 Frontend

React + Vite frontend for the YT2MP3 project.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

Copy `.env.example` to `.env`. Leave `VITE_API_URL` empty to use the Vite dev proxy (`/api` → `http://localhost:5000`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
