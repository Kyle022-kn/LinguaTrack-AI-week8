import { RequestHandler } from "express";

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token || token.trim().length === 0) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    const { validateSession } = await import("../sessions");
    const userId = validateSession(token);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - Invalid or expired session" });
    }

    const { storage } = await import("../storage");
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    (req as any).userId = userId;
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number): RequestHandler => {
  return (req, res, next) => {
    const userId = (req as any).userId || req.ip || "anonymous";
    const now = Date.now();
    
    const userLimit = requestCounts.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      requestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }
    
    userLimit.count++;
    next();
  };
};
