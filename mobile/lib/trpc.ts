import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { clearSessionToken, saveSessionToken } from "./session";

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const loginUrl = `${apiUrl}/api/oauth/mobile/start?redirectUri=`;

export async function signInWithBrowser() {
  const redirectUri = Linking.createURL("oauth");
  const target = `${loginUrl}${encodeURIComponent(redirectUri)}`;
  const result = await WebBrowser.openAuthSessionAsync(target, redirectUri);
  if (result.type !== "success" || !result.url) return false;
  const parsed = Linking.parse(result.url);
  const token = typeof parsed.queryParams?.token === "string" ? parsed.queryParams.token : null;
  if (!token) return false;
  await saveSessionToken(token);
  return true;
}

export async function signOutMobile() {
  await clearSessionToken();
}
