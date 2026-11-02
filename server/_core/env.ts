const readEnv = (name: string): string => process.env[name]?.trim() ?? "";

export const ENV = {
  appId: readEnv("VITE_APP_ID"),
  cookieSecret: readEnv("JWT_SECRET"),
  databaseUrl: readEnv("DATABASE_URL"),
  oAuthServerUrl: readEnv("OAUTH_SERVER_URL"),
  ownerOpenId: readEnv("OWNER_OPEN_ID"),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: readEnv("BUILT_IN_FORGE_API_URL"),
  forgeApiKey: readEnv("BUILT_IN_FORGE_API_KEY"),
  publicAppOrigin: readEnv("PUBLIC_APP_ORIGIN") || readEnv("VITE_PUBLIC_APP_ORIGIN") || "http://localhost:3000",
  oauthPortalUrl: readEnv("VITE_OAUTH_PORTAL_URL") || readEnv("OAUTH_PORTAL_URL") || "http://localhost:3000/api/auth/login",
  mobileDeepLinkScheme: readEnv("MOBILE_DEEP_LINK_SCHEME") || "sarfati://oauth",
};

export function validateEnv() {
  const requiredKeys = ["DATABASE_URL", "JWT_SECRET"] as const;
  const missing = requiredKeys.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.warn(`[env] Missing recommended configuration: ${missing.join(", ")}`);
  }

  return missing;
}
