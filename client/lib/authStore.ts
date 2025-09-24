import { UserRole } from "@/hooks/useAuth";

export type StoredUser = {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: number;
};

const KEY = "ltai_users";

function load(): Record<string, StoredUser> {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function save(map: Record<string, StoredUser>) { localStorage.setItem(KEY, JSON.stringify(map)); }

export async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function addUser(args: { email: string; name: string; role: UserRole; password: string }) {
  const users = load();
  const email = args.email.toLowerCase();
  if (users[email]) throw new Error("Account already exists");
  const passwordHash = await sha256Hex(args.password);
  users[email] = { email, name: args.name, role: args.role, passwordHash, createdAt: Date.now() };
  save(users);
}

export async function verify(email: string, password: string) {
  const users = load();
  const u = users[email.toLowerCase()];
  if (!u) return null;
  const hash = await sha256Hex(password);
  if (hash !== u.passwordHash) return null;
  return u;
}

export function getUser(email: string) {
  const users = load();
  return users[email.toLowerCase()] || null;
}

export function updateProfile(email: string, patch: Partial<Omit<StoredUser, "email" | "passwordHash" | "createdAt">>) {
  const users = load();
  const key = email.toLowerCase();
  if (!users[key]) return false;
  users[key] = { ...users[key], ...patch } as StoredUser;
  save(users);
  return true;
}

export async function updatePassword(email: string, currentPassword: string, newPassword: string) {
  const users = load();
  const key = email.toLowerCase();
  const u = users[key];
  if (!u) return false;
  const cur = await sha256Hex(currentPassword);
  if (u.passwordHash && cur !== u.passwordHash) return false;
  users[key].passwordHash = await sha256Hex(newPassword);
  save(users);
  return true;
}
