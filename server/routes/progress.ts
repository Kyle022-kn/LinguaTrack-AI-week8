import express from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

const router = express.Router();

// Get user progress and XP
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Get XP and level
    const xpData = await storage.getUserXP(userId);
    
    // Get language progress
    const languageProgress = await storage.getUserLanguageProgress(userId);
    
    // Get achievements
    const achievements = await storage.getUserAchievements(userId);
    
    res.json({
      xp: xpData.xp || 0,
      level: xpData.level || 1,
      languageProgress,
      achievements,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// Add XP to user
router.post("/add-xp", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { amount, source } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid XP amount" });
    }
    
    const result = await storage.addUserXP(userId, amount, source);
    
    res.json({
      xp: result.xp,
      level: result.level,
      leveledUp: result.leveledUp,
    });
  } catch (error) {
    console.error("Add XP error:", error);
    res.status(500).json({ error: "Failed to add XP" });
  }
});

// Update language progress
router.post("/update-language", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { language, progress } = req.body;
    
    if (!language || progress === undefined) {
      return res.status(400).json({ error: "Language and progress are required" });
    }
    
    await storage.updateLanguageProgress(userId, language, progress);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Update language progress error:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Get or update streak
router.get("/streak", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const streak = await storage.getUserStreak(userId);
    
    res.json({ streak });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ error: "Failed to get streak" });
  }
});

router.post("/streak", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const streak = await storage.updateStreak(userId);
    
    res.json({ streak });
  } catch (error) {
    console.error("Update streak error:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

export default router;
