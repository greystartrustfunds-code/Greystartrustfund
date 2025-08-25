Production API setup

This project uses Vite's `import.meta.env.VITE_API_BASE_URL` to determine the API base URL in production.

Steps to configure production:

1. Option A (recommended): set VITE_API_BASE_URL in Vercel env vars

   - In your Vercel project, go to Settings → Environment Variables
   - Add `VITE_API_BASE_URL` with value `https://your-backend-host.com` (replace with your actual backend URL)
   - Redeploy the frontend

2. Option B: use Vercel rewrite (same-origin)
   - Add `vercel.json` at repo root with a rewrite for `/api/*` to your backend host (already added in repo). Edit `BACKEND_HOST` in `vercel.json`.
   - Redeploy the frontend

Verification:

- After deploying, open the app and attempt to log in. In DevTools → Network, ensure the request URL goes to either the backend host or `/api` which Vercel now rewrites.

Notes:

- Do not include secrets in the frontend env variable; use only the backend host URL.
- Keep local dev working: when `VITE_API_BASE_URL` is not set, the client falls back to `/api` and Vite proxy will forward to `http://localhost:5000` during development.
