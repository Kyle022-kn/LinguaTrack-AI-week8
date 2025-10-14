import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("learner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const languageProgress = pgTable("language_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  language: varchar("language", { length: 50 }).notNull(),
  progress: integer("progress").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  count: integer("count").notNull().default(0),
  lastUpdate: timestamp("last_update").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementKey: varchar("achievement_key", { length: 100 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type LanguageProgress = typeof languageProgress.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
