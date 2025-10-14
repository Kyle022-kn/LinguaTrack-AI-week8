import "dotenv/config";
import express from "express";
import cors from "cors";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
  
  app.get("/api/auth/user/:id", async (req, res, next) => {
    const { handleGetUser } = await import("./routes/auth");
    return handleGetUser(req, res, next);
  });

  // AI Journal routes
  app.post("/api/ai/analyze-journal", async (req, res, next) => {
    const { handleAnalyzeJournal } = await import("./routes/ai-journal");
    return handleAnalyzeJournal(req, res, next);
  });

  app.post("/api/ai/generate-prompts", async (req, res, next) => {
    const { handleGeneratePrompts } = await import("./routes/ai-journal");
    return handleGeneratePrompts(req, res, next);
  });

  return app;
}
