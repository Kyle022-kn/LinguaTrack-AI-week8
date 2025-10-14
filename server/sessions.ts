import crypto from "crypto";

interface Session {
  userId: number;
  createdAt: number;
  expiresAt: number;
}

const sessions = new Map<string, Session>();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  
  sessions.set(token, {
    userId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  });
  
  return token;
}

export function validateSession(token: string): number | null {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return session.userId;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}, 60 * 60 * 1000);
