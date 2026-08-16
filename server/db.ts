import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, paymentMethods, transactions, budgets, financialGoals, recurringTransactions, userSettings } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }

const expenseDefaults = ["Food & Restaurants", "Transportation", "Shopping", "Bills & Utilities", "Health", "Education", "Entertainment", "Subscriptions", "Home", "Travel", "Personal Care", "Gifts", "Other"];
const incomeDefaults = ["Salary", "Freelance", "Business", "Gift", "Investment", "Other"];
const paymentDefaults = ["Cash", "Bank Account", "Debit Card", "Credit Card", "Digital Wallet", "Other"];
export async function ensureUserDefaults(userId: number) {
  const db = await getDb(); if (!db) return;
  const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.userId, userId)).limit(1);
  if (!existing.length) await db.insert(categories).values([...expenseDefaults.map(name => ({ userId, name, type: "EXPENSE" as const })), ...incomeDefaults.map(name => ({ userId, name, type: "INCOME" as const }))]);
  const payments = await db.select({ id: paymentMethods.id }).from(paymentMethods).where(eq(paymentMethods.userId, userId)).limit(1);
  if (!payments.length) await db.insert(paymentMethods).values(paymentDefaults.map(name => ({ userId, name })));
  await db.insert(userSettings).values({ userId }).onDuplicateKeyUpdate({ set: { userId } });
}

export { users, categories, paymentMethods, transactions, budgets, financialGoals, recurringTransactions, userSettings, eq, and, asc, desc, gte, lte, sql };
