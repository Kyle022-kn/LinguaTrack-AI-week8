import { RequestHandler } from "express";

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { storage } = await import("../storage");
    const { createSession } = await import("../sessions");
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await storage.createUser({
      email,
      password,
      name,
      role: "learner",
    });

    const sessionToken = createSession(user.id);
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      user: userWithoutPassword,
      sessionToken
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { storage } = await import("../storage");
    const { createSession } = await import("../sessions");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (!existingUser) {
      return res.status(401).json({ error: "No account found with this email address" });
    }

    const user = await storage.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: "Incorrect password. Please try again" });
    }

    const sessionToken = createSession(user.id);
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword,
      sessionToken
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const { storage } = await import("../storage");
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { deleteSession } = await import("../sessions");
      deleteSession(token);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
