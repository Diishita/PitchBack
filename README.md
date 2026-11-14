# PitchBack

PitchBack is a cricket community portal concept for retired players. It helps players discover local matches, enroll, and find cricket and fitness recommendations.

## Features

- Browse and search matches by title or venue.
- Enroll in a match and provide player, emergency-contact, and accessibility details.
- Admin screens to manage matches and users, review enrollments, and view city statistics.
- English, Hindi, and Marathi interface options, plus light and dark themes.
- Voice-assisted navigation, search, and form dictation in supported browsers.
- Gemini-powered match recommendations and low-impact warm-up/cool-down suggestions.
- A persistent notification inbox for match, enrollment, and account events; notifications remain until dismissed.
- A public suggestion form whose submissions are saved for administrators to review.

## Technology

- React 19 and Vite 8
- React Router
- Tailwind CSS
- Recharts
- Google GenAI SDK
- Express and MongoDB/Mongoose
- Zod request validation
- Socket.IO realtime notifications

## Run locally

Use Node.js 20.19 or newer in the 20.x series, or 22.12 or newer. Install dependencies:

```sh
npm install
```

Configure MongoDB and authentication before starting the API:

1. If this is a fresh checkout with no `.env` file, copy `.env.example` to `.env`.
2. Set `MONGODB_URI` in `.env` to your MongoDB connection string and keep `PORT=5000`, unless you also update the Vite API proxy.
3. Set `SESSION_SECRET` to a private random value of at least 32 characters. Generate one with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

4. To create the first administrator, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. Use a unique email and any non-empty password up to 72 UTF-8 bytes. On the first API start, the administrator is created with a bcrypt-hashed password. Remove both bootstrap variables after the account is created; the account remains in MongoDB.
5. Never commit `.env` or share its values.

To reset an existing administrator password, set `ADMIN_EMAIL` to the exact administrator email and `ADMIN_PASSWORD` to the new password in `.env`, then run `npm run admin:reset-password`. The command only resets a matching existing administrator; it does not create or promote accounts. Remove the bootstrap variables after the reset.

Run the API and frontend in separate terminals:

```sh
npm run server:watch
```

```sh
npm run dev
```

The API health check is available at `http://127.0.0.1:5000/api/health`; the frontend is served at the URL Vite prints in its terminal.

## Run with Docker

Install Docker Desktop, make sure the project-root `.env` contains a working `MONGODB_URI` and `SESSION_SECRET`, then run:

```sh
docker compose up --build
```

Open `http://127.0.0.1:5173`. Compose runs the API and Vite frontend in separate containers, waits for the API health check, and uses the configured MongoDB database. Both published ports are limited to the local machine. Stop the containers with `Ctrl+C`; run `docker compose down` to remove them.

If those ports are already in use, choose alternate host ports in PowerShell before starting Compose:

```powershell
$env:API_PUBLISHED_PORT = "5001"
$env:WEB_PUBLISHED_PORT = "5174"
docker compose up --build
```

Then open `http://127.0.0.1:5174`.

## API

The Vite development server proxies `/api` and Socket.IO requests to the local Express server. Socket.IO broadcasts match-list changes to connected visitors and sends private notification-change signals to their intended authenticated recipients. Notifications are stored in MongoDB until dismissed; notification records contain only safe summaries, never emergency or medical enrollment details.

Notifications are triggered when matches are added, updated, or cancelled; when an enrollment is submitted, updated, or cancelled; when an account is created, blocked, restored, or removed; and when a visitor submits a suggestion. New enrollment, suggestion, and account events are sent to administrators, while enrollment and account updates are sent to the affected player.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API and database connection |
| POST | `/api/auth/register` | Create a regular user account |
| POST | `/api/auth/login`, `/api/auth/logout` | Start or end a server-side session |
| GET | `/api/auth/me` | Read the current session user |
| GET, POST | `/api/matches` | List matches or create one (admin only for create) |
| GET, PATCH, DELETE | `/api/matches/:id` | Read a match or manage it (admin only for changes) |
| GET, POST | `/api/enrollments` | Read your enrollments or create one (admin can read all) |
| PATCH, DELETE | `/api/enrollments/:id` | Update or delete an enrollment (admin only) |
| GET | `/api/users` | List users (admin only) |
| PATCH, DELETE | `/api/users/:id/block`, `/api/users/:id` | Block or delete a user (admin only) |
| GET | `/api/notifications` | List the signed-in user's notifications |
| DELETE | `/api/notifications/:id` | Dismiss one of the signed-in user's notifications |
| POST | `/api/suggestions` | Submit a suggestion (public, limited to five per IP every 15 minutes) |
| GET | `/api/suggestions` | Review suggestions (admin only) |
| PATCH | `/api/suggestions/:id/status` | Mark a suggestion as reviewed or new (admin only) |
| POST | `/api/ai/match-recommendation`, `/api/ai/fitness-advice` | Generate Gemini recommendations on the server |

