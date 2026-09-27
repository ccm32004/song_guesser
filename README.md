# MelodyMatch

A full-stack music guessing game where players identify songs from short audio snippets and compete for high streaks across different artists and difficulty levels.

Built with **React, Express, Redis, MongoDB, and the Spotify Web API**, and deployed on **AWS EC2 with Docker, Nginx, and Cloudflare**.

## Demo

The original project was fully functional when developed. Since it relies on Spotify's API, some functionality may no longer work as originally implemented due to changes to Spotify's platform and API.

[▶️ Watch the project demo on Google Drive](https://drive.google.com/file/d/1yD0C4VbIHA02EhRi7FZhOS29t2YsCw3-/view?usp=sharing)

## Screenshots

![](https://github.com/user-attachments/assets/07ef0cc6-94fd-4910-bd0f-b2b55a4c8505)![](https://github.com/user-attachments/assets/aaedc215-8d2f-4d68-ad41-76f790fd2b76)

![](https://github.com/user-attachments/assets/8785edf2-a95d-408c-9a34-570d7b0c16f4)![](https://github.com/user-attachments/assets/79d9b018-9033-4943-a702-a18732b7f33c)

## Tech Stack

**Frontend**

- React
- Vite
- Mantine

**Backend**

- Node.js / Express
- Redis
- MongoDB Atlas
- Spotify Web API

**Infrastructure**

- AWS EC2
- Amazon ECR
- Docker
- Nginx
- Cloudflare

## Architecture

```text
React / Vite SPA
       │
       ▼
     Nginx
       │
       ▼
  Express API
   ├── Redis ───── Session state
   ├── MongoDB ─── User high scores
   ├── Song catalog
   └── Spotify ─── OAuth + track metadata
```

The React client communicates with an Express API running behind Nginx. Redis stores session state for authenticated users, while MongoDB persists each user's highest streak by artist and difficulty.

Spotify's Authorization Code flow handles authentication and provides access to track metadata and audio previews.

## How It Works

Each round:

1. Selects a song from the local artist catalog.
2. Retrieves the corresponding track through Spotify.
3. Obtains an audio preview for the track.
4. Plays a short snippet based on the selected difficulty.
5. Checks the player's guess and updates their streak.

Difficulty controls the snippet length:


| Difficulty | Snippet   |
| ---------- | --------- |
| Easy       | 3 seconds |
| Medium     | 2 seconds |
| Hard       | 1 second  |


Authenticated users can view their Spotify profile and save their highest streak for each artist and difficulty.

## API


| Endpoint                      | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `GET /api/login`              | Start Spotify OAuth flow                  |
| `GET /api/callback`           | Handle Spotify OAuth callback             |
| `GET /api/getTrackSnippet`    | Retrieve a random track and preview       |
| `GET /api/songNames/:artist`  | Retrieve song titles for autocomplete     |
| `GET /api/profile`            | Retrieve the authenticated user's profile |
| `GET /api/get-user-stats`     | Retrieve saved high scores                |
| `POST /api/update-high-score` | Update a user's high score                |


## Implementation Notes

Spotify's Web API does not consistently provide `preview_url` for tracks. When a preview is unavailable through the API, MelodyMatch retrieves the track's Spotify embed page and extracts its `audioPreview.url`.

The application uses HTTP-only session cookies so authentication state is not exposed directly to client-side JavaScript.

## Running Locally

### Backend

Create `backend/.env.development`:

```env
NODE_ENV=
PORT=3002
FRONTEND_URL=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:3002/api/callback
MONGO_URI=
SESSION_SECRET=
JWT_SECRET=
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_HOST=
REDIS_PORT=
```

Then run:

```bash
cd backend
npm install
npm run start:development
```



### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3002/api
VITE_LOGIN_URL=http://localhost:3002/api/login
```

Then run:

```bash
cd frontend
npm install
npm start
```

## Deployment

The production application runs on an **Ubuntu AWS EC2 instance**.

The backend is packaged as a Docker image and stored in **Amazon ECR**, while **Nginx** handles reverse proxying between the frontend and API. **Cloudflare** provides DNS and TLS termination.

The production Docker configuration expects the API on port `5001`.