import { describe, expect, it } from "vitest";
import { createPinRecord, clearToken, readToken, saveToken } from "../mobile/lib/session-core";
import { isValidPin } from "../mobile/lib/pin";

const storage = new Map<string, string>();
const fakeStorage = {
  get: async (key: string) => storage.get(key) ?? null,
  set: async (key: string, value: string) => { storage.set(key, value); },
  remove: async (key: string) => { storage.delete(key); },
};
const digest = async (value: string) => Buffer.from(value).toString("hex");

describe("mobile session security", () => {
  it("accepts only 4 to 8 digit PIN values", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin(" 12345678 ")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("123456789")).toBe(false);
    expect(isValidPin("12a4")).toBe(false);
  });

  it("saves and clears a bearer session through the storage contract", async () => {
    await saveToken(fakeStorage, "session", "token-123");
    expect(await readToken(fakeStorage, "session")).toBe("token-123");
    await clearToken(fakeStorage, "session");
    expect(await readToken(fakeStorage, "session")).toBeNull();
  });

  it("creates a one-way PIN record and verifies correct or incorrect values", async () => {
    const record = await createPinRecord("1234", "salt-1", digest, 4);
    expect(record.hash).not.toContain("1234");
    const verify = async (value: string) => {
      const candidate = await createPinRecord(value, record.salt, digest, record.rounds);
      return candidate.hash === record.hash;
    };
    expect(await verify("1234")).toBe(true);
    expect(await verify("9999")).toBe(false);
  });
});
