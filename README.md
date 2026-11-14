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

Configure MongoDB before starting the API:

1. If this is a fresh checkout with no `.env` file, copy `.env.example` to `.env`.
2. Set `MONGODB_URI` in `.env` to your MongoDB connection string. Never commit this file or share the URI.
3. Keep `PORT=5000`, unless you also update the Vite API proxy.

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
| GET, POST | `/api/matches` | List or create matches |
| GET, PATCH, DELETE | `/api/matches/:id` | Read, update, or delete a match |
| GET, POST | `/api/enrollments` | List or create enrollments |
| PATCH, DELETE | `/api/enrollments/:id` | Update or delete an enrollment |

Deleting a match also removes its enrollments. Request bodies are validated and API errors include an HTTP status and JSON error message.

**Phase 2 is intentionally local-development only.** The API binds to `127.0.0.1` and refuses to start in production until Phase 3 adds server-side authentication and authorization. Enrollment records include emergency and medical information; use fictional test data only, and do not expose this API to a network.

## Checks

```sh
npm run lint
npm test
npm run build
```

The tests cover match-search helpers, API request validation, and API health/routing behavior.

## Gemini configuration

The current frontend reads `VITE_GEMINI_API_KEY` for Gemini features. For local development, set it in an ignored local environment file such as `.env.local`:

```text
VITE_GEMINI_API_KEY=your-key
```

Never commit a real key. Vite exposes variables prefixed with `VITE_` to browser code, so this client-side setup is for a local project demo only; it is not suitable for protecting a production API key. The Gemini requests should move behind a server-side API before production deployment.

## Current project limitations

- Matches and enrollments are stored in MongoDB when the local API is configured. User profiles, login state, theme, and language are still stored in this browser's `localStorage`.
- Login and role checks are demonstration-only and are not secure authentication.
- The API does not yet authenticate users or authorize admin actions; that is Phase 3 work.
- Existing match and enrollment data in `localStorage` is not automatically migrated to MongoDB.
- The Gemini feature calls the provider from the browser, as described above.

These are known limitations of the current project and it should not be represented as production-ready full-stack functionality.
