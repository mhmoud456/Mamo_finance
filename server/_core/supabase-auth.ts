import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuthProviderName = "manus" | "supabase";

export function resolveAuthProvider(): AuthProviderName {
  const raw = (process.env.AUTH_PROVIDER ?? "manus").trim().toLowerCase();
  return raw === "supabase" ? "supabase" : "manus";
}

export function isSupabaseAuthConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseAuthConfigured()) return null;
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getAuthProviderSummary() {
  const provider = resolveAuthProvider();

  if (provider === "supabase") {
    if (!isSupabaseAuthConfigured()) {
      return {
        provider,
        status: "needs-config",
        warning: "AUTH_PROVIDER=supabase requires SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
      };
    }

    return {
      provider,
      status: "ready",
      warning: null,
    };
  }

  return {
    provider: "manus",
    status: "legacy",
    warning: "Current auth flow still uses Manus OAuth and should be migrated to Supabase Auth before production deployment.",
  };
}

export function warnIfAuthProviderIsNotReady() {
  const summary = getAuthProviderSummary();

  if (summary.status === "needs-config") {
    console.warn(`[auth] ${summary.warning}`);
    return;
  }

  if (summary.status === "legacy") {
    console.warn(`[auth] ${summary.warning}`);
  }
}
