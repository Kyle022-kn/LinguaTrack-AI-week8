import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/data/languages";
import { useState } from "react";
import { toast } from "sonner";

const STREAK_KEY = "ltai_streak";

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const streak = Number(localStorage.getItem(STREAK_KEY) || 7);

  const save = () => {
    if (!user) return;
    login({ email: user.email, password: "", role: user.role, name });
    toast.success("Profile updated");
  };

  const resetProgress = () => {
    localStorage.removeItem(STREAK_KEY);
    toast("Progress reset", { description: "Streak and local stats cleared." });
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={user?.email} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="secondary" onClick={logout}>Logout</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Stats</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border p-3"><div className="text-xl font-bold">{streak}</div><div className="text-xs text-muted-foreground">Day Streak</div></div>
          <div className="rounded-xl border p-3"><div className="text-xl font-bold">100</div><div className="text-xs text-muted-foreground">XP</div></div>
          <div className="rounded-xl border p-3"><div className="text-xl font-bold">4</div><div className="text-xs text-muted-foreground">Badges</div></div>
          <Button variant="ghost" className="col-span-3" onClick={resetProgress}>Reset local progress</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Languages</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => (
            <div key={l.key} className="rounded-xl border p-3">
              <div className="text-sm font-medium">{l.emoji} {l.name}</div>
              <div className="text-xs text-muted-foreground">Progress: {l.progress}%</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
