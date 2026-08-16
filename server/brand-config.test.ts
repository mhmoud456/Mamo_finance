import { describe, expect, it } from "vitest";

describe("Mamo brand configuration", () => {
  it("has the configured product title and logo", async () => {
    expect(process.env.VITE_APP_TITLE).toBe("Mamo Finance");
    expect(process.env.VITE_APP_LOGO).toContain("mamo-logo-concept_7a9b3925.png");

    const response = await fetch("http://localhost:3000/");
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toContain("Mamo Finance");
  });
});
