# YT Music Backend API

Express + MongoDB backend for the YT project. It converts YouTube URLs to temporary MP3 download links stored on ImageKit, with JWT authentication and optional Google OAuth.

Storage is kept low by design: files live on ImageKit temporarily, links expire automatically, and a background cleanup job deletes expired files.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express 4
- **Database:** MongoDB via Mongoose
- **Auth:** JWT access tokens, httpOnly refresh-token cookies, optional Google OAuth (Passport)
- **Media pipeline:** `yt-dlp-exec` (stream audio) → `fluent-ffmpeg` (transcode to MP3) → ImageKit upload

## Project Structure

```
Backend/
├── app.js                 # Express app, middleware, route mounting
├── server.js              # DB connect, server start, cleanup scheduler
├── src/
│   ├── config/
│   │   ├── config.js      # Environment-driven settings
│   │   ├── database.js    # MongoDB connection
│   │   └── passport.js    # Google OAuth strategy
│   ├── controller/
│   │   ├── auth.controller.js
│   │   └── music.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js   # Bearer JWT guard
│   ├── model/
│   │   ├── user.model.js
│   │   ├── music.model.js
│   │   └── downloadJob.model.js
│   ├── routes/
│   │   ├── auth.router.js       # /api/auth
│   │   └── music.router.js      # /api/music
│   ├── service/
│   │   └── music.service.js     # Download queue, ImageKit, cleanup
│   └── utils/
│       ├── jwt.js
│       └── normalizeYoutubeUrl.js
└── package.json
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- ImageKit account (private key, public key, URL endpoint)
- **yt-dlp** available on the system PATH (required by `yt-dlp-exec`)
- FFmpeg is bundled via `@ffmpeg-installer/ffmpeg` (no separate install needed)

## Base URL

- Local default: `http://localhost:5000` (set via `PORT`; server auto-retries on the next port if busy)
- Auth prefix: `/api/auth`
- Music prefix: `/api/music`

---

## Authentication (`/api/auth`)

Protected music routes expect a Bearer access token:

```
Authorization: Bearer <accessToken>
```

Refresh tokens are stored in an httpOnly cookie named `refreshToken` (also accepted in the request body for `/refresh`).

### Register

- **POST** `/api/auth/register`
- Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "your-password"
}
```

- Responses:
  - `201` — user created; returns `accessToken` and sets refresh cookie
  - `400` — missing fields
  - `409` — email already registered

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" },
  "accessToken": "eyJ..."
}
```

### Login

- **POST** `/api/auth/login`
- Body:

```json
{
  "email": "jane@example.com",
  "password": "your-password"
}
```

- Responses:
  - `200` — returns `accessToken` and sets refresh cookie
  - `400` / `401` — invalid input or credentials

### Refresh access token

- **POST** `/api/auth/refresh`
- Sends refresh token via cookie or body: `{ "refreshToken": "..." }`
- Response: `{ "success": true, "accessToken": "eyJ..." }`

### Current user

- **GET** `/api/auth/me`
- **Auth required**
- Response: `{ "success": true, "user": { ... } }`

### Logout

- **POST** `/api/auth/logout`
- Clears refresh cookie and invalidates stored refresh token

### Google OAuth (optional)

Enabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

- **GET** `/api/auth/google` — redirects to Google consent
- **GET** `/api/auth/google/callback` — on success returns:

```json
{
  "success": true,
  "message": "Google OAuth login successful",
  "user": { ... }
}
```

Note: the Google callback currently returns the user object only (no JWT). Wire token issuance on the frontend or extend the callback handler if needed.

---

## Music API (`/api/music`)

### 1) Create download job

- **POST** `/api/music/download`
- **Auth required**
- Body:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

Supported URL forms are normalized to `youtube.com/watch?v=...` (including `youtu.be` links).

- Responses:
  - `200` — cache hit, file already ready
  - `202` — job created, poll status
  - `400` — missing URL
  - `401` — missing or invalid token
  - `429` — `TOO_MANY_ACTIVE_JOBS` or `STORAGE_FULL`
  - `500` — server error

#### `200` cache-hit example

```json
{
  "success": true,
  "data": {
    "title": "Song Title",
    "url": "https://ik.imagekit.io/.../song.mp3",
    "downloadUrl": "https://ik.imagekit.io/.../song.mp3",
    "thumbnail": "https://...",
    "format": { "container": "mp3" },
    "mimeType": "audio/mpeg",
    "mediaType": "audio",
    "expiresAt": "2026-05-28T09:30:00.000Z",
    "secondsRemaining": 3250,
    "lifecycleStatus": "ready",
    "storageState": "ok",
    "cached": true
  }
}
```

#### `202` job-created example

```json
{
  "success": true,
  "jobId": "6836f3f5f1d4b7f8a2abcd01",
  "status": "queued",
  "storageState": "ok",
  "message": "Download started. Poll status endpoint for completion."
}
```

Job statuses: `queued` → `processing` → `completed` | `failed` | `expired`

### 2) Poll job status

- **GET** `/api/music/download/status/:jobId`
- **Public** (no auth)
- Poll every 1–2 seconds until:
  - `status === "completed"` and `result` is present, or
  - `status === "failed"` / `status === "expired"`

#### `completed` example

