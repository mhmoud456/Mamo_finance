import { randomUUID } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { COOKIE_NAME, OAUTH_STATE_COOKIE, decodeOAuthState, encodeOAuthState, ONE_YEAR_MS } from "@shared/const";

function getQueryParam(req: Request, key: string): string | undefined { const value = req.query[key]; return typeof value === "string" ? value : undefined; }

export const PUBLIC_APP_ORIGIN = ENV.publicAppOrigin.replace(/\/$/, "");

export function portalUrl() {
  const configured = process.env.VITE_OAUTH_PORTAL_URL?.trim() || process.env.OAUTH_PORTAL_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return ENV.oauthPortalUrl.replace(/\/$/, "");
}

export function mobileCallbackUrl() { return `${PUBLIC_APP_ORIGIN}/api/oauth/mobile/callback`; }

export function buildMobileOAuthUrl(callbackUri: string, state: string) {
  const url = new URL(portalUrl());
  url.searchParams.set("appId", ENV.appId || "demo-app-id");
  url.searchParams.set("redirectUri", callbackUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url;
}

function isMobileRedirect(value: string | undefined): value is string {
  const allowedPrefix = (ENV.mobileDeepLinkScheme || "sarfati://oauth").replace(/\/$/, "");
  return Boolean(value && value.startsWith(allowedPrefix));
}

async function completeLogin(code: string, state: string, req: Request) {
  const tokenResponse = await sdk.exchangeCodeForToken(code, state);
  const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
  if (!userInfo.openId) throw new Error("openId missing from user info");
  await db.upsertUser({ openId: userInfo.openId, name: userInfo.name || null, email: userInfo.email ?? null, loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null, lastSignedIn: new Date() });
  const sessionToken = await sdk.createSessionToken(userInfo.openId, { name: userInfo.name || "", expiresInMs: ONE_YEAR_MS });
  return { userInfo, sessionToken };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/mobile/start", (req: Request, res: Response) => {
    const mobileRedirect = getQueryParam(req, "redirectUri");
    if (!isMobileRedirect(mobileRedirect)) { res.status(400).json({ error: "redirectUri must be sarfati://oauth" }); return; }
    const nonce = randomUUID();
    const callbackUri = mobileCallbackUrl();
    const state = encodeOAuthState({ redirectUri: callbackUri, nonce, mobileRedirect } as any);
    res.cookie(OAUTH_STATE_COOKIE, nonce, { ...getSessionCookieOptions(req), maxAge: 10 * 60 * 1000 });
    res.redirect(302, buildMobileOAuthUrl(callbackUri, state).toString());
  });

  app.get("/api/oauth/mobile/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) { res.status(400).json({ error: "code and state are required" }); return; }
    const parsed = decodeOAuthState(state) as OAuthMobileState;
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!parsed.nonce || parsed.nonce !== expectedNonce || !isMobileRedirect(parsed.mobileRedirect)) { res.status(403).json({ error: "invalid mobile oauth state" }); return; }
    try {
      const { sessionToken } = await completeLogin(code, state, req);
      res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
      const redirect = new URL(parsed.mobileRedirect);
      redirect.searchParams.set("token", sessionToken);
      res.redirect(302, redirect.toString());
    } catch (error) { console.error("[OAuth] Mobile callback failed", error); res.status(500).json({ error: "Mobile OAuth callback failed" }); }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) { res.status(400).json({ error: "code and state are required" }); return; }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) { res.status(403).json({ error: "invalid oauth state" }); return; }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const { sessionToken } = await completeLogin(code, state, req);
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) { console.error("[OAuth] Callback failed", error); res.status(500).json({ error: "OAuth callback failed" }); }
  });
}

type OAuthMobileState = { redirectUri: string; nonce?: string; mobileRedirect?: string };
