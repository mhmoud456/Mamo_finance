services:
  - type: web
    name: mamo-finance
    env: node
    plan: free
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: AUTH_PROVIDER
        value: supabase
      - key: PUBLIC_APP_ORIGIN
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: VITE_APP_ID
        sync: false
      - key: OAUTH_SERVER_URL
        sync: false
      - key: VITE_OAUTH_PORTAL_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: EXPO_PUBLIC_API_URL
        sync: false
