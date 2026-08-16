import { describe, expect, it } from "vitest";
import { buildMobileOAuthUrl, mobileCallbackUrl, portalUrl, PUBLIC_APP_ORIGIN } from "./_core/oauth";

describe("mobile OAuth redirect configuration", () => {
  it("uses the permanent Mamo callback and never a temporary a.run.app host", () => {
    const callback = mobileCallbackUrl();
    expect(callback).toBe(`${PUBLIC_APP_ORIGIN}/api/oauth/mobile/callback`);
    expect(callback).toContain("https://financemgr-5wcippfv.manus.space/");
    expect(callback).not.toContain("a.run.app");
  });

  it("builds a Manus Location with the permanent callback query parameter", () => {
    const callback = mobileCallbackUrl();
    const location = new URL(buildMobileOAuthUrl(callback, "test-state").toString());
    expect(location.origin + location.pathname).toBe("https://manus.im/app-auth");
    expect(location.searchParams.get("redirectUri")).toBe(callback);
    expect(location.searchParams.get("redirectUri")).not.toContain("a.run.app");
    expect(location.searchParams.get("state")).toBe("test-state");
  });

  it("uses the Manus app-auth portal", () => {
    expect(portalUrl()).toBe("https://manus.im/app-auth");
  });
});

