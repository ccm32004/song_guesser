# MelodyMatch

Play song snippets and guess the title. Artists: Taylor Swift, Playboi Carti, The Weeknd. Live at [melodymatch.cc](https://melodymatch.cc).

<img width="1288" alt="Screenshot 2025-04-07 at 11 21 22 PM" src="https://github.com/user-attachments/assets/07ef0cc6-94fd-4910-bd0f-b2b55a4c8505" />
<img width="1055" alt="Screenshot 2025-04-07 at 11 22 59 PM" src="https://github.com/user-attachments/assets/aaedc215-8d2f-4d68-ad41-76f790fd2b76" />
<img width="1234" alt="Screenshot 2025-04-07 at 11 23 47 PM" src="https://github.com/user-attachments/assets/8785edf2-a95d-408c-9a34-570d7b0c16f4" />
<img width="1240" alt="Screenshot 2025-04-07 at 11 24 41 PM" src="https://github.com/user-attachments/assets/79d9b018-9033-4943-a702-a18732b7f33c" />

React, Vite, Mantine. Express, MongoDB Atlas, Redis sessions. Spotify for login and preview audio. Deployed on an Ubuntu EC2 instance: Docker image in ECR, Nginx reverse proxy, SSL via Cloudflare.

## Architecture

```
Vite SPA  →  Nginx  →  Express /api
                         ├─ Redis     Spotify tokens (httpOnly session)
                         ├─ Mongo     high score per artist + difficulty
                         ├─ songTitles/*.json
                         └─ Spotify   OAuth, search, embed-page preview URL
```

A round picks a title from the local JSON catalog, searches the Spotify Web API, then scrapes `open.spotify.com/embed/track/{id}` for `audioPreview.url` (the API often omits `preview_url`). The client plays a 1–3s clip and checks the guess locally. Login is Spotify's authorization-code flow. Scores and profile are available after login.

| Path | Role |
| --- | --- |
| `/`, `/home`, `/dashboard`, `/game`, `/stats` | SPA |
| `GET /api/login`, `/api/callback` | Spotify OAuth, then redirect to `/dashboard` |
| `GET /api/getTrackSnippet` | Random track + preview. Session cookie. |
| `GET /api/songNames/:artist` | Autocomplete list |
| `GET /api/profile`, `/api/get-user-stats`, `POST /api/update-high-score` | Logged-in user |

Difficulty is snippet length: 3s easy, 2s medium, 1s hard. The stored score is the longest streak.

## Run locally

`backend/.env.development`: `NODE_ENV`, `PORT` (3002), `FRONTEND_URL`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` (`http://localhost:3002/api/callback`), `MONGO_URI`, `SESSION_SECRET`, `JWT_SECRET`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`.

`frontend/.env`: `VITE_API_BASE_URL=http://localhost:3002/api`, `VITE_LOGIN_URL=http://localhost:3002/api/login`.

```bash
cd backend && npm install && npm run start:development
cd frontend && npm install && npm start
```

Docker expects the API on port 5001 (`Dockerfile`, Nginx).
