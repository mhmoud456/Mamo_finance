import { beforeEach, describe, expect, it, vi } from "vitest";

const tables = {
  transactions: {},
  userSettings: {},
  budgets: {},
  financialGoals: {},
  categories: {},
  paymentMethods: {},
  recurringTransactions: {},
};
const data = new Map<object, any[]>();
const transactionRows = [
  { id: 1, userId: 7, amount: "10", currency: "USD", type: "EXPENSE", occurredAt: new Date(), categoryId: 1 },
  { id: 2, userId: 7, amount: "500", currency: "SYP", type: "INCOME", occurredAt: new Date(), categoryId: 1 },
  { id: 3, userId: 7, amount: "20", currency: "EUR", type: "EXPENSE", occurredAt: new Date(), categoryId: 1 },
];
data.set(tables.transactions, transactionRows);
data.set(tables.userSettings, [{ userId: 7, defaultCurrency: "SYP", usdToSypRate: "132" }]);
data.set(tables.budgets, [{ id: 11, userId: 7, name: "USD budget", amount: "20", currency: "USD", month: new Date().toISOString().slice(0, 7), categoryId: null }]);
data.set(tables.financialGoals, []);
data.set(tables.categories, []);
data.set(tables.paymentMethods, []);
data.set(tables.recurringTransactions, []);

function queryFor(rows: any[]) {
  const query: any = {
    then: (resolve: (value: any[]) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(rows).then(resolve, reject),
    where: () => query,
    orderBy: () => query,
    limit: () => query,
    groupBy: () => query,
  };
  return query;
}
const db = {
  select: () => ({ from: (table: object) => queryFor(data.get(table) ?? []) }),
};

vi.mock("./db", () => ({
  getDb: async () => db,
  ensureUserDefaults: async () => undefined,
  transactions: tables.transactions,
  userSettings: tables.userSettings,
  budgets: tables.budgets,
  financialGoals: tables.financialGoals,
  categories: tables.categories,
  paymentMethods: tables.paymentMethods,
  recurringTransactions: tables.recurringTransactions,
  eq: () => ({}), and: () => ({}), asc: () => ({}), desc: () => ({}), gte: () => ({}), lte: () => ({}), sql: () => ({}),
}));

const ctx = { user: { id: 7, openId: "routes-test", name: "Test", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} }, res: {} } as any;

describe("currency route behavior", () => {
  beforeEach(() => vi.resetModules());

  it("shows SYP and converts USD in transactions.list", async () => {
    const { appRouter } = await import("./routers");
    const rows = await appRouter.createCaller(ctx).transactions.list({ currency: "SYP" });
    expect(rows).toHaveLength(3);
    expect(rows.find(row => row.originalCurrency === "USD")?.amount).toBe("1320.00");
    expect(rows.find(row => row.originalCurrency === "EUR")?.convertedAmount).toBeNull();
  });

  it("converts USD budgets and their spending when SYP is selected", async () => {
    const { appRouter } = await import("./routers");
    const rows = await appRouter.createCaller(ctx).budgets.list({ month: new Date().toISOString().slice(0, 7), currency: "SYP" });
    expect(rows[0].amount).toBe("2640.00");
    expect(rows[0].spent).toBe(1320);
  });

  it("uses converted USD values in dashboard.summary", async () => {
    const { appRouter } = await import("./routers");
    const summary = await appRouter.createCaller(ctx).dashboard.summary({ currency: "SYP" });
    expect(summary.income).toBe(500);
    expect(summary.expenses).toBe(1320);
  });
});
