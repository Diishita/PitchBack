# PitchBack

PitchBack is a cricket community portal concept for retired players. It helps players discover local matches, enroll, and find cricket and fitness recommendations.

## Features

- Browse and search matches by title or venue.
- Enroll in a match and provide player, emergency-contact, and accessibility details.
- Admin screens to manage matches and users, review enrollments, and view city statistics.
- English, Hindi, and Marathi interface options, plus light and dark themes.
- Voice-assisted navigation, search, and form dictation in supported browsers.
- Gemini-powered match recommendations and low-impact warm-up/cool-down suggestions.

## Technology

- React 19 and Vite 8
- React Router
- Tailwind CSS
- Recharts
- Google GenAI SDK
- Express and MongoDB/Mongoose
- Zod request validation

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

4. To create the first administrator, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. Use a unique email and a private password of at least 12 characters. On the first API start, the administrator is created with a bcrypt-hashed password. Remove both bootstrap variables after the account is created; the account remains in MongoDB.
5. Never commit `.env` or share its values.

Run the API and frontend in separate terminals:

```sh
npm run server:watch
```

```sh
npm run dev
```

The API health check is available at `http://127.0.0.1:5000/api/health`; the frontend is served at the URL Vite prints in its terminal.

## API

The Vite development server proxies `/api` requests to the local Express server.

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

Passwords are bcrypt-hashed; sessions are stored in MongoDB and use an HttpOnly, SameSite cookie. New registrations always receive the `user` role. The admin role can only be assigned by the private first-admin bootstrap settings. Enrollment requests take their user ID from the authenticated session, not from client input. Deleting a match or user also removes associated enrollments.

**The API is intentionally local-development only.** It binds to `127.0.0.1` and refuses to start in production. Enrollment records include emergency and medical information; use fictional test data only, and do not expose this API to a network.

## Checks

```sh
npm run lint
npm test
npm run build
```

The tests cover match-search helpers, password and request validation, and API health and authorization behavior.

## Gemini configuration

The current frontend reads `VITE_GEMINI_API_KEY` for Gemini features. For local development, set it in an ignored local environment file such as `.env.local`:

```text
VITE_GEMINI_API_KEY=your-key
```

Never commit a real key. Vite exposes variables prefixed with `VITE_` to browser code, so this client-side setup is for a local project demo only; it is not suitable for protecting a production API key. The Gemini requests should move behind a server-side API before production deployment.

## Current project limitations

- Matches, enrollments, user accounts, and sessions are stored in MongoDB. Theme and language preferences remain in this browser's `localStorage`.
- Email verification and password recovery are not implemented.
- Existing match and enrollment data in `localStorage` is not automatically migrated to MongoDB.
- Existing demo accounts are not migrated; create regular accounts through the sign-up form and bootstrap an administrator with the private `.env` settings.
- The Gemini feature calls the provider from the browser, as described above.

These are known limitations of the current project and it should not be represented as production-ready full-stack functionality.
