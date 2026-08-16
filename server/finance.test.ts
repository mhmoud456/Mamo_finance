import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function ctx(): TrpcContext {
  return {
    user: { id: 7, openId: "finance-test", name: "Test", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("finance quick entry", () => {
  it("extracts amount and description from compact expense text", async () => {
    const result = await appRouter.createCaller(ctx()).transactions.quickParse({ text: "25 coffee" });
    expect(result).toEqual({ amount: 25, description: "coffee", needsConfirmation: true });
  });

  it("supports decimal amounts and leaves a confirmation step", async () => {
    const result = await appRouter.createCaller(ctx()).transactions.quickParse({ text: "12.50 lunch" });
    expect(result.amount).toBe(12.5);
    expect(result.description).toBe("lunch");
    expect(result.needsConfirmation).toBe(true);
  });
});

describe("natural language expense parsing", () => {
  it("extracts Arabic amount, currency, description and relative date", async () => {
    const result = await appRouter.createCaller(ctx()).assistant.parseExpense({ text: "أنفقت 75000 ليرة على العشاء أمس" });
    expect(result.amount).toBe(75000);
    expect(result.currency).toBe("SYP");
    expect(result.description).toContain("العشاء");
    expect(result.needsConfirmation).toBe(true);
    expect(result.occurredAt.getTime()).toBeLessThan(Date.now());
  });
});

describe("natural language classification", () => {
  it("suggests a food category for Arabic dinner text", async () => {
    const result = await appRouter.createCaller(ctx()).assistant.parseExpense({ text: "أنفقت 120 على العشاء" });
    expect(result.categoryHint).toBe("food");
    expect(result.needsConfirmation).toBe(true);
  });

  it("recognizes euros and yesterday in English", async () => {
    const result = await appRouter.createCaller(ctx()).assistant.parseExpense({ text: "Spent 14 EUR on taxi yesterday" });
    expect(result.currency).toBe("EUR");
    expect(result.categoryHint).toBe("transport");
    expect(result.occurredAt.getTime()).toBeLessThan(Date.now());
  });

  it("does not invent an amount when text has no number", async () => {
    const result = await appRouter.createCaller(ctx()).assistant.parseExpense({ text: "coffee with friends" });
    expect(result.amount).toBeNull();
    expect(result.needsConfirmation).toBe(true);
  });
});
