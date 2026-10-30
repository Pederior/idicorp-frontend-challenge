# IDICorp Service Console

A responsive React/Vite client for the IDICorp Front-End Engineer Assignment.

## Requirements
- Node.js 20+ (Node 18.18+ should also work)
- npm 9+

## Run locally
```bash
npm install
cp .env.example .env
npm run dev
```
Open the local URL printed by Vite. Build with `npm run build` and preview with `npm run preview`.

## Configuration
For local development, leave `VITE_API_BASE_URL` empty (as in `.env.example`). The Vite dev server proxies `/api` and `/ws` to `https://ts.idicorp.ir`, rewriting the upstream cookie domain so browser-managed HTTP-only session cookies can be used from `localhost`. This is a development-only proxy; it does not change the production API.

To point the client at a different API, set `VITE_API_BASE_URL` in `.env`. In production builds, the default API URL is `https://ts.idicorp.ir`. Do not put secrets in frontend environment variables.

The mock environment credentials in the assignment are `admin` / `admin`. The login API provides a CAPTCHA and salt; the exact returned salt is submitted with the answer.

## Included flows
- CAPTCHA-based login and logout
- Session-scoped task listing, search, completion filter, create, edit, complete and delete
- WebSocket calculator (add, subtract, multiply, divide)
- Persistent text echo WebSocket with connection status
- Streaming echo via `POST /api/echo/stream`
- Loading, validation, network and service error messages
- Responsive layout, keyboard-friendly controls and visible focus states

## Assumptions
- The API base URL is the production URL unless overridden by `VITE_API_BASE_URL`.
- Login returns `captcha` as a JPEG data URL and `salt`; successful login returns `access_token`.
- HTTP-only cookies are managed by the browser. Protected requests send credentials and a Bearer token.
- Tasks expire one hour after creation/update according to the service contract.
- WebSocket payloads follow the repository assignment README.


## Source structure

```text
src/
  App.jsx                 # Application shell, navigation, session state
  api.js                  # HTTP client and authentication headers
  components/
    common.jsx            # Shared UI and WebSocket hook
    Login.jsx             # Login and CAPTCHA
    Tasks.jsx             # Task list and CRUD operations
    tools/
      Calculator.jsx      # WebSocket calculator
      Echo.jsx            # WebSocket text echo
      StreamEcho.jsx      # HTTP streaming echo
  styles.css              # Global styles
```

Each feature is isolated in its own component file. Shared connection and error UI lives in `components/common.jsx`.
