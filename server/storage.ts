import { 
  users, 
  userProgress,
  languageProgress,
  streaks,
  achievements,
  type User, 
  type InsertUser 
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: { email: string; password: string; name?: string; role?: string }): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | undefined>;
  getUserXP(userId: number): Promise<{ xp: number; level: number }>;
  addUserXP(userId: number, amount: number, source?: string): Promise<{ xp: number; level: number; leveledUp: boolean }>;
  getUserLanguageProgress(userId: number): Promise<Record<string, number>>;
  updateLanguageProgress(userId: number, language: string, progress: number): Promise<void>;
  getUserAchievements(userId: number): Promise<string[]>;
  getUserStreak(userId: number): Promise<number>;
  updateStreak(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(data: { email: string; password: string; name?: string; role?: string }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role || "learner",
      })
      .returning();
    
    // Initialize user progress
    await db.insert(userProgress).values({ userId: user.id, xp: 0, level: 1 });
    
    // Initialize streak with yesterday's date so first practice increments to 1
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await db.insert(streaks).values({ userId: user.id, count: 0, lastUpdate: yesterday });
    
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : undefined;
  }

  async getUserXP(userId: number): Promise<{ xp: number; level: number }> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    if (!progress) {
      const [newProgress] = await db.insert(userProgress).values({ userId, xp: 0, level: 1 }).returning();
      return { xp: newProgress.xp, level: newProgress.level };
    }
    return { xp: progress.xp, level: progress.level };
  }

  async addUserXP(userId: number, amount: number, source?: string): Promise<{ xp: number; level: number; leveledUp: boolean }> {
    const current = await this.getUserXP(userId);
    const newXP = current.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > current.level;
    
    await db
      .update(userProgress)
      .set({ xp: newXP, level: newLevel, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId));
    
    return { xp: newXP, level: newLevel, leveledUp };
  }

  async getUserLanguageProgress(userId: number): Promise<Record<string, number>> {
    const progressRows = await db
      .select()
      .from(languageProgress)
      .where(eq(languageProgress.userId, userId));
    
    const result: Record<string, number> = {};
    for (const row of progressRows) {
      result[row.language] = row.progress;
    }
    return result;
  }

  async updateLanguageProgress(userId: number, language: string, progress: number): Promise<void> {
    const [existing] = await db
      .select()
      .from(languageProgress)
      .where(and(eq(languageProgress.userId, userId), eq(languageProgress.language, language)));
    
    if (existing) {
      await db
        .update(languageProgress)
        .set({ progress, updatedAt: new Date() })
        .where(and(eq(languageProgress.userId, userId), eq(languageProgress.language, language)));
    } else {
      await db.insert(languageProgress).values({ userId, language, progress });
    }
  }

  async getUserAchievements(userId: number): Promise<string[]> {
    const rows = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
    return rows.map(row => row.achievementKey);
  }

  async getUserStreak(userId: number): Promise<number> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    if (!streak) {
      // Initialize streak with past date so first update can increment
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await db.insert(streaks).values({ userId, count: 0, lastUpdate: yesterday });
      return 0;
    }
    
    const today = new Date().toDateString();
    const lastUpdate = new Date(streak.lastUpdate).toDateString();
    
    if (today === lastUpdate) {
      return streak.count;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastUpdate === yesterday.toDateString()) {
      return streak.count;
    }
    
    return 0;
  }

  async updateStreak(userId: number): Promise<number> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    const today = new Date();
    
    if (!streak) {
      const [newStreak] = await db
        .insert(streaks)
        .values({ userId, count: 1, lastUpdate: today })
        .returning();
      return newStreak.count;
    }
    
    const lastUpdate = new Date(streak.lastUpdate).toDateString();
    const todayStr = today.toDateString();
    
    if (todayStr === lastUpdate) {
      return streak.count;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastUpdate === yesterday.toDateString()) {
      const newCount = streak.count + 1;
      await db
        .update(streaks)
        .set({ count: newCount, lastUpdate: today })
        .where(eq(streaks.userId, userId));
      return newCount;
    }
    
    await db
      .update(streaks)
      .set({ count: 1, lastUpdate: today })
      .where(eq(streaks.userId, userId));
    return 1;
  }
}

export const storage = new DatabaseStorage();
