# What to fix

1. **Don't send the answer to the client.** `/api/getTrackSnippet` returns `title`. Verify the guess on the server.
2. **Auth is split and leaky.** The callback puts the profile/score JWT on `/dashboard?token=…`, and the dashboard stores it in `localStorage`. The URL leaks via history, logs, and `Referer`; any script on the page can read `localStorage`; logout does not invalidate the token. Identify the user from the existing httpOnly Redis session instead. Also: Home is linked as `/Home` (route is `/home`), Login goes to `/stats`, OAuth `state` uses `Math.random`, and tokens are logged.
3. **Playback rules disagree.** Button disables at 1 play, the handler allows 2, and `<audio autoPlay>` starts the timer on its own. The ring is a `setInterval`, not the audio clock. `clearInterval;` never calls the function. `/game` dies on refresh because the track lives in router state.
4. **Artist names become file paths** (`songTitles/${artist}.json`) with no allowlist. Load the three catalogs at startup instead of `readFileSync` per request.
5. **Repo drift.** `.dockerignore` does not exclude env files, so images can contain secrets. Root `package.json` is Node 18 / Heroku; the image is Node 23. Frontend `package.json` is still a Create React App scaffold. CSS modules were only started (`autocomplete.module.css`).
6. **Deploy is manual.** Add a GitHub Action on `main` (or manual dispatch only) that builds the Vite app and copies it to Nginx, and builds the API image for `linux/amd64`, pushes it to ECR, and restarts the container on the existing EC2 instance. Keep secrets in Actions, not in the image. Leave Nginx and TLS certs out of the pipeline.

