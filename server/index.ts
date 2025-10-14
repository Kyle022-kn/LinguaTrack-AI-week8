import "dotenv/config";
import express from "express";
import cors from "cors";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Disable caching for development
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", async (req, res, next) => {
    const { handleDemo } = await import("./routes/demo");
    return handleDemo(req, res, next);
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    const { handleRegister } = await import("./routes/auth");
    return handleRegister(req, res, next);
  });
  
  app.post("/api/auth/login", async (req, res, next) => {
    const { handleLogin } = await import("./routes/auth");
    return handleLogin(req, res, next);
  });

  app.post("/api/auth/logout", async (req, res, next) => {
    const { handleLogout } = await import("./routes/auth");
    return handleLogout(req, res, next);
  });
  
  app.get("/api/auth/user/:id", async (req, res, next) => {
    const { handleGetUser } = await import("./routes/auth");
    return handleGetUser(req, res, next);
  });

  // AI Journal routes (protected with auth and rate limiting)
  app.post("/api/ai/analyze-journal", async (req, res, next) => {
    const { requireAuth, rateLimit } = await import("./middleware/auth");
    const { handleAnalyzeJournal } = await import("./routes/ai-journal");
    return requireAuth(req, res, (err) => {
      if (err) return next(err);
      return rateLimit(10, 60000)(req, res, (err) => {
        if (err) return next(err);
        return handleAnalyzeJournal(req, res, next);
      });
    });
  });

  app.post("/api/ai/generate-prompts", async (req, res, next) => {
    const { requireAuth, rateLimit } = await import("./middleware/auth");
    const { handleGeneratePrompts } = await import("./routes/ai-journal");
    return requireAuth(req, res, (err) => {
      if (err) return next(err);
      return rateLimit(5, 60000)(req, res, (err) => {
        if (err) return next(err);
        return handleGeneratePrompts(req, res, next);
      });
    });
  });

  // AI Exercise routes (protected with auth and rate limiting - 15 requests/minute)
  app.use("/api/ai/exercises", async (req, res, next) => {
    const exerciseRouter = await import("./routes/ai-exercises");
    return exerciseRouter.default(req, res, next);
  });

  // Progress and XP routes (protected with auth)
  app.use("/api/progress", async (req, res, next) => {
    const progressRouter = await import("./routes/progress");
    return progressRouter.default(req, res, next);
  });

  return app;
}
