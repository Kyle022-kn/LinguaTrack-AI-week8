import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/data/languages";
import { useAuth, User } from "@/hooks/useAuth";

const JOURNAL_KEY = "ltai_journal";

type JournalEntry = { id: string; text: string; ts: number };

type OverviewStats = {
  totalUsers: number;
  weekNewUsers: number;
  journalCount: number;
  recent: { type: string; label: string; ts: number }[];
};

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    weekNewUsers: 0,
    journalCount: 0,
    recent: [],
  });
  const [users, setUsers] = useState<User[]>([] as any);
  const [q, setQ] = useState("");
  const [prompts, setPrompts] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { listUsers } = await import("@/lib/authStore");
      const us = listUsers();
      setUsers(us as any);

      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekNew = us.filter((u) => u.createdAt >= weekAgo).length;

      let journal: JournalEntry[] = [];
      try {
        const raw = localStorage.getItem(JOURNAL_KEY);
        if (raw) journal = JSON.parse(raw);
      } catch {}

      const recent = [
        ...us
          .slice(-5)
          .map((u) => ({
            type: "signup",
            label: `${u.email} joined`,
            ts: u.createdAt,
          })),
        ...journal
          .slice(0, 5)
          .map((e) => ({
            type: "journal",
            label: `Journal entry ${new Date(e.ts).toLocaleString()}`,
            ts: e.ts,
          })),
      ]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 10);

      setStats({
        totalUsers: us.length,
        weekNewUsers: weekNew,
        journalCount: journal.length,
        recent,
      });

      const p: Record<string, string> = {};
      for (const l of LANGUAGES) {
        const key = `ltai_prompt_${l.key}`;
        p[l.key] = localStorage.getItem(key) || "";
      }
      setPrompts(p);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users as any;
    return (users as any).filter(
      (u: any) =>
        u.email.toLowerCase().includes(s) ||
        (u.name || "").toLowerCase().includes(s),
    );
  }, [q, users]);

  const toggleRole = async (email: string) => {
    const { getUser, updateProfile } = await import("@/lib/authStore");
    const u = getUser(email);
    if (!u) return;
    const next = u.role === "admin" ? "learner" : "admin";
    updateProfile(email, { role: next });
    setUsers((prev) =>
      prev.map((x: any) => (x.email === email ? { ...x, role: next } : x)),
    );
  };

  const suspend = async (email: string, to: boolean) => {
    const { updateProfile } = await import("@/lib/authStore");
    updateProfile(email, { suspended: to } as any);
    setUsers((prev) =>
      prev.map((x: any) => (x.email === email ? { ...x, suspended: to } : x)),
    );
  };

  const remove = async (email: string) => {
    const { removeUser } = await import("@/lib/authStore");
    if (!confirm(`Delete account for ${email}?`)) return;
    removeUser(email);
    setUsers((prev) => prev.filter((x: any) => x.email !== email));
  };

  const savePrompt = (langKey: string) => {
    const key = `ltai_prompt_${langKey}`;
    localStorage.setItem(key, prompts[langKey] || "");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">
          Manage users, content, AI, and settings.
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-2xl font-bold">
                {stats.totalUsers}
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">New This Week</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-2xl font-bold">
                {stats.weekNewUsers}
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">AI Journals</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-2xl font-bold">
                {stats.journalCount}
              </CardContent>
            </Card>
            <Card className="rounded-2xl col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 grid gap-2">
                {stats.recent.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                )}
                {stats.recent.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-3 text-sm flex items-center justify-between"
                  >
                    <div className="font-medium">
                      {r.type === "signup" ? "New signup" : "Journal"}
                    </div>
                    <div className="text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">User Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by email or name"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No users found.
                  </div>
                )}
                {filtered.map((u: any) => (
                  <div
                    key={u.email}
                    className="rounded-xl border p-3 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                  >
                    <div className="sm:col-span-2">
                      <div className="font-medium">{u.name || u.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </div>
                    <div className="text-sm">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      Role: <span className="font-medium">{u.role}</span>
                      {u.suspended ? " (suspended)" : ""}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleRole(u.email)}
                      >
                        {u.role === "admin" ? "Make Learner" : "Make Admin"}
                      </Button>
                      <Button
                        size="sm"
                        variant={u.suspended ? "default" : "destructive"}
                        onClick={() => suspend(u.email, !u.suspended)}
                      >
                        {u.suspended ? "Unsuspend" : "Suspend"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => remove(u.email)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid gap-3">
            {LANGUAGES.map((l) => (
              <Card key={l.key} className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Prompt Template — {l.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 grid gap-2">
                  <Label htmlFor={`p_${l.key}`}>Instruction</Label>
                  <textarea
                    id={`p_${l.key}`}
                    className="min-h-24 rounded-md border bg-transparent p-2"
                    value={prompts[l.key] || ""}
                    onChange={(e) =>
                      setPrompts((prev) => ({
                        ...prev,
                        [l.key]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => savePrompt(l.key)}>
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Admin Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Theme and system settings can be adjusted in the app header. For
              multi-admin, use User Management to toggle roles.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
