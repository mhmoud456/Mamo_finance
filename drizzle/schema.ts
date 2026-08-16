import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 120 }).notNull(),
  type: mysqlEnum("type", ["INCOME", "EXPENSE"]).notNull(),
  color: varchar("color", { length: 20 }).default("#0ea5e9").notNull(),
  icon: varchar("icon", { length: 40 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({ userTypeName: unique("categories_user_type_name").on(t.userId, t.type, t.name), userIdx: index("categories_user_idx").on(t.userId) }));

export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({ userIdx: index("payment_methods_user_idx").on(t.userId) }));

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  categoryId: int("categoryId").references(() => categories.id),
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  type: mysqlEnum("type", ["INCOME", "EXPENSE"]).notNull(),
  occurredAt: timestamp("occurredAt").notNull(),
  note: text("note"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({ userDateIdx: index("transactions_user_date_idx").on(t.userId, t.occurredAt), userTypeIdx: index("transactions_user_type_idx").on(t.userId, t.type), categoryIdx: index("transactions_category_idx").on(t.categoryId) }));

export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  categoryId: int("categoryId").references(() => categories.id),
  name: varchar("name", { length: 120 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({ userMonthIdx: index("budgets_user_month_idx").on(t.userId, t.month) }));

export const financialGoals = mysqlTable("financial_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 120 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 18, scale: 2 }).notNull(),
  currentAmount: decimal("currentAmount", { precision: 18, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({ userIdx: index("financial_goals_user_idx").on(t.userId) }));

export const recurringTransactions = mysqlTable("recurring_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  categoryId: int("categoryId").references(() => categories.id),
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  type: mysqlEnum("type", ["INCOME", "EXPENSE"]).notNull(),
  frequency: mysqlEnum("frequency", ["WEEKLY", "MONTHLY", "YEARLY"]).notNull(),
  nextDate: timestamp("nextDate").notNull(),
  note: text("note"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({ userDateIdx: index("recurring_user_date_idx").on(t.userId, t.nextDate) }));

export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  language: varchar("language", { length: 5 }).default("ar").notNull(),
  theme: varchar("theme", { length: 10 }).default("light").notNull(),
  defaultCurrency: varchar("defaultCurrency", { length: 3 }).default("SYP").notNull(),
  usdToSypRate: decimal("usdToSypRate", { precision: 18, scale: 4 }).default("132").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions), categories: many(categories), budgets: many(budgets), goals: many(financialGoals), recurring: many(recurringTransactions), paymentMethods: many(paymentMethods), settings: one(userSettings),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type FinancialGoal = typeof financialGoals.$inferSelect;
export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