Passwords are bcrypt-hashed; sessions are stored in MongoDB and use an HttpOnly cookie. Production sessions require HTTPS and use credentialed CORS restricted to `FRONTEND_ORIGINS`. New registrations always receive the `user` role. The admin role can only be assigned by the private first-admin bootstrap settings. Enrollment requests take their user ID from the authenticated session, not from client input. Deleting a match or user also removes associated enrollments.

Suggestions are stored in MongoDB with a new/reviewed status and can only be viewed or updated by administrators. GitHub Actions runs lint, tests, and a production build on pushes and pull requests targeting `main`; see `.github/workflows/ci.yml`.

**Use fictional test data for the project demo.** Enrollment records include emergency and medical information. The local Compose ports are bound to `127.0.0.1`; a hosted deployment must use HTTPS and private environment variables.

## Deploy on Vercel

The Vercel deployment serves the Vite frontend, REST API, and Socket.IO endpoint from the same project. The API uses a Vercel Function, while Socket.IO uses Vercel Functions' WebSocket support. A MongoDB Socket.IO adapter shares change events between function instances using the existing Atlas replica set.

1. Import this repository into Vercel as a Vite project. Use the repository root, build command `npm run build`, and output directory `dist`.
2. Set these server-side environment variables in Vercel for the Production environment:
   - `MONGODB_URI` to the private Atlas connection string
   - `SESSION_SECRET` to a newly generated random value of at least 32 bytes
   - `FRONTEND_ORIGINS` to the exact production URL, including `https://` and without a trailing slash
   - `GEMINI_API_KEY` if Gemini recommendations should be enabled

   Do not prefix secrets with `VITE_`, and do not commit them. Leave `VITE_API_URL` unset so the frontend uses same-origin API routes.
3. Configure Atlas Network Access for Vercel's outbound traffic. The current-IP entry for a developer laptop does not permit Vercel Functions to connect. Vercel Static IPs are available on Pro and Enterprise plans; add those egress addresses to Atlas. Avoid `0.0.0.0/0`, which allows connections from any IP.
4. Redeploy after setting environment variables. Verify `/api/health`, signup/login, match loading, admin actions, enrollment access, and the Socket.IO connection. Vercel WebSocket connections are duration-limited; the client reconnects and reloads application data when a connection is restored.

## Checks

```sh
npm run lint
npm test
npm run build
```

The tests cover match-search helpers, password and request validation, API health and authorization behavior, CORS allowlisting, AI configuration errors, and realtime event payloads.

## Gemini configuration

Gemini requests are sent through the API. Set the private `GEMINI_API_KEY` in the API host's environment; do not use a `VITE_` prefix, because Vite exposes those variables to browser code. For local Docker development, add `GEMINI_API_KEY` to your ignored project-root `.env` file. The AI panel explains that submitted text is processed by Google Gemini; avoid names, contact details, and sensitive medical information. AI output is not medical advice.

## Current project limitations

- Matches, enrollments, user accounts, and sessions are stored in MongoDB. Theme and language preferences remain in this browser's `localStorage`.
- Email verification and password recovery are not implemented.
- Existing match and enrollment data in `localStorage` is not automatically migrated to MongoDB.
- Existing demo accounts are not migrated; create regular accounts through the sign-up form and bootstrap an administrator with the private `.env` settings.
- The contact suggestion form is currently a UI-only demo and does not save submissions.

Email verification and password recovery are also not implemented. Treat hosted deployments as a project demo, use fictional enrollment data, and do not present this as a production service for real player medical records.
