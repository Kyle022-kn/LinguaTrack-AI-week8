import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/data/languages";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const STREAK_KEY = "ltai_streak";
const AVATAR_KEY = "ltai_avatar";
const PW_KEY = "ltai_password_hash";
const PRIVACY_KEY = "ltai_privacy";
const TWOFA_KEY = "ltai_2fa_enabled";
const TWOFA_CODES_KEY = "ltai_2fa_codes";

async function sha256Hex(text: string) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [privacy, setPrivacy] = useState<{ privateProfile: boolean; shareData: boolean; allowMessages: boolean }>({ privateProfile: false, shareData: false, allowMessages: true });
  const [twoFA, setTwoFA] = useState<boolean>(false);
  const streak = Number(localStorage.getItem(STREAK_KEY) || 7);

  useEffect(() => {
    try { const raw = localStorage.getItem(AVATAR_KEY); if (raw) setAvatar(raw); } catch {}
    try { const raw = localStorage.getItem(PRIVACY_KEY); if (raw) setPrivacy(JSON.parse(raw)); } catch {}
    try { const raw = localStorage.getItem(TWOFA_KEY); setTwoFA(raw === "true"); } catch {}
  }, []);

  const save = () => {
    if (!user) return;
    login({ email: user.email, password: "", role: user.role, name });
    toast.success("Profile updated");
  };

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setAvatar(url);
      localStorage.setItem(AVATAR_KEY, url);
      toast.success("Profile picture updated");
    };
    reader.readAsDataURL(file);
  };

  const changePassword = async () => {
    if (!user) return;
    if (newPw.length < 8) return toast.error("Password too short", { description: "Use at least 8 characters." });
    if (newPw !== confirmPw) return toast.error("Passwords do not match");
    const { updatePassword } = await import("@/lib/authStore");
    const ok = await updatePassword(user.email, currentPw, newPw);
    if (!ok) return toast.error("Current password is incorrect");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast.success("Password updated");
  };

  const toggleTwoFA = () => {
    const val = !twoFA; setTwoFA(val);
    localStorage.setItem(TWOFA_KEY, String(val));
    if (val) {
      const codes = Array.from({ length: 4 }).map(() => Math.random().toString(36).slice(2, 8).toUpperCase());
      localStorage.setItem(TWOFA_CODES_KEY, JSON.stringify(codes));
      toast.success("2FA enabled", { description: "Save your recovery codes." });
    } else {
      localStorage.removeItem(TWOFA_CODES_KEY);
      toast("2FA disabled");
    }
  };

  const savePrivacy = () => {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacy));
    toast.success("Privacy saved");
  };

  const resetProgress = () => {
    localStorage.removeItem(STREAK_KEY);
    toast("Progress reset", { description: "Streak and local stats cleared." });
  };

  const recoveryCodes: string[] = useMemo(() => {
    try { const raw = localStorage.getItem(TWOFA_CODES_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }, [twoFA]);

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-muted overflow-hidden shrink-0" style={avatar ? { backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
            <div className="grid gap-2 flex-1">
              <div className="grid gap-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={user?.email} readOnly />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input type="file" accept="image/*" onChange={onAvatar} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="secondary" onClick={logout}>Logout</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={changePassword}>Update password</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Security & Privacy</CardTitle></CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Two-factor authentication</div>
              <div className="text-xs text-muted-foreground">Add a second step to sign in</div>
            </div>
            <Switch checked={twoFA} onCheckedChange={toggleTwoFA} />
          </div>
          {twoFA && (
            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium mb-1">Recovery codes</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {recoveryCodes.map((c) => (<div key={c} className="rounded bg-muted px-2 py-1">{c}</div>))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Private profile</div>
              <div className="text-xs text-muted-foreground">Only visible to you</div>
            </div>
            <Switch checked={privacy.privateProfile} onCheckedChange={(v) => setPrivacy({ ...privacy, privateProfile: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Share anonymized data</div>
              <div className="text-xs text-muted-foreground">Help improve LinguaTrack</div>
            </div>
            <Switch checked={privacy.shareData} onCheckedChange={(v) => setPrivacy({ ...privacy, shareData: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Allow messages</div>
              <div className="text-xs text-muted-foreground">Receive friend requests</div>
            </div>
            <Switch checked={privacy.allowMessages} onCheckedChange={(v) => setPrivacy({ ...privacy, allowMessages: v })} />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={savePrivacy}>Save privacy</Button>
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