```json
{
  "success": true,
  "data": {
    "jobId": "6836f3f5f1d4b7f8a2abcd01",
    "status": "completed",
    "progress": 100,
    "result": {
      "title": "Song Title",
      "url": "https://ik.imagekit.io/.../song.mp3",
      "downloadUrl": "https://ik.imagekit.io/.../song.mp3",
      "thumbnail": "https://...",
      "duration": 205,
      "format": { "container": "mp3" },
      "mimeType": "audio/mpeg",
      "mediaType": "audio",
      "sourceUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
      "expiresAt": "2026-05-28T09:30:00.000Z",
      "secondsRemaining": 3200,
      "lifecycleStatus": "ready"
    },
    "timings": {
      "ytDlpStart": 2,
      "streamComplete": 9100,
      "uploadComplete": 11320,
      "dbComplete": 11380,
      "total": 11390
    },
    "storageState": "ok",
    "expiresAt": "2026-05-28T09:30:00.000Z",
    "error": "",
    "errorCode": ""
  }
}
```

### 3) Download handoff

- **GET** `/api/music/download/link/:jobId`
- **Public** (no auth)
- Call when the user clicks the final download button. Marks the file as `downloaded` and shortens the deletion window.

Response fields: `downloadUrl`, `expiresAt`, `secondsRemaining`, `lifecycleStatus`

---

## Frontend Flow (Recommended)

### Auth

1. Register or log in → store `accessToken` (memory or secure storage)
2. Attach `Authorization: Bearer <accessToken>` to protected requests
3. On `401`, call `POST /api/auth/refresh` (cookie sent automatically) and retry
4. On logout, call `POST /api/auth/logout` and clear local token state

### Download

1. User submits a YouTube URL (while authenticated)
2. Call `POST /api/music/download` with Bearer token
3. If `200`, show download button immediately using `data.downloadUrl`
4. If `202`, poll `GET /api/music/download/status/:jobId` every 1–2 s
5. When `status === "completed"`, show title, thumbnail, and download button
6. On download button click:
   - call `GET /api/music/download/link/:jobId`
   - use returned `downloadUrl`
7. Show countdown from `secondsRemaining` so the user knows when the link expires

---

## Deletion and Expiry Rules

| Scenario | TTL |
|---|---|
| User never triggers download handoff | `DOWNLOAD_TTL_MINUTES` (default 60 min) |
| User calls `/download/link/:jobId` | `DELETE_AFTER_DOWNLOAD_MINUTES` (default 10 min) |

Physical deletion runs on a cleanup tick every `CLEANUP_INTERVAL_MS` (default 5 min).

Practical deletion window:

- Non-downloaded: ~60–65 min
- After handoff: ~10–15 min

Lifecycle statuses on stored files: `ready` → `downloaded` → `expired` / `deleted`

---

## Error Codes

| Code | When |
|---|---|
| `TOO_MANY_ACTIVE_JOBS` | Queue at `MAX_ACTIVE_JOBS` concurrency |
| `STORAGE_FULL` | ImageKit usage at `IMAGEKIT_MAX_BYTES` threshold |
| `MAX_DURATION_EXCEEDED` | Video longer than `MAX_DURATION_SECONDS` |
| `FILE_EXPIRED` | Download link already deleted or expired |

HTTP-level errors: `400` (bad input), `401` (auth), `404` (job not found), `429` (rate/storage limit), `500` (server error).

---

## Environment Variables

Create a `.env` file in the `Backend` directory.

### Required

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000` in config; commonly `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private API key |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `JWT_SECRET` | Access-token signing secret |
| `REFRESH_TOKEN_SECRET` | Refresh-token signing secret |

### Auth (optional / tuning)

| Variable | Default | Description |
|---|---|---|
| `JWT_EXPIRES_IN` | `1h` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `SESSION_SECRET` | `change-this-secret` | Express session secret (Google OAuth) |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3000/api/auth/google/callback` | OAuth redirect URI |

### Download / storage tuning

| Variable | Default | Description |
|---|---|---|
| `MAX_AUDIO_BUFFER_BYTES` | `62914560` (~60 MB) | Max in-memory audio buffer |
| `MAX_DURATION_SECONDS` | `900` (15 min) | Max allowed video duration |
| `MAX_ACTIVE_JOBS` | `3` | Concurrent download jobs |
| `IMAGEKIT_MAX_BYTES` | `19922944` (~19 MB) | Storage cap before rejecting jobs |
| `MIN_STORAGE_HEADROOM_BYTES` | `2097152` (2 MB) | Headroom before `near_limit` state |
| `DOWNLOAD_TTL_MINUTES` | `60` | Expiry if user never downloads |
| `DELETE_AFTER_DOWNLOAD_MINUTES` | `10` | Expiry after download handoff |
| `CLEANUP_INTERVAL_MS` | `300000` (5 min) | Cleanup scheduler interval |
| `ENABLE_AUDIO_COMPRESSION` | `false` | Reserved in config (pipeline always transcodes to MP3) |

---

## Quick Local Run

```bash
cd Backend
npm install
# ensure yt-dlp is on PATH and .env is configured
npm run dev
```

Scripts:

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start with node |
| `npm test` | Placeholder (no tests configured) |

---

## Notes

- Output is MP3 (`audio/mpeg`); treat all responses as audio.
- Always read `downloadUrl` from the response — do not hardcode URL fields.
- Handle both the fast path (`200` cache hit) and async path (`202` + polling).
- `POST /download` requires auth; status and link endpoints are public so polling and download handoff work without re-sending the token.
- Duplicate in-flight requests for the same normalized URL return the existing queued/processing job instead of creating a new one.
