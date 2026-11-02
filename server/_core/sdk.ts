import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "./auth-provider";

export type SupabaseUserInfo = {
  openId: string;
  email: string | null;
  name: string | null;
  platform?: string | null;
  loginMethod?: string | null;
};

export async function exchangeSupabaseCodeForSession(code: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;

  return {
    accessToken: data.session?.access_token ?? "",
    refreshToken: data.session?.refresh_token ?? "",
    expiresIn: data.session?.expires_in ?? 0,
    tokenType: data.session?.token_type ?? "bearer",
    user: data.user,
  };
}

export async function getSupabaseUserFromAccessToken(accessToken: string): Promise<SupabaseUserInfo> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) throw error;

  return {
    openId: data.user?.id ?? "",
    email: data.user?.email ?? null,
    name: data.user?.user_metadata?.full_name ?? data.user?.email ?? null,
    platform: "supabase",
    loginMethod: "supabase",
  };
}

export async function getSupabaseUserBySession(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  return {
    openId: data.user?.id ?? "",
    email: data.user?.email ?? null,
    name: data.user?.user_metadata?.full_name ?? data.user?.email ?? null,
    platform: "supabase",
    loginMethod: "supabase",
  };
}
