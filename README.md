# Mamo Finance

## Local setup

This project was originally tied to a Manus-hosted backend and OAuth flow. The repository now supports environment-based configuration so it can run against your own backend and auth provider instead of a hardcoded host.

## Required environment values

Create a root `.env` file and, if needed, a `mobile/.env` file.

```bash
cp .env.example .env
cp mobile/.env.example mobile/.env
```

Required values include:

- `DATABASE_URL`
- `JWT_SECRET`
- `PUBLIC_APP_ORIGIN`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `EXPO_PUBLIC_API_URL`

For the next auth migration, also configure:

- `AUTH_PROVIDER` (`manus` or `supabase`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Run locally

```bash
pnpm install
pnpm dev
```

For the Expo app:

```bash
cd mobile
pnpm install
EXPO_PUBLIC_API_URL=http://localhost:3000 pnpm start
```

## Production deployment checklist

- Host the Node backend on Render/Railway/VPS
- Host MySQL/TiDB and set `DATABASE_URL`
- Set `PUBLIC_APP_ORIGIN` to the final public backend URL
- Configure OAuth provider and update `VITE_OAUTH_PORTAL_URL`
- Set `EXPO_PUBLIC_API_URL` to the production backend URL
- Build the APK with Expo EAS or a signed Android build

## Important note

The repository no longer hardcodes the Manus domain in the web or mobile runtime setup. The project is now prepared to switch auth providers through environment variables. The actual external service credentials still need to be supplied by your account.
