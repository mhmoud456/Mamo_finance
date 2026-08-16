import { describe, expect, it } from "vitest";

describe("EXPO_TOKEN", () => {
  it("authenticates with a protected Expo projects endpoint", async () => {
    const token = process.env.EXPO_TOKEN;
    expect(token, "EXPO_TOKEN must be configured").toBeTruthy();
    const response = await fetch("https://api.expo.dev/v2/projects?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status, `Expo API returned ${response.status}`).not.toBe(401);
    expect(response.status, `Expo API returned ${response.status}`).not.toBe(403);
  }, 20_000);
});
