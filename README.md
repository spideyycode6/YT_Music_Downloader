# YT2MP3

YouTube to MP3 converter with JWT authentication and temporary ImageKit storage.

## Project structure

```
YT/
├── Backend/    # Express API
└── Frontend/   # React + Vite UI
```

## Quick start

### Backend

```bash
cd Backend
npm install
cp .env.example .env   # fill in your secrets locally
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

## Security

- **Never commit `.env` files.** Only `.env.example` templates are tracked.
- Copy `.env.example` → `.env` on each machine and use your own secrets.
- If secrets were ever committed to git, rotate them immediately (MongoDB password, JWT secrets, ImageKit keys).

## Documentation

- [Backend API](Backend/README.md)
- [Frontend](Frontend/README.md)
